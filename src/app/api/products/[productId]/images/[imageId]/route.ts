import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteProductImage, updateProductImage } from "@/features/products/product.api";
import { parseProductImageUpdateInput } from "@/features/products/product-image.schema";
import { ApiError, toUserMessage } from "@/lib/api/errors";

type Params = { params: Promise<{ imageId: string; productId: string }> };
const decimalId = /^[1-9][0-9]*$/;

function invalidId(productId: string, imageId: string) {
  return !decimalId.test(productId) || !decimalId.test(imageId);
}

function apiFailure(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: toUserMessage(error.code, error.message), requestId: error.requestId },
      { status: error.status },
    );
  }
  return NextResponse.json({ success: false, message: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: Params) {
  const { imageId, productId } = await params;
  if (invalidId(productId, imageId)) {
    return NextResponse.json({ success: false, message: "รหัสรูปสินค้าไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "ข้อมูลรูปสินค้าไม่ถูกต้อง" }, { status: 400 });
    }
    const parsed = parseProductImageUpdateInput(body);
    if (!parsed.valid) return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    const image = await updateProductImage(productId, imageId, parsed.input);
    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    return apiFailure(error, "แก้ไขรูปสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { imageId, productId } = await params;
  if (invalidId(productId, imageId)) {
    return NextResponse.json({ success: false, message: "รหัสรูปสินค้าไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const result = await deleteProductImage(productId, imageId);
    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return apiFailure(error, "ลบรูปสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง");
  }
}
