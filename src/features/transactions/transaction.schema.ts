import { CREATE_TRANSACTION_TYPES, TRANSACTION_TYPES } from "./transaction.constants";
import type {
  CreateTransactionInput,
  CustomerDraft,
  SelectedTransactionItem,
  TransactionFieldErrors,
} from "./transaction.types";

const bigintIdPattern = /^[1-9][0-9]*$/;
const decimalPattern = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;
const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function optionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function isCreateType(value: unknown): value is CreateTransactionInput["transactionType"] {
  return CREATE_TRANSACTION_TYPES.includes(value as CreateTransactionInput["transactionType"]);
}

function validCalendarDate(value: string) {
  if (!calendarDatePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function composeCustomerAddress(customer: CustomerDraft) {
  return [
    customer.address.trim(),
    customer.subdistrict.trim(),
    customer.district.trim(),
    customer.province.trim(),
    customer.postalCode.trim(),
    customer.addressNote.trim(),
  ].filter(Boolean).join(" ");
}

export function validateCustomerStep(transactionType: string | null, customer: CustomerDraft) {
  const errors: TransactionFieldErrors = {};
  const name = customer.customerName.trim();
  const phone = customer.customerPhone.trim();

  if (!name || name.length > 150) errors.customerName = "กรุณาระบุชื่อลูกค้าไม่เกิน 150 ตัวอักษร";
  if (phone.length > 50) errors.customerPhone = "เบอร์โทรศัพท์ต้องไม่เกิน 50 ตัวอักษร";
  if (transactionType === TRANSACTION_TYPES.DELIVERY_EXCHANGE && !composeCustomerAddress(customer)) {
    errors.address = "กรุณาระบุที่อยู่สำหรับจัดส่ง";
  }
  if (customer.postalCode && !/^\d{5}$/.test(customer.postalCode)) {
    errors.postalCode = "รหัสไปรษณีย์ต้องมี 5 หลัก";
  }

  return errors;
}

export function validateItemsStep(transactionType: string | null, items: SelectedTransactionItem[]) {
  const errors: TransactionFieldErrors = {};
  if (!items.length) {
    errors.items = "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ";
    return errors;
  }

  const itemErrors: NonNullable<TransactionFieldErrors["itemErrors"]> = {};
  for (const item of items) {
    const current: NonNullable<TransactionFieldErrors["itemErrors"]>[string] = {};
    if (!Number.isInteger(item.quantity) || item.quantity < 1) current.quantity = "จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 1";
    if (transactionType === TRANSACTION_TYPES.BORROW_CYLINDER) {
      if (item.expectedReturnDate && !validCalendarDate(item.expectedReturnDate)) {
        current.expectedReturnDate = "วันที่คาดว่าจะคืนไม่ถูกต้อง";
      }
      if (!decimalPattern.test(item.depositAmount || "0.00")) {
        current.depositAmount = "เงินมัดจำต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง";
      }
    }
    if (Object.keys(current).length) itemErrors[item.product.id] = current;
  }
  if (Object.keys(itemErrors).length) errors.itemErrors = itemErrors;
  return errors;
}

export function buildCreateTransactionInput(
  transactionType: CreateTransactionInput["transactionType"],
  customer: CustomerDraft,
  selectedItems: SelectedTransactionItem[],
  note: string,
): CreateTransactionInput {
  const customerAddress = composeCustomerAddress(customer);
  return {
    transactionType,
    customerName: customer.customerName.trim(),
    ...(optionalText(customer.customerPhone) ? { customerPhone: customer.customerPhone.trim() } : {}),
    ...(customerAddress ? { customerAddress } : {}),
    ...(optionalText(note) ? { note: note.trim() } : {}),
    items: selectedItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      ...(optionalText(item.note) ? { note: item.note.trim() } : {}),
      ...(transactionType === TRANSACTION_TYPES.BORROW_CYLINDER && item.expectedReturnDate
        ? { expectedReturnDate: item.expectedReturnDate }
        : {}),
      ...(transactionType === TRANSACTION_TYPES.BORROW_CYLINDER
        ? { depositAmount: item.depositAmount || "0.00" }
        : {}),
    })),
  };
}

export function validateCreateTransactionInput(value: unknown):
  | { valid: true; input: CreateTransactionInput }
  | { valid: false; message: string; fieldErrors?: TransactionFieldErrors } {
  if (!value || typeof value !== "object") return { valid: false, message: "ข้อมูลรายการไม่ถูกต้อง" };
  const raw = value as Partial<CreateTransactionInput>;
  if (!isCreateType(raw.transactionType)) return { valid: false, message: "ประเภทรายการไม่ถูกต้อง" };

  const customerName = typeof raw.customerName === "string" ? raw.customerName.trim() : "";
  const customerPhone = optionalText(raw.customerPhone);
  const customerAddress = optionalText(raw.customerAddress);
  const note = optionalText(raw.note);
  const fieldErrors: TransactionFieldErrors = {};
  if (!customerName || customerName.length > 150) fieldErrors.customerName = "กรุณาระบุชื่อลูกค้าไม่เกิน 150 ตัวอักษร";
  if (customerPhone && customerPhone.length > 50) fieldErrors.customerPhone = "เบอร์โทรศัพท์ต้องไม่เกิน 50 ตัวอักษร";
  if (raw.transactionType === TRANSACTION_TYPES.DELIVERY_EXCHANGE && !customerAddress) {
    fieldErrors.address = "กรุณาระบุที่อยู่สำหรับจัดส่ง";
  }
  if (!Array.isArray(raw.items) || !raw.items.length) fieldErrors.items = "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ";

  const seen = new Set<string>();
  const items = Array.isArray(raw.items) ? raw.items.flatMap((rawItem) => {
    if (!rawItem || typeof rawItem !== "object") return [];
    const productId = typeof rawItem.productId === "string" ? rawItem.productId : "";
    const quantity = rawItem.quantity;
    if (!bigintIdPattern.test(productId) || !Number.isInteger(quantity) || Number(quantity) < 1 || seen.has(productId)) return [];
    seen.add(productId);

    if (raw.transactionType === TRANSACTION_TYPES.BORROW_CYLINDER) {
      const expectedReturnDate = optionalText(rawItem.expectedReturnDate);
      const depositAmount = optionalText(rawItem.depositAmount) ?? "0.00";
      if ((expectedReturnDate && !validCalendarDate(expectedReturnDate)) || !decimalPattern.test(depositAmount)) return [];
      return [{
        productId,
        quantity: Number(quantity),
        ...(expectedReturnDate ? { expectedReturnDate } : {}),
        depositAmount,
        ...(optionalText(rawItem.note) ? { note: String(rawItem.note).trim() } : {}),
      }];
    }
    return [{
      productId,
      quantity: Number(quantity),
      ...(optionalText(rawItem.note) ? { note: String(rawItem.note).trim() } : {}),
    }];
  }) : [];

  if (Array.isArray(raw.items) && items.length !== raw.items.length) {
    fieldErrors.items = "กรุณาตรวจสอบสินค้า จำนวน และข้อมูลการยืม";
  }
  if (Object.keys(fieldErrors).length) return { valid: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors };

  return {
    valid: true,
    input: {
      transactionType: raw.transactionType,
      customerName,
      ...(customerPhone ? { customerPhone } : {}),
      ...(customerAddress ? { customerAddress } : {}),
      ...(note ? { note } : {}),
      items,
    },
  };
}
