import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { uploadProductImage } from "@/features/products/product.api";
import { validateProductImageFile } from "@/features/products/product-image.schema";
import { ApiError, toUserMessage } from "@/lib/api/errors";

export async function POST(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  if (!/^[1-9][0-9]*$/.test(productId)) {
    return NextResponse.json({ success: false, message: "รหัสสินค้าไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "กรุณาเลือกไฟล์รูปสินค้า" }, { status: 400 });
    }
    const fileError = validateProductImageFile(file);
    if (fileError) return NextResponse.json({ success: false, message: fileError }, { status: 400 });

    const sortOrder = Number(incoming.get("sortOrder") ?? 0);
    const isPrimary = String(incoming.get("isPrimary") ?? "false");
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return NextResponse.json({ success: false, message: "ลำดับรูปต้องเป็นจำนวนเต็มตั้งแต่ 0" }, { status: 400 });
    }
    if (isPrimary !== "true" && isPrimary !== "false") {
      return NextResponse.json({ success: false, message: "สถานะรูปหลักไม่ถูกต้อง" }, { status: 400 });
    }

    const upload = new FormData();
    upload.set("file", file, file.name);
    upload.set("sortOrder", String(sortOrder));
    upload.set("isPrimary", isPrimary);

    const image = await uploadProductImage(productId, upload);
    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: toUserMessage(error.code, error.message), requestId: error.requestId },
        { status: error.status },
      );
    }
    return NextResponse.json({ success: false, message: "อัปโหลดรูปสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
