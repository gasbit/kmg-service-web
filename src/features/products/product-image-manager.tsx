"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircleIcon, ImageIcon, TrashIcon } from "@/components/icon/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/use-toast";
import { NETWORK_ERROR_MESSAGE } from "@/lib/api/errors";
import { ProductImage as ProductImageView } from "./product-image";
import type { DeletedProductImage, Product, ProductImage } from "./product.types";

type ImageResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string; requestId?: string };

function sortImages(images: ProductImage[]) {
  return [...images].sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id, undefined, { numeric: true }));
}

function displaySortOrder(sortOrder: number) {
  return String(sortOrder + 1);
}

async function imageRequest<T>(url: string, init: RequestInit): Promise<ImageResponse<T>> {
  try {
    const response = await fetch(url, init);
    const result = await response.json() as ImageResponse<T>;
    if (!response.ok && result.success) return { success: false, message: "ดำเนินการกับรูปสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
    return result;
  } catch {
    return { success: false, message: NETWORK_ERROR_MESSAGE };
  }
}

export function ProductImageManager({ product }: { product: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState(() => sortImages(product.images));
  const [sortOrders, setSortOrders] = useState<Record<string, string>>(() => Object.fromEntries(product.images.map((image) => [image.id, displaySortOrder(image.sortOrder)])));
  const [sortErrors, setSortErrors] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<{ imageId: string; label: string } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ProductImage | null>(null);

  if (!images.length) return null;

  function applyUpdatedImage(updated: ProductImage) {
    setImages((current) => sortImages(current.map((image) => {
      if (image.id === updated.id) return updated;
      return updated.isPrimary ? { ...image, isPrimary: false } : image;
    })));
    setSortOrders((current) => ({ ...current, [updated.id]: displaySortOrder(updated.sortOrder) }));
    router.refresh();
  }

  async function setPrimary(image: ProductImage) {
    setPendingAction({ imageId: image.id, label: "กำลังกำหนดรูปหลัก" });
    const result = await imageRequest<ProductImage>(`/api/products/${product.id}/images/${image.id}`, {
      body: JSON.stringify({ isPrimary: true }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (result.success) {
      applyUpdatedImage(result.data);
      toast({ title: "กำหนดรูปหลักแล้ว", variant: "success" });
    } else {
      toast({ description: result.message, requestId: result.requestId, title: "กำหนดรูปหลักไม่สำเร็จ", variant: "error" });
    }
    setPendingAction(null);
  }

  async function saveSortOrder(image: ProductImage) {
    const rawValue = sortOrders[image.id]?.trim() ?? "";
    const displayValue = Number(rawValue);
    if (!rawValue || !Number.isInteger(displayValue) || displayValue < 1) {
      setSortErrors((current) => ({ ...current, [image.id]: "ลำดับต้องเป็นจำนวนเต็มตั้งแต่ 1" }));
      return;
    }

    setSortErrors((current) => ({ ...current, [image.id]: "" }));
    setPendingAction({ imageId: image.id, label: "กำลังบันทึกลำดับรูป" });
    const result = await imageRequest<ProductImage>(`/api/products/${product.id}/images/${image.id}`, {
      body: JSON.stringify({ sortOrder: displayValue - 1 }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (result.success) {
      applyUpdatedImage(result.data);
      toast({ title: "บันทึกลำดับรูปแล้ว", variant: "success" });
    } else {
      toast({ description: result.message, requestId: result.requestId, title: "บันทึกลำดับรูปไม่สำเร็จ", variant: "error" });
    }
    setPendingAction(null);
  }

  async function confirmDelete() {
    if (!deleteCandidate) return;
    setPendingAction({ imageId: deleteCandidate.id, label: "กำลังลบรูปสินค้า" });
    const result = await imageRequest<DeletedProductImage>(`/api/products/${product.id}/images/${deleteCandidate.id}`, { method: "DELETE" });
    if (result.success) {
      setImages((current) => current.filter((image) => image.id !== result.data.deletedImageId));
      setSortOrders((current) => {
        const next = { ...current };
        delete next[result.data.deletedImageId];
        return next;
      });
      setDeleteCandidate(null);
      router.refresh();
      toast({ title: "ลบรูปสินค้าแล้ว", variant: "success" });
    } else {
      toast({ description: result.message, requestId: result.requestId, title: "ลบรูปสินค้าไม่สำเร็จ", variant: "error" });
    }
    setPendingAction(null);
  }

  const busy = pendingAction !== null;

  return (
    <div aria-busy={busy || undefined} className="mt-6 border-t border-slate-100 pt-6" onChange={(event) => event.stopPropagation()}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#071a43]">จัดการรูปที่ใช้อยู่</h3>
          <p className="mt-1 text-xs text-slate-500">รูปเรียงจากลำดับน้อยไปมาก และสินค้าสามารถไม่มีรูปหลักได้</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">{images.length.toLocaleString("th-TH")} รูป</span>
      </div>

      <p aria-live="polite" className="sr-only">{pendingAction?.label ?? ""}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => {
          const sortChanged = sortOrders[image.id] !== displaySortOrder(image.sortOrder);
          const imagePending = pendingAction?.imageId === image.id;
          const sortError = sortErrors[image.id];
          return (
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white" key={image.id}>
              <div className="relative aspect-[4/3] bg-slate-50">
                <div className="absolute inset-3">
                  <ProductImageView alt={`รูปสินค้า ${product.brand} ${product.weightKg} กิโลกรัม`} className="size-full rounded-lg" image={image} />
                </div>
                {image.isPrimary ? <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm"><CheckCircleIcon className="size-3.5" />รูปหลัก</span> : null}
              </div>
              <div className="space-y-3 p-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor={`product-image-sort-${image.id}`}>ลำดับรูป (เริ่มที่ 1)</label>
                  <div className="flex gap-2">
                    <Input
                      aria-describedby={sortError ? `product-image-sort-${image.id}-error` : undefined}
                      aria-invalid={Boolean(sortError)}
                      disabled={busy}
                      id={`product-image-sort-${image.id}`}
                      inputClassName="text-center"
                      inputMode="numeric"
                      min={1}
                      onChange={(event) => setSortOrders((current) => ({ ...current, [image.id]: event.target.value }))}
                      step={1}
                      type="number"
                      value={sortOrders[image.id] ?? ""}
                      wrapperClassName="h-10 min-w-0 flex-1 px-2"
                    />
                    <Button disabled={busy || !sortChanged} isLoading={imagePending && pendingAction.label.includes("ลำดับ")} loadingText="บันทึก" onClick={() => saveSortOrder(image)} size="sm" variant="secondary">บันทึก</Button>
                  </div>
                  {sortError ? <p className="mt-1.5 text-xs text-red-600" id={`product-image-sort-${image.id}-error`}>{sortError}</p> : null}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button disabled={busy || image.isPrimary} isLoading={imagePending && pendingAction.label.includes("รูปหลัก")} leftIcon={<ImageIcon className="size-4" />} loadingText="กำลังบันทึก" onClick={() => setPrimary(image)} size="sm" variant="secondary">ตั้งเป็นรูปหลัก</Button>
                  <Button className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={busy} leftIcon={<TrashIcon className="size-4" />} onClick={() => setDeleteCandidate(image)} size="sm" variant="ghost">ลบรูป</Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog
        description={deleteCandidate ? <>รูปนี้จะถูกลบออกจากสินค้าและ storage หากเป็นรูปหลัก ระบบจะไม่เลือกรูปหลักใหม่ให้อัตโนมัติ</> : null}
        dismissible={!busy}
        footer={<><Button data-dialog-initial-focus disabled={busy} onClick={() => setDeleteCandidate(null)} variant="secondary">ยกเลิก</Button><Button className="bg-red-600 shadow-none hover:bg-red-700 hover:shadow-none" isLoading={busy} loadingText="กำลังลบ" onClick={confirmDelete}>ยืนยันลบรูป</Button></>}
        onOpenChange={(nextOpen) => { if (!nextOpen && !busy) setDeleteCandidate(null); }}
        open={Boolean(deleteCandidate)}
        title="ลบรูปสินค้านี้?"
      />
    </div>
  );
}
