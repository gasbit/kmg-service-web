"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CartIcon,
  InfoIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  StorefrontIcon,
  TrashIcon,
  TruckIcon,
  UsersIcon,
} from "@/components/icon/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ProductImage } from "@/features/products/product-image";
import type { Product, ProductPagination } from "@/features/products/product.types";
import { THAI_PROVINCES } from "@/lib/constants/thai-provinces";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { createTransactionAction, searchTransactionProductsAction } from "./actions";
import {
  TRANSACTION_STEPS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
} from "./transaction.constants";
import {
  buildCreateTransactionInput,
  composeCustomerAddress,
  validateCustomerStep,
  validateItemsStep,
} from "./transaction.schema";
import type {
  CreateTransactionType,
  CustomerDraft,
  SelectedTransactionItem,
  TransactionFieldErrors,
  TransactionType,
} from "./transaction.types";

const money = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const typeOptions: Array<{
  description: string;
  icon: typeof TruckIcon;
  type: TransactionType;
}> = [
  {
    type: TRANSACTION_TYPES.DELIVERY_EXCHANGE,
    description: "จัดส่งแก๊สและรับถังเปล่า",
    icon: TruckIcon,
  },
  {
    type: TRANSACTION_TYPES.WALK_IN_EXCHANGE,
    description: "ลูกค้านำถังมาแลกที่ร้าน",
    icon: StorefrontIcon,
  },
  {
    type: TRANSACTION_TYPES.BORROW_CYLINDER,
    description: "ยืมถังแก๊สและระบุเงื่อนไขต่อสินค้า",
    icon: UsersIcon,
  },
  {
    type: TRANSACTION_TYPES.RETURN_CYLINDER,
    description: "เลือกรายการยืมเดิมเพื่อบันทึกการคืน",
    icon: RefreshIcon,
  },
  {
    type: TRANSACTION_TYPES.BUY_FULL_TANK,
    description: "ซื้อถังเต็มโดยไม่มีถังเปล่ามาแลก",
    icon: CartIcon,
  },
];

const initialCustomer: CustomerDraft = {
  customerName: "",
  customerPhone: "",
  addressLabel: "",
  address: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  addressNote: "",
};

function primaryImage(product: Product) {
  return product.images.find((image) => image.isPrimary)
    ?? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
    ?? null;
}

function productPrice(product: Product, type: TransactionType | null) {
  if (type === TRANSACTION_TYPES.BUY_FULL_TANK) return Number(product.fullTankPrice);
  if (type === TRANSACTION_TYPES.BORROW_CYLINDER) return 0;
  return Number(product.exchangeSalePrice);
}

function Field({
  children,
  error,
  label,
  optional,
}: {
  children: ReactNode;
  error?: string;
  label: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {optional ? <span className="text-xs text-slate-400">ไม่บังคับ</span> : null}
      </div>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  );
}

function SectionHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-extrabold text-[#071a43]" tabIndex={-1}>{title}</h2>
      <p className="mt-1.5 text-sm font-medium text-slate-500">{description}</p>
    </div>
  );
}

function TransactionTypeStep({
  onSelect,
  selected,
}: {
  onSelect: (type: TransactionType) => void;
  selected: TransactionType | null;
}) {
  return (
    <section aria-labelledby="transaction-type-heading" className="wizard-step-enter">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-[#071a43]" id="transaction-type-heading" tabIndex={-1}>
          เลือกประเภทรายการ
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">กรุณาเลือกประเภทรายการที่ต้องการทำ</p>
      </div>
      <fieldset className="mx-auto mt-8 max-w-5xl">
        <legend className="sr-only">ประเภทรายการ</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {typeOptions.map((option, index) => {
            const Icon = option.icon;
            const active = option.type === selected;
            return (
              <label
                className={cn(
                  "group relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border bg-white px-5 py-6 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-950/8 focus-within:ring-4 focus-within:ring-blue-100 motion-reduce:hover:translate-y-0",
                  active ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200",
                  index < 3 ? "lg:col-span-2" : index === 3 ? "lg:col-span-2 lg:col-start-2" : "lg:col-span-2",
                )}
                key={option.type}
              >
                <input
                  checked={active}
                  className="sr-only"
                  name="transactionType"
                  onChange={() => onSelect(option.type)}
                  type="radio"
                  value={option.type}
                />
                <span
                  className={cn(
                    "grid size-16 place-items-center rounded-2xl transition-colors",
                    active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                  )}
                >
                  <Icon className="size-8" />
                </span>
                <span className="mt-5 text-lg font-bold text-[#071a43]">
                  {TRANSACTION_TYPE_LABELS[option.type]}
                </span>
                <span className="mt-1.5 text-sm leading-6 text-slate-500">{option.description}</span>
                {active ? <span className="absolute right-3 top-3 size-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" /> : null}
              </label>
            );
          })}
        </div>
      </fieldset>
      {selected === TRANSACTION_TYPES.RETURN_CYLINDER ? (
        <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <p><strong>การคืนถังต้องอ้างอิงรายการยืมเดิม</strong><br />ขั้นตอนถัดไปจะพาไปเลือกรายการยืมที่ยังคืนไม่ครบ</p>
        </div>
      ) : null}
    </section>
  );
}

function CustomerStep({
  customer,
  errors,
  onChange,
  transactionType,
}: {
  customer: CustomerDraft;
  errors: TransactionFieldErrors;
  onChange: (field: keyof CustomerDraft, value: string) => void;
  transactionType: TransactionType;
}) {
  const invalidClass = "border-red-300 focus-within:border-red-500 focus-within:ring-red-100";
  return (
    <section aria-labelledby="customer-step-heading" className="wizard-step-enter">
      <div id="customer-step-heading"><SectionHeading description={transactionType === TRANSACTION_TYPES.DELIVERY_EXCHANGE ? "กรอกข้อมูลลูกค้าและที่อยู่สำหรับจัดส่ง" : "กรอกข้อมูลลูกค้าสำหรับบันทึกเป็นข้อมูล ณ เวลาทำรายการ"} title="ข้อมูลลูกค้า" /></div>
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section aria-labelledby="customer-information-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="flex items-center gap-3 text-lg font-bold text-[#071a43]" id="customer-information-heading">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><UsersIcon className="size-5" /></span>
            ข้อมูลลูกค้า
          </h3>
          <div className="mt-6 flex flex-wrap gap-5">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-800">
              <input checked className="size-4 accent-blue-600" name="customerMode" readOnly type="radio" />
              ลูกค้าใหม่
            </label>
            <label aria-describedby="existing-customer-description" className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 text-sm font-semibold text-slate-400">
              <input className="size-4" disabled name="customerMode" type="radio" />
              ลูกค้าเดิม
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">ยังไม่เปิดใช้งาน</span>
            </label>
          </div>
          <p className="sr-only" id="existing-customer-description">ระบบค้นหาลูกค้าเดิมยังไม่เปิดใช้งานใน MVP</p>
          <div className="mt-4">
            <Field label="ค้นหาลูกค้า">
              <Input disabled leftIcon={<SearchIcon className="size-5" />} placeholder="ค้นหาด้วยชื่อ เบอร์โทร หรือเลขเอกสาร" wrapperClassName="h-12 bg-slate-50" />
            </Field>
          </div>
          <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">ข้อมูลที่บันทึกได้</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
              <Field label="ประเภทเอกสาร">
                <Select aria-describedby="document-disabled-copy" className="h-12 bg-slate-50" disabled>
                  <option>ยังไม่รองรับใน MVP</option>
                </Select>
              </Field>
              <Field label="เลขที่เอกสาร">
                <Input aria-describedby="document-disabled-copy" disabled placeholder="ยังไม่รองรับใน MVP" wrapperClassName="h-12 bg-slate-50" />
              </Field>
            </div>
            <p className="sr-only" id="document-disabled-copy">ข้อมูลเอกสารยังไม่มี API สำหรับบันทึก</p>
            <div className="sm:col-span-2">
              <Field error={errors.customerName} label="ชื่อ-นามสกุล / ชื่อลูกค้า">
                <Input
                  aria-invalid={Boolean(errors.customerName)}
                  autoComplete="name"
                  onChange={(event) => onChange("customerName", event.target.value)}
                  placeholder="กรอกชื่อ-นามสกุลหรือชื่อร้าน"
                  value={customer.customerName}
                  wrapperClassName={cn("h-12", errors.customerName && invalidClass)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field error={errors.customerPhone} label="เบอร์โทรศัพท์" optional>
                <Input
                  aria-invalid={Boolean(errors.customerPhone)}
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={(event) => onChange("customerPhone", event.target.value)}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  value={customer.customerPhone}
                  wrapperClassName={cn("h-12", errors.customerPhone && invalidClass)}
                />
              </Field>
            </div>
          </div>
        </section>

        <section aria-labelledby="address-information-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="flex items-center gap-3 text-lg font-bold text-[#071a43]" id="address-information-heading">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><MapPinIcon className="size-5" /></span>
            {transactionType === TRANSACTION_TYPES.DELIVERY_EXCHANGE ? "ที่อยู่จัดส่ง" : "ที่อยู่ลูกค้า"}
          </h3>
          <div className="mt-6 grid gap-4">
            <Field label="ชื่อที่อยู่" optional>
              <Input onChange={(event) => onChange("addressLabel", event.target.value)} placeholder="เช่น บ้าน, ที่ทำงาน" value={customer.addressLabel} wrapperClassName="h-12" />
            </Field>
            <Field error={errors.address} label="ที่อยู่" optional={transactionType !== TRANSACTION_TYPES.DELIVERY_EXCHANGE}>
              <Textarea
                aria-invalid={Boolean(errors.address)}
                onChange={(event) => onChange("address", event.target.value)}
                placeholder="เลขที่, หมู่, ซอย, ถนน"
                value={customer.address}
                wrapperClassName={cn(errors.address && invalidClass)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="ตำบล/แขวง" optional>
                <Input onChange={(event) => onChange("subdistrict", event.target.value)} placeholder="กรอกตำบล/แขวง" value={customer.subdistrict} wrapperClassName="h-12" />
              </Field>
              <Field label="อำเภอ/เขต" optional>
                <Input onChange={(event) => onChange("district", event.target.value)} placeholder="กรอกอำเภอ/เขต" value={customer.district} wrapperClassName="h-12" />
              </Field>
              <Field label="จังหวัด" optional>
                <Select className="h-12" onChange={(event) => onChange("province", event.target.value)} value={customer.province}>
                  <option value="">เลือกจังหวัด</option>
                  {THAI_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
              <Field error={errors.postalCode} label="รหัสไปรษณีย์" optional>
                <Input
                  aria-invalid={Boolean(errors.postalCode)}
                  inputMode="numeric"
                  maxLength={5}
                  onChange={(event) => onChange("postalCode", event.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="รหัสไปรษณีย์"
                  value={customer.postalCode}
                  wrapperClassName={cn("h-12", errors.postalCode && invalidClass)}
                />
              </Field>
              <Field label="หมายเหตุที่อยู่" optional>
                <Input onChange={(event) => onChange("addressNote", event.target.value)} placeholder="เช่น จุดสังเกต, โทรก่อนส่ง" value={customer.addressNote} wrapperClassName="h-12" />
              </Field>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function QuantityControl({
  label,
  onDecrease,
  onIncrease,
  quantity,
}: {
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  quantity: number;
}) {
  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button aria-label={`ลดจำนวน ${label}`} className="grid size-10 place-items-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 disabled:text-slate-300" disabled={quantity <= 1} onClick={onDecrease} type="button"><MinusIcon className="size-4" /></button>
      <output aria-label={`จำนวน ${label}`} className="grid h-full min-w-10 place-items-center border-x border-slate-200 px-2 text-sm font-bold text-[#071a43]">{quantity.toLocaleString("th-TH")}</output>
      <button aria-label={`เพิ่มจำนวน ${label}`} className="grid size-10 place-items-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-600" onClick={onIncrease} type="button"><PlusIcon className="size-4" /></button>
    </div>
  );
}

function ItemsStep({
  errors,
  loading,
  onLoadPage,
  onQueryChange,
  onRemove,
  onUpdateItem,
  pagination,
  productError,
  products,
  query,
  selected,
  transactionType,
}: {
  errors: TransactionFieldErrors;
  loading: boolean;
  onLoadPage: (page: number) => void;
  onQueryChange: (value: string) => void;
  onRemove: (id: string) => void;
  onUpdateItem: (product: Product, change: Partial<Omit<SelectedTransactionItem, "product">>) => void;
  pagination: ProductPagination;
  productError?: string;
  products: Product[];
  query: string;
  selected: SelectedTransactionItem[];
  transactionType: CreateTransactionType;
}) {
  const selectedById = new Map(selected.map((item) => [item.product.id, item]));
  const total = selected.reduce((sum, item) => sum + productPrice(item.product, transactionType) * item.quantity, 0);
  const totalDeposit = selected.reduce((sum, item) => sum + Number(item.depositAmount || 0), 0);
  const start = pagination.totalItems ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = Math.min(pagination.page * pagination.limit, pagination.totalItems);

  return (
    <section aria-labelledby="items-step-heading" className="wizard-step-enter">
      <div id="items-step-heading"><SectionHeading description="เลือกสินค้าและจำนวนที่ต้องการ ระบบจะยืนยันราคาและผลต่อสต็อกเมื่อสร้างรายการ" title="รายการสินค้า" /></div>
      {errors.items ? <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{errors.items}</div> : null}
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-busy={loading || undefined} aria-labelledby="available-products-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="sr-only" id="available-products-heading">สินค้าที่เลือกได้</h3>
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <Input
              aria-label="ค้นหาสินค้าจากยี่ห้อ"
              leftIcon={<SearchIcon className="size-5" />}
              onChange={(event) => onQueryChange(event.target.value.slice(0, 100))}
              placeholder="ค้นหาจากยี่ห้อสินค้า"
              rightElement={loading ? <LoadingSpinner className="text-blue-600" size="sm" /> : null}
              value={query}
              wrapperClassName="h-12"
            />
          </div>
          {productError ? (
            <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
              <div>
                <InfoIcon className="mx-auto size-10 text-red-500" />
                <h3 className="mt-4 font-bold text-[#071a43]">โหลดข้อมูลสินค้าไม่สำเร็จ</h3>
                <p className="mt-1 text-sm text-slate-500">{productError}</p>
                <Button className="mt-5" onClick={() => onLoadPage(pagination.page)} size="sm" variant="secondary">ลองอีกครั้ง</Button>
              </div>
            </div>
          ) : products.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <caption className="sr-only">รายการสินค้าที่ใช้งานได้</caption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>สินค้า</TableHead>
                      <TableHead>น้ำหนัก</TableHead>
                      <TableHead>ราคา (บาท)</TableHead>
                      <TableHead className="text-center">จำนวน</TableHead>
                      <TableHead className="text-right">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const item = selectedById.get(product.id);
                      const price = productPrice(product, transactionType);
                      const label = `${product.brand} ${product.weightKg} กก.`;
                      return (
                        <TableRow className={item ? "bg-blue-50/50" : undefined} key={product.id}>
                          <TableCell>
                            <div className="flex min-w-48 items-center gap-3">
                              <ProductImage alt={`รูปสินค้า ${label}`} className="size-12 rounded-xl" image={primaryImage(product)} />
                              <div><p className="font-bold text-[#071a43]">{product.brand}</p><p className="mt-0.5 text-xs text-slate-400">สินค้าแก๊ส</p></div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-semibold">{Number(product.weightKg).toLocaleString("th-TH")} กก.</TableCell>
                          <TableCell className="whitespace-nowrap font-semibold">{money.format(price)}</TableCell>
                          <TableCell className="text-center">
                            {item ? (
                              <QuantityControl
                                label={label}
                                onDecrease={() => onUpdateItem(product, { quantity: item.quantity - 1 })}
                                onIncrease={() => onUpdateItem(product, { quantity: item.quantity + 1 })}
                                quantity={item.quantity}
                              />
                            ) : (
                              <Button aria-label={`เพิ่ม ${label}`} onClick={() => onUpdateItem(product, { quantity: 1 })} size="sm" variant="secondary">
                                <PlusIcon className="size-4" /> เพิ่ม
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-bold text-blue-600">{money.format(price * (item?.quantity ?? 0))}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="divide-y divide-slate-100 md:hidden">
                {products.map((product) => {
                  const item = selectedById.get(product.id);
                  const price = productPrice(product, transactionType);
                  const label = `${product.brand} ${product.weightKg} กก.`;
                  return (
                    <article className={cn("p-4", item && "bg-blue-50/50")} key={product.id}>
                      <div className="flex items-start gap-3">
                        <ProductImage alt={`รูปสินค้า ${label}`} className="size-14 rounded-xl" image={primaryImage(product)} />
                        <div className="min-w-0 flex-1"><h4 className="font-bold text-[#071a43]">{product.brand}</h4><p className="text-sm text-slate-500">{Number(product.weightKg).toLocaleString("th-TH")} กก.</p><p className="mt-1 font-bold text-blue-600">{money.format(price)} บาท</p></div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        {item ? (
                          <QuantityControl label={label} onDecrease={() => onUpdateItem(product, { quantity: item.quantity - 1 })} onIncrease={() => onUpdateItem(product, { quantity: item.quantity + 1 })} quantity={item.quantity} />
                        ) : <span className="text-xs text-slate-400">ยังไม่ได้เลือก</span>}
                        {!item ? <Button onClick={() => onUpdateItem(product, { quantity: 1 })} size="sm" variant="secondary"><PlusIcon className="size-4" /> เพิ่ม</Button> : <p className="font-bold text-blue-600">{money.format(price * item.quantity)}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>แสดง {start.toLocaleString("th-TH")}–{end.toLocaleString("th-TH")} จาก {pagination.totalItems.toLocaleString("th-TH")} รายการ</p>
                <div className="flex items-center gap-2">
                  <Button aria-label="หน้าสินค้าก่อนหน้า" disabled={loading || pagination.page <= 1} onClick={() => onLoadPage(pagination.page - 1)} size="icon" variant="secondary">‹</Button>
                  <span className="px-2 font-semibold text-slate-700">หน้า {pagination.page.toLocaleString("th-TH")} จาก {Math.max(pagination.totalPages, 1).toLocaleString("th-TH")}</span>
                  <Button aria-label="หน้าสินค้าถัดไป" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => onLoadPage(pagination.page + 1)} size="icon" variant="secondary">›</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
              <div><CartIcon className="mx-auto size-11 text-slate-300" /><h3 className="mt-4 font-bold text-[#071a43]">{query ? "ไม่พบสินค้าที่ตรงกับคำค้น" : "ยังไม่มีสินค้าที่ใช้งานได้"}</h3><p className="mt-1 text-sm text-slate-500">{query ? "ลองใช้ชื่อยี่ห้ออื่นหรือล้างคำค้น" : "เพิ่มและเปิดใช้งานสินค้าก่อนสร้างรายการ"}</p>{query ? <Button className="mt-5" onClick={() => onQueryChange("")} size="sm" variant="secondary">ล้างคำค้น</Button> : null}</div>
            </div>
          )}
        </section>

        <aside aria-labelledby="selected-products-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm 2xl:sticky 2xl:top-4">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-bold text-[#071a43]" id="selected-products-heading">สรุปรายการที่เลือก <span className="text-blue-600">({selected.length.toLocaleString("th-TH")})</span></h3>
          </div>
          {selected.length ? (
            <div className="max-h-[34rem] divide-y divide-slate-100 overflow-y-auto">
              {selected.map((item) => {
                const price = productPrice(item.product, transactionType);
                const itemError = errors.itemErrors?.[item.product.id];
                return (
                  <article className="p-4" key={item.product.id}>
                    <div className="flex gap-3">
                      <ProductImage alt={`รูปสินค้า ${item.product.brand}`} className="size-11 rounded-lg" image={primaryImage(item.product)} />
                      <div className="min-w-0 flex-1"><h4 className="truncate text-sm font-bold text-[#071a43]">{item.product.brand} {Number(item.product.weightKg).toLocaleString("th-TH")} กก.</h4><p className="mt-1 text-xs text-slate-500">{item.quantity.toLocaleString("th-TH")} ใบ × {money.format(price)} บาท</p></div>
                      <button aria-label={`นำ ${item.product.brand} ออกจากรายการ`} className="grid size-9 shrink-0 place-items-center rounded-lg text-red-500 transition hover:bg-red-50" onClick={() => onRemove(item.product.id)} type="button"><TrashIcon className="size-4" /></button>
                    </div>
                    <p className="mt-3 text-right text-sm font-bold text-blue-600">{money.format(price * item.quantity)} บาท</p>
                    {transactionType === TRANSACTION_TYPES.BORROW_CYLINDER ? (
                      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3">
                        <Field error={itemError?.expectedReturnDate} label="วันที่คาดว่าจะคืน" optional>
                          <Input aria-invalid={Boolean(itemError?.expectedReturnDate)} onChange={(event) => onUpdateItem(item.product, { expectedReturnDate: event.target.value })} type="date" value={item.expectedReturnDate} wrapperClassName="h-11" />
                        </Field>
                        <Field error={itemError?.depositAmount} label="เงินมัดจำ (บาท)" optional>
                          <Input aria-invalid={Boolean(itemError?.depositAmount)} inputMode="decimal" min="0" onChange={(event) => onUpdateItem(item.product, { depositAmount: event.target.value })} placeholder="0.00" step="0.01" type="number" value={item.depositAmount} wrapperClassName="h-11" />
                        </Field>
                        <Field label="หมายเหตุสินค้า" optional>
                          <Input onChange={(event) => onUpdateItem(item.product, { note: event.target.value })} placeholder="รายละเอียดเพิ่มเติม" value={item.note} wrapperClassName="h-11" />
                        </Field>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : <div className="px-5 py-12 text-center"><CartIcon className="mx-auto size-9 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-500">ยังไม่ได้เลือกสินค้า</p></div>}
          <div className="border-t border-slate-100 bg-slate-50/70 p-5">
            <div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-600">ยอดรวมโดยประมาณ</span><strong className="text-lg text-blue-600">{money.format(total)} บาท</strong></div>
            {transactionType === TRANSACTION_TYPES.BORROW_CYLINDER ? <div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-500">เงินมัดจำรวม</span><strong className="text-[#071a43]">{money.format(totalDeposit)} บาท</strong></div> : null}
            <div className="mt-4 flex gap-2 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900"><InfoIcon className="mt-0.5 size-4 shrink-0 text-blue-600" /><span>ราคาสุดท้ายและผลต่อสต็อกยืนยันโดยระบบเมื่อสร้างรายการ</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ConfirmationStep({
  customer,
  note,
  onNoteChange,
  selected,
  transactionType,
}: {
  customer: CustomerDraft;
  note: string;
  onNoteChange: (value: string) => void;
  selected: SelectedTransactionItem[];
  transactionType: CreateTransactionType;
}) {
  const address = composeCustomerAddress(customer);
  const total = selected.reduce((sum, item) => sum + productPrice(item.product, transactionType) * item.quantity, 0);
  const deposit = selected.reduce((sum, item) => sum + Number(item.depositAmount || 0), 0);
  return (
    <section aria-labelledby="confirmation-step-heading" className="wizard-step-enter">
      <div id="confirmation-step-heading"><SectionHeading description="ตรวจสอบข้อมูลก่อนสร้างรายการ ระบบจะยืนยันราคา สถานะ คิว และผลต่อสต็อกอีกครั้ง" title="ยืนยันข้อมูล" /></div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[#071a43]">ข้อมูลรายการ</h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{TRANSACTION_TYPE_LABELS[transactionType]}</span>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">ชื่อลูกค้า</dt><dd className="mt-1 font-semibold text-[#071a43]">{customer.customerName}</dd></div>
              <div><dt className="text-slate-500">เบอร์โทรศัพท์</dt><dd className="mt-1 font-semibold text-[#071a43]">{customer.customerPhone || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-500">ที่อยู่</dt><dd className="mt-1 font-semibold leading-6 text-[#071a43]">{address || "—"}</dd></div>
            </dl>
          </section>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="text-lg font-bold text-[#071a43]">รายการสินค้า</h3></div>
            <div className="divide-y divide-slate-100">
              {selected.map((item) => {
                const price = productPrice(item.product, transactionType);
                return (
                  <article className="flex gap-3 p-4 sm:px-6" key={item.product.id}>
                    <ProductImage alt={`รูปสินค้า ${item.product.brand}`} className="size-12 rounded-xl" image={primaryImage(item.product)} />
                    <div className="min-w-0 flex-1"><h4 className="font-bold text-[#071a43]">{item.product.brand} {Number(item.product.weightKg).toLocaleString("th-TH")} กก.</h4><p className="mt-1 text-sm text-slate-500">{item.quantity.toLocaleString("th-TH")} ใบ × {money.format(price)} บาท</p>{transactionType === TRANSACTION_TYPES.BORROW_CYLINDER ? <p className="mt-1 text-xs text-slate-500">คาดว่าจะคืน: {item.expectedReturnDate || "ไม่ระบุ"} · มัดจำ {money.format(Number(item.depositAmount || 0))} บาท</p> : null}</div>
                    <strong className="whitespace-nowrap text-blue-600">{money.format(price * item.quantity)}</strong>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Field label="หมายเหตุรายการ" optional>
              <Textarea onChange={(event) => onNoteChange(event.target.value)} placeholder="รายละเอียดเพิ่มเติม เช่น ส่งก่อนเที่ยง" value={note} />
            </Field>
          </section>
        </div>
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4">
          <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-[#071a43]">สรุปยอด</h3></div>
          <div className="space-y-3 p-5 text-sm">
            <div className="flex justify-between gap-4 text-slate-600"><span>รายการสินค้า</span><span>{selected.length.toLocaleString("th-TH")} รายการ</span></div>
            <div className="flex justify-between gap-4 text-slate-600"><span>จำนวนรวม</span><span>{selected.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("th-TH")} ใบ</span></div>
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-end justify-between gap-4"><span className="font-bold text-[#071a43]">ยอดรวมโดยประมาณ</span><strong className="text-xl text-blue-600">{money.format(total)} <span className="text-xs">บาท</span></strong></div>
              {transactionType === TRANSACTION_TYPES.BORROW_CYLINDER ? <div className="mt-3 flex justify-between gap-4 text-slate-600"><span>เงินมัดจำรวม</span><strong className="text-[#071a43]">{money.format(deposit)} บาท</strong></div> : null}
            </div>
            <div className="mt-4 flex gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-900"><InfoIcon className="mt-0.5 size-4 shrink-0 text-blue-600" /><span>ยอดจริง สถานะ คิว และผลต่อสต็อกจะยืนยันจาก backend เมื่อสร้างรายการสำเร็จ</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function TransactionForm({
  initialPagination,
  initialProducts,
}: {
  initialPagination: ProductPagination;
  initialProducts: Product[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [customer, setCustomer] = useState<CustomerDraft>(initialCustomer);
  const [selectedById, setSelectedById] = useState<Record<string, SelectedTransactionItem>>({});
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<TransactionFieldErrors>({});
  const [apiError, setApiError] = useState<{ code?: string; message: string; requestId?: string } | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [productError, setProductError] = useState<string>();
  const [query, setQuery] = useState("");
  const [productPending, startProductTransition] = useTransition();
  const [submitPending, startSubmitTransition] = useTransition();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingDestinationRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const searchSequenceRef = useRef(0);
  const selected = useMemo(() => Object.values(selectedById), [selectedById]);

  function markDirty() {
    dirtyRef.current = true;
  }

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function interceptLink(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
      event.preventDefault();
      event.stopPropagation();
      pendingDestinationRef.current = `${destination.pathname}${destination.search}${destination.hash}`;
      setLeaveOpen(true);
    }

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", interceptLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", interceptLink, true);
    };
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    const timer = window.setTimeout(() => loadProducts(1, query), 400);
    return () => window.clearTimeout(timer);
    // loadProducts is intentionally stateful and only query/step should trigger this debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, step]);

  function loadProducts(page: number, search = query) {
    const sequence = ++searchSequenceRef.current;
    setProductError(undefined);
    startProductTransition(async () => {
      const result = await searchTransactionProductsAction({ page, search });
      if (sequence !== searchSequenceRef.current) return;
      if (result.ok) {
        setProducts(result.products);
        setPagination(result.pagination);
      } else {
        setProductError(result.requestId ? `${result.message} (รหัสอ้างอิง: ${result.requestId})` : result.message);
      }
    });
  }

  function updateCustomer(field: keyof CustomerDraft, value: string) {
    markDirty();
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItem(product: Product, change: Partial<Omit<SelectedTransactionItem, "product">>) {
    markDirty();
    setSelectedById((current) => {
      const existing = current[product.id] ?? {
        product,
        quantity: 1,
        expectedReturnDate: "",
        depositAmount: "0.00",
        note: "",
      };
      return { ...current, [product.id]: { ...existing, ...change, product } };
    });
    setErrors((current) => ({ ...current, items: undefined, itemErrors: undefined }));
  }

  function removeItem(id: string) {
    markDirty();
    setSelectedById((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function focusHeading() {
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(".wizard-step-enter h2")?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function goToStep(next: number) {
    setApiError(null);
    setStep(next);
    focusHeading();
  }

  function next() {
    if (step === 1) {
      if (!transactionType) return;
      if (transactionType === TRANSACTION_TYPES.RETURN_CYLINDER) {
        dirtyRef.current = false;
        router.push("/loans?intent=return");
        return;
      }
      goToStep(2);
      return;
    }
    if (step === 2) {
      const nextErrors = validateCustomerStep(transactionType, customer);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        window.requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
        return;
      }
      goToStep(3);
      return;
    }
    if (step === 3) {
      const nextErrors = validateItemsStep(transactionType, selected);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        window.requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
        return;
      }
      goToStep(4);
    }
  }

  function submit() {
    if (!transactionType || transactionType === TRANSACTION_TYPES.RETURN_CYLINDER) return;
    const customerErrors = validateCustomerStep(transactionType, customer);
    const itemErrors = validateItemsStep(transactionType, selected);
    const nextErrors = { ...customerErrors, ...itemErrors };
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      goToStep(Object.keys(customerErrors).length ? 2 : 3);
      return;
    }

    setApiError(null);
    const input = buildCreateTransactionInput(transactionType, customer, selected, note);
    startSubmitTransition(async () => {
      const result = await createTransactionAction(input);
      if (result.ok) {
        dirtyRef.current = false;
        toast({
          title: "สร้างรายการสำเร็จ",
          description: `${result.transaction.transactionNo} · ${TRANSACTION_TYPE_LABELS[result.transaction.transactionType]}`,
          variant: "success",
        });
        router.push(`/transactions/${result.transaction.id}`);
        router.refresh();
        return;
      }
      if (result.code === "UNAUTHORIZED") {
        dirtyRef.current = false;
        router.push("/api/auth/session/clear");
        return;
      }
      setApiError({ code: result.code, message: result.message, requestId: result.requestId });
      if (result.fieldErrors) setErrors(result.fieldErrors);
    });
  }

  function requestCancel() {
    if (!dirtyRef.current) {
      router.push("/transactions");
      return;
    }
    pendingDestinationRef.current = "/transactions";
    setLeaveOpen(true);
  }

  function confirmLeave() {
    const destination = pendingDestinationRef.current ?? "/transactions";
    dirtyRef.current = false;
    setLeaveOpen(false);
    router.push(destination);
  }

  const createType = transactionType && transactionType !== TRANSACTION_TYPES.RETURN_CYLINDER
    ? transactionType
    : null;

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <div className="mx-auto w-full max-w-[1480px] flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl"><Stepper currentStep={step} steps={TRANSACTION_STEPS} /></div>
        <div className="mt-9">
          {apiError ? (
            <div className="mx-auto mb-5 flex max-w-4xl items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              <InfoIcon className="mt-0.5 size-5 shrink-0 text-red-500" />
              <div><p className="font-bold">สร้างรายการไม่สำเร็จ</p><p className="mt-0.5">{apiError.message}</p>{apiError.requestId ? <p className="mt-1 text-xs text-red-600">รหัสอ้างอิง: {apiError.requestId}</p> : null}{apiError.code === "INSUFFICIENT_STOCK" || apiError.code === "CONFLICT" ? <button className="mt-2 font-bold text-blue-700 underline underline-offset-2" onClick={() => goToStep(3)} type="button">กลับไปตรวจสอบสินค้า</button> : null}</div>
            </div>
          ) : null}
          {step === 1 ? <TransactionTypeStep onSelect={(type) => { markDirty(); setTransactionType(type); }} selected={transactionType} /> : null}
          {step === 2 && transactionType ? <CustomerStep customer={customer} errors={errors} onChange={updateCustomer} transactionType={transactionType} /> : null}
          {step === 3 && createType ? <ItemsStep errors={errors} loading={productPending} onLoadPage={(page) => loadProducts(page)} onQueryChange={(value) => { setQuery(value); }} onRemove={removeItem} onUpdateItem={updateItem} pagination={pagination} productError={productError} products={products} query={query} selected={selected} transactionType={createType} /> : null}
          {step === 4 && createType ? <ConfirmationStep customer={customer} note={note} onNoteChange={(value) => { markDirty(); setNote(value); }} selected={selected} transactionType={createType} /> : null}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3">
          <Button disabled={submitPending} onClick={requestCancel} variant="secondary">ยกเลิก</Button>
          <div className="flex items-center gap-3">
            {step > 1 ? <Button disabled={submitPending} leftIcon={<ArrowLeftIcon className="size-4" />} onClick={() => goToStep(step - 1)} variant="secondary">กลับ</Button> : null}
            {step < 4 ? (
              <Button
                disabled={!transactionType || (step === 3 && !selected.length)}
                onClick={next}
                rightIcon={<ArrowRightIcon className="size-4" />}
              >
                {step === 1 && transactionType === TRANSACTION_TYPES.RETURN_CYLINDER ? "เลือกรายการยืม" : "ถัดไป"}
              </Button>
            ) : (
              <Button isLoading={submitPending} loadingText="กำลังสร้างรายการ" onClick={submit} rightIcon={<ArrowRightIcon className="size-4" />}>ยืนยันสร้างรายการ</Button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        description="ข้อมูลที่ยังไม่ได้บันทึกจะหายและไม่สามารถกู้คืนได้"
        footer={<><Button data-dialog-initial-focus onClick={() => setLeaveOpen(false)} variant="secondary">อยู่ต่อ</Button><Button onClick={confirmLeave}>ออกจากหน้า</Button></>}
        onOpenChange={setLeaveOpen}
        open={leaveOpen}
        title="ออกจากหน้านี้หรือไม่?"
      />
    </div>
  );
}
