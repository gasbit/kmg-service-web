import type { Product, ProductPagination } from "@/features/products/product.types";
import type { CREATE_TRANSACTION_TYPES, TRANSACTION_STATUSES, TRANSACTION_TYPES } from "./transaction.constants";

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
export type CreateTransactionType = (typeof CREATE_TRANSACTION_TYPES)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[keyof typeof TRANSACTION_STATUSES];

export type TransactionCreateItem = {
  productId: string;
  quantity: number;
  note?: string;
  expectedReturnDate?: string;
  depositAmount?: string;
};

export type CreateTransactionInput = {
  transactionType: CreateTransactionType;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  note?: string;
  items: TransactionCreateItem[];
};

export type TransactionItem = {
  id: string;
  productId: string;
  productBrand: string;
  productWeightKg: string;
  quantity: number;
  unitPrice: string;
  costPrice: string;
  lineTotal: string;
  itemAction: string;
  note: string | null;
};

export type TransactionStatusLog = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: { id: string; name: string };
  changedAt: string;
  note: string | null;
};

export type TransactionDetail = {
  id: string;
  transactionNo: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  queueDate: string | null;
  queueNo: number | null;
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  totalAmount: string;
  note: string | null;
  createdBy: { id: string; name: string };
  items: TransactionItem[];
  statusLogs: TransactionStatusLog[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type CustomerDraft = {
  customerName: string;
  customerPhone: string;
  addressLabel: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  addressNote: string;
};

export type SelectedTransactionItem = {
  product: Product;
  quantity: number;
  expectedReturnDate: string;
  depositAmount: string;
  note: string;
};

export type TransactionFieldErrors = {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  postalCode?: string;
  items?: string;
  itemErrors?: Record<string, { quantity?: string; expectedReturnDate?: string; depositAmount?: string }>;
};

export type TransactionActionResult =
  | { ok: true; transaction: TransactionDetail }
  | { ok: false; code?: string; message: string; requestId?: string; fieldErrors?: TransactionFieldErrors };

export type TransactionProductSearchResult =
  | { ok: true; products: Product[]; pagination: ProductPagination }
  | { ok: false; message: string; requestId?: string };
