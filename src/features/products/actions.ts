"use server";

import { revalidatePath } from "next/cache";
import { ApiError, toUserMessage } from "@/lib/api/errors";
import { createProduct, deactivateProduct, updateProduct } from "./product.api";
import { validateProductInput } from "./product.schema";
import type { ProductActionState } from "./product.types";

const initialFailure = (message: string): ProductActionState => ({ ok: false, message });

export async function saveProductAction(id: string | null, previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const productId = id ?? previous.productId ?? null;
  const productSaved = previous.productSaved || undefined;
  const validation = validateProductInput(formData);
  if (!validation.valid) return { ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors: validation.fieldErrors, productId: productId ?? undefined, productSaved };
  try {
    const product = productId ? await updateProduct(productId, validation.input) : await createProduct(validation.input);
    revalidatePath("/products");
    revalidatePath(`/products/${product.id}/edit`);
    return { ok: true, message: "บันทึกข้อมูลสินค้าแล้ว", productId: product.id, productSaved: true };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: toUserMessage(error.code, error.message), productId: productId ?? undefined, productSaved, requestId: error.requestId };
    return { ...initialFailure("บันทึกข้อมูลสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง"), productId: productId ?? undefined, productSaved };
  }
}

export async function setProductActiveAction(id: string, isActive: boolean): Promise<ProductActionState> {
  try {
    if (isActive) await updateProduct(id, { isActive: true });
    else await deactivateProduct(id);
    revalidatePath("/products");
    return { ok: true, message: isActive ? "เปิดใช้งานสินค้าแล้ว" : "ปิดใช้งานสินค้าแล้ว" };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: toUserMessage(error.code, error.message), requestId: error.requestId };
    return initialFailure("เปลี่ยนสถานะสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง");
  }
}
