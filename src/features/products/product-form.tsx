"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { ArrowLeftIcon } from "@/components/icon/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProductAction } from "./actions";
import type { Product, ProductActionState, ProductWriteInput } from "./product.types";

const initialState: ProductActionState = { ok: false, message: "" };

function Field({ error, label, name, defaultValue, placeholder, type = "text" }: { error?: string; label: string; name: keyof ProductWriteInput; defaultValue?: string; placeholder?: string; type?: string }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={name}>{label}</label><Input aria-describedby={error ? `${name}-error` : undefined} aria-invalid={Boolean(error)} defaultValue={defaultValue} id={name} inputMode={type === "number" ? "decimal" : undefined} name={name} placeholder={placeholder} required wrapperClassName={`h-12 ${error ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100" : ""}`} />{error ? <p className="mt-1.5 text-xs font-medium text-red-600" id={`${name}-error`}>{error}</p> : null}</div>;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const action = saveProductAction.bind(null, product?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  useEffect(() => { if (state.ok) { router.push("/products"); router.refresh(); } }, [router, state.ok]);
  return (
    <form action={formAction} aria-label={product ? "แก้ไขสินค้า" : "เพิ่มสินค้า"} className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7"><h2 className="text-lg font-bold text-[#071a43]">ข้อมูลสินค้า</h2><p className="mt-1 text-sm text-slate-500">กรอกข้อมูลราคาเป็นบาท ระบบจะใช้ค่าล่าสุดกับรายการใหม่เท่านั้น</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-2"><Field defaultValue={product?.brand} error={state.fieldErrors?.brand} label="ยี่ห้อสินค้า" name="brand" placeholder="เช่น ปตท." /></div>
          <Field defaultValue={product?.weightKg} error={state.fieldErrors?.weightKg} label="น้ำหนัก (กก.)" name="weightKg" placeholder="15.00" type="number" />
          <Field defaultValue={product?.exchangeCostPrice} error={state.fieldErrors?.exchangeCostPrice} label="ราคาทุนแลก (บาท)" name="exchangeCostPrice" placeholder="330.00" type="number" />
          <Field defaultValue={product?.exchangeSalePrice} error={state.fieldErrors?.exchangeSalePrice} label="ราคาขายแลก (บาท)" name="exchangeSalePrice" placeholder="390.00" type="number" />
          <Field defaultValue={product?.fullTankPrice} error={state.fieldErrors?.fullTankPrice} label="ราคาถังเต็ม (บาท)" name="fullTankPrice" placeholder="2450.00" type="number" />
          {state.message && !state.ok ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2" role="alert">{state.message}{state.requestId ? <span className="mt-1 block text-xs">รหัสอ้างอิง: {state.requestId}</span> : null}</div> : null}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-end sm:px-7"><Link className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600" href="/products">ยกเลิก</Link><Button isLoading={pending} loadingText="กำลังบันทึก" type="submit">{product ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</Button></div>
      </div>
      <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600" href="/products"><ArrowLeftIcon className="size-4" />กลับรายการสินค้า</Link>
    </form>
  );
}
