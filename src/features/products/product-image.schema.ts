import type { ProductImageUpdateInput } from "./product.types";

export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_COUNT = 10;

const allowedTypes = new Set(PRODUCT_IMAGE_ACCEPT.split(","));

export function validateProductImageFile(file: File, currentImageCount = 0) {
  if (currentImageCount >= PRODUCT_IMAGE_MAX_COUNT) return `สินค้าเพิ่มรูปได้สูงสุด ${PRODUCT_IMAGE_MAX_COUNT} รูป`;
  if (!allowedTypes.has(file.type)) return "รองรับเฉพาะไฟล์ JPEG, PNG และ WebP";
  if (file.size === 0) return "ไฟล์รูปไม่มีข้อมูล กรุณาเลือกไฟล์ใหม่";
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) return "ไฟล์รูปต้องมีขนาดไม่เกิน 5 MB";
  return undefined;
}

export function parseProductImageUpdateInput(value: unknown):
  | { valid: true; input: ProductImageUpdateInput }
  | { valid: false; message: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, message: "ข้อมูลรูปสินค้าไม่ถูกต้อง" };
  }

  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => key !== "sortOrder" && key !== "isPrimary")) {
    return { valid: false, message: "ข้อมูลรูปสินค้ามี field ที่ไม่รองรับ" };
  }
  const input: ProductImageUpdateInput = {};
  if ("sortOrder" in record) {
    if (!Number.isInteger(record.sortOrder) || Number(record.sortOrder) < 0) {
      return { valid: false, message: "ลำดับรูปต้องเป็นจำนวนเต็มตั้งแต่ 0" };
    }
    input.sortOrder = Number(record.sortOrder);
  }
  if ("isPrimary" in record) {
    if (typeof record.isPrimary !== "boolean") return { valid: false, message: "สถานะรูปหลักไม่ถูกต้อง" };
    input.isPrimary = record.isPrimary;
  }
  if (Object.keys(input).length === 0) return { valid: false, message: "กรุณาระบุข้อมูลรูปที่ต้องการแก้ไข" };
  return { valid: true, input };
}
