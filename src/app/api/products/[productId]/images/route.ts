import { NextResponse } from "next/server";
import { uploadProductImage } from "@/features/products/product.api";
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

    const upload = new FormData();
    upload.set("file", file, file.name);
    upload.set("sortOrder", String(incoming.get("sortOrder") ?? "0"));
    upload.set("isPrimary", String(incoming.get("isPrimary") ?? "false"));

    const image = await uploadProductImage(productId, upload);
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
