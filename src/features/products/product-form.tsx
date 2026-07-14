"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckCircleIcon, ImageIcon } from "@/components/icon/icons";
import { Button } from "@/components/ui/button";
import { FilePicker } from "@/components/ui/file-picker";
import { Checkbox, Input } from "@/components/ui/input";
import { saveProductAction } from "./actions";
import type { Product, ProductActionState, ProductImage, ProductWriteInput } from "./product.types";

const initialState: ProductActionState = { ok: false, message: "" };
const unsavedChangesMessage = "มีข้อมูลสินค้าที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?";

type UploadResponse =
  | { success: true; data: ProductImage }
  | { success: false; message: string; requestId?: string };

function Field({ error, label, name, defaultValue, placeholder, type = "text" }: { error?: string; label: string; name: keyof ProductWriteInput; defaultValue?: string; placeholder?: string; type?: string }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={name}>{label}</label><Input aria-describedby={error ? `${name}-error` : undefined} aria-invalid={Boolean(error)} defaultValue={defaultValue} id={name} inputMode={type === "number" ? "decimal" : undefined} name={name} placeholder={placeholder} required step={type === "number" ? "0.01" : undefined} type={type} wrapperClassName={`h-12 ${error ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100" : ""}`} />{error ? <p className="mt-1.5 text-xs font-medium text-red-600" id={`${name}-error`}>{error}</p> : null}</div>;
}

function ExistingImages({ images, product }: { images: ProductImage[]; product: Product }) {
  if (!images.length) return null;
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h3 className="text-sm font-bold text-[#071a43]">รูปที่ใช้อยู่</h3><p className="mt-1 text-xs text-slate-500">รูปหลักจะแสดงในรายการสินค้า หากไม่มีรูปหลักระบบจะแสดงรูปแรก</p></div>
        <span className="text-xs font-semibold text-slate-500">{images.length.toLocaleString("th-TH")} รูป</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2" key={image.id}>
            <span aria-label={`รูปสินค้า ${product.brand} ${product.weightKg} กิโลกรัม`} className="block aspect-square rounded-lg bg-slate-50 bg-contain bg-center bg-no-repeat" role="img" style={{ backgroundImage: `url(${JSON.stringify(image.url)})` }} />
            <div className="mt-2 flex min-w-0 items-center gap-1.5">
              {image.isPrimary ? <CheckCircleIcon className="size-3.5 shrink-0 text-emerald-600" /> : <ImageIcon className="size-3.5 shrink-0 text-slate-400" />}
              <span className={`truncate text-xs font-semibold ${image.isPrimary ? "text-emerald-700" : "text-slate-500"}`}>{image.isPrimary ? "รูปหลัก" : `ลำดับ ${image.sortOrder}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const dirtyRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(() => !product?.images.some((image) => image.isPrimary));

  useEffect(() => {
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); };
  }, []);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}${destination.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
      if (window.confirm(unsavedChangesMessage)) {
        dirtyRef.current = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    function handleNavigate(event: Event) {
      if (!dirtyRef.current || !event.cancelable) return;
      const destinationUrl = (event as Event & { destination?: { url?: string } }).destination?.url;
      if (destinationUrl && destinationUrl === window.location.href) return;
      if (window.confirm(unsavedChangesMessage)) {
        dirtyRef.current = false;
        return;
      }
      event.preventDefault();
    }

    const navigation = (window as Window & {
      navigation?: {
        addEventListener: (type: string, listener: EventListener) => void;
        removeEventListener: (type: string, listener: EventListener) => void;
      };
    }).navigation;

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    navigation?.addEventListener("navigate", handleNavigate);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      navigation?.removeEventListener("navigate", handleNavigate);
    };
  }, []);

  function handleFileChange(file: File | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setSelectedFile(file);
  }

  const submitProduct = useCallback(async (previous: ProductActionState, formData: FormData): Promise<ProductActionState> => {
    const saved = await saveProductAction(product?.id ?? null, previous, formData);
    if (!saved.ok || !saved.productId || !selectedFile) return saved;

    const upload = new FormData();
    upload.set("file", selectedFile, selectedFile.name);
    upload.set("sortOrder", String(product?.images.length ?? 0));
    upload.set("isPrimary", String(isPrimary));

    try {
      const response = await fetch(`/api/products/${saved.productId}/images`, { method: "POST", body: upload });
      const result = await response.json() as UploadResponse;
      if (!response.ok || !result.success) {
        return {
          ...saved,
          imageUploadFailed: true,
          message: result.success ? "อัปโหลดรูปสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" : result.message,
          ok: false,
          productSaved: true,
          requestId: result.success ? undefined : result.requestId,
        };
      }
      return { ...saved, message: "บันทึกข้อมูลและอัปโหลดรูปสินค้าแล้ว" };
    } catch {
      return { ...saved, imageUploadFailed: true, message: "บันทึกสินค้าแล้ว แต่อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง", ok: false, productSaved: true };
    }
  }, [isPrimary, product?.id, product?.images.length, selectedFile]);

  const [state, formAction, pending] = useActionState(submitProduct, initialState);

  useEffect(() => {
    if (state.ok) {
      dirtyRef.current = false;
      router.push("/products");
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction} aria-label={product ? "แก้ไขสินค้า" : "เพิ่มสินค้า"} className="mx-auto max-w-4xl" onChange={() => { dirtyRef.current = true; }}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7"><h2 className="text-lg font-bold text-[#071a43]">ข้อมูลสินค้า</h2><p className="mt-1 text-sm text-slate-500">กรอกข้อมูลราคาเป็นบาท ระบบจะใช้ค่าล่าสุดกับรายการใหม่เท่านั้น</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-2"><Field defaultValue={product?.brand} error={state.fieldErrors?.brand} label="ยี่ห้อสินค้า" name="brand" placeholder="เช่น ปตท." /></div>
          <Field defaultValue={product?.weightKg} error={state.fieldErrors?.weightKg} label="น้ำหนัก (กก.)" name="weightKg" placeholder="15.00" type="number" />
          <Field defaultValue={product?.exchangeCostPrice} error={state.fieldErrors?.exchangeCostPrice} label="ราคาทุนแลก (บาท)" name="exchangeCostPrice" placeholder="330.00" type="number" />
          <Field defaultValue={product?.exchangeSalePrice} error={state.fieldErrors?.exchangeSalePrice} label="ราคาขายแลก (บาท)" name="exchangeSalePrice" placeholder="390.00" type="number" />
          <Field defaultValue={product?.fullTankPrice} error={state.fieldErrors?.fullTankPrice} label="ราคาถังเต็ม (บาท)" name="fullTankPrice" placeholder="2450.00" type="number" />
        </div>

        <section aria-labelledby="product-image-heading" className="border-t border-slate-100 px-5 py-6 sm:px-7">
          <div className="mb-5"><h2 className="text-lg font-bold text-[#071a43]" id="product-image-heading">รูปสินค้า</h2><p className="mt-1 text-sm text-slate-500">เพิ่มรูปได้ภายหลัง รูปจะถูกอัปโหลดหลังบันทึกข้อมูลสินค้าสำเร็จ</p></div>
          <FilePicker
            accept="image/jpeg,image/png,image/webp"
            description="รองรับ JPEG, PNG และ WebP หนึ่งไฟล์ต่อครั้ง ขนาดไฟล์เป็นไปตามข้อกำหนดของระบบ"
            disabled={pending}
            file={selectedFile}
            id="product-image"
            label="ไฟล์รูปสินค้า (ไม่บังคับ)"
            onFileChange={handleFileChange}
            previewAlt={`ตัวอย่างรูปสินค้า ${product?.brand ?? "ใหม่"}`}
            previewUrl={previewUrl}
          />
          {selectedFile ? (
            <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-4 text-sm font-semibold text-slate-700">
              <Checkbox checked={isPrimary} disabled={pending} onChange={(event) => setIsPrimary(event.target.checked)} />
              ใช้รูปนี้เป็นรูปหลักของสินค้า
            </label>
          ) : null}
          {product ? <ExistingImages images={product.images} product={product} /> : null}
        </section>

        {state.message && !state.ok ? (
          <div className={`mx-5 mb-5 rounded-xl border px-4 py-3 text-sm sm:mx-7 ${state.productSaved ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-100 bg-red-50 text-red-700"}`} role="alert">
            <span className="font-semibold">{state.productSaved ? "ข้อมูลสินค้าถูกบันทึกแล้ว" : "บันทึกข้อมูลไม่สำเร็จ"}</span>
            <span className="mt-1 block">{state.message}</span>
            {state.requestId ? <span className="mt-1 block text-xs">รหัสอ้างอิง: {state.requestId}</span> : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-end sm:px-7"><Link className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600" href="/products">ยกเลิก</Link><Button isLoading={pending} loadingText={selectedFile ? (state.productId ? "กำลังอัปโหลดรูป" : "กำลังบันทึกและอัปโหลด") : "กำลังบันทึก"} type="submit">{state.imageUploadFailed ? "บันทึกและลองอัปโหลดอีกครั้ง" : product ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</Button></div>
      </div>
      <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600" href="/products"><ArrowLeftIcon className="size-4" />กลับรายการสินค้า</Link>
    </form>
  );
}
