import type { ProductWriteInput } from "./product.types";

const decimalPattern = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;

export function validateProductInput(formData: FormData) {
  const input: ProductWriteInput = {
    brand: String(formData.get("brand") ?? "").trim(),
    weightKg: String(formData.get("weightKg") ?? "").trim(),
    exchangeCostPrice: String(formData.get("exchangeCostPrice") ?? "").trim(),
    exchangeSalePrice: String(formData.get("exchangeSalePrice") ?? "").trim(),
    fullTankPrice: String(formData.get("fullTankPrice") ?? "").trim(),
  };
  const fieldErrors: Partial<Record<keyof ProductWriteInput, string>> = {};
  if (!input.brand || input.brand.length > 100) fieldErrors.brand = "กรุณาระบุยี่ห้อไม่เกิน 100 ตัวอักษร";
  if (!decimalPattern.test(input.weightKg) || Number(input.weightKg) <= 0) fieldErrors.weightKg = "น้ำหนักต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง";
  for (const field of ["exchangeCostPrice", "exchangeSalePrice", "fullTankPrice"] as const) {
    if (!decimalPattern.test(input[field])) fieldErrors[field] = "ราคาต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง";
  }
  return { input, fieldErrors, valid: Object.keys(fieldErrors).length === 0 };
}
