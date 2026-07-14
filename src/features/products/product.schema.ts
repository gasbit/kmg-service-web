import type { ProductWriteInput } from "./product.types";

const decimalPattern = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;
const fieldErrorMessages: Record<keyof ProductWriteInput, string> = {
  brand: "กรุณาระบุยี่ห้อไม่เกิน 100 ตัวอักษร",
  weightKg: "น้ำหนักต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง",
  exchangeCostPrice: "ราคาต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง",
  exchangeSalePrice: "ราคาต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง",
  fullTankPrice: "ราคาต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง",
};

function isProductField(value: unknown): value is keyof ProductWriteInput {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(fieldErrorMessages, value);
}

export function mapProductApiFieldErrors(details: unknown) {
  const fieldErrors: Partial<Record<keyof ProductWriteInput, string>> = {};
  if (!Array.isArray(details)) return fieldErrors;

  for (const issue of details) {
    if (!issue || typeof issue !== "object" || !("path" in issue) || !Array.isArray(issue.path)) continue;
    const field = issue.path[0];
    if (isProductField(field) && !fieldErrors[field]) fieldErrors[field] = fieldErrorMessages[field];
  }

  return fieldErrors;
}

export function validateProductInput(formData: FormData) {
  const input: ProductWriteInput = {
    brand: String(formData.get("brand") ?? "").trim(),
    weightKg: String(formData.get("weightKg") ?? "").trim(),
    exchangeCostPrice: String(formData.get("exchangeCostPrice") ?? "").trim(),
    exchangeSalePrice: String(formData.get("exchangeSalePrice") ?? "").trim(),
    fullTankPrice: String(formData.get("fullTankPrice") ?? "").trim(),
  };
  const fieldErrors: Partial<Record<keyof ProductWriteInput, string>> = {};
  if (!input.brand || input.brand.length > 100) fieldErrors.brand = fieldErrorMessages.brand;
  if (!decimalPattern.test(input.weightKg) || Number(input.weightKg) <= 0) fieldErrors.weightKg = fieldErrorMessages.weightKg;
  for (const field of ["exchangeCostPrice", "exchangeSalePrice", "fullTankPrice"] as const) {
    if (!decimalPattern.test(input[field])) fieldErrors[field] = fieldErrorMessages[field];
  }
  return { input, fieldErrors, valid: Object.keys(fieldErrors).length === 0 };
}
