import "server-only";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/server";
import { ApiError, NETWORK_ERROR_CODE, toUserMessage } from "@/lib/api/errors";
import { createTransaction } from "./transaction.api";
import { validateCreateTransactionInput } from "./transaction.schema";
import type { TransactionActionResult } from "./transaction.types";

function transactionErrorMessage(error: ApiError) {
  if (error.code === "INSUFFICIENT_STOCK") return "จำนวนถังเต็มไม่เพียงพอ กรุณาตรวจสอบรายการสินค้า";
  if (error.code === "CONFLICT") return "สินค้าบางรายการไม่พร้อมใช้งาน กรุณากลับไปเลือกสินค้าใหม่";
  if (error.code === "NOT_FOUND") return "ไม่พบสินค้าบางรายการ กรุณากลับไปเลือกสินค้าใหม่";
  if (error.code === "VALIDATION_ERROR") return "ข้อมูลรายการไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (error.code === NETWORK_ERROR_CODE) return toUserMessage(error.code);
  return toUserMessage(error.code, "ไม่สามารถสร้างรายการได้ กรุณาลองอีกครั้ง");
}

export async function requireTransactionAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, message: "กรุณาเข้าสู่ระบบอีกครั้ง", code: "UNAUTHORIZED" };
    if (user.role.code !== "ADMIN") return { ok: false as const, message: "คุณไม่มีสิทธิ์สร้างรายการ", code: "FORBIDDEN" };
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false as const,
        message: toUserMessage(error.code, "ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองอีกครั้ง"),
        code: error.code,
      };
    }
    return { ok: false as const, message: "ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองอีกครั้ง", code: "INTERNAL_ERROR" };
  }
}

export async function createTransactionForCurrentAdmin(input: unknown): Promise<TransactionActionResult> {
  const permission = await requireTransactionAdmin();
  if (!permission.ok) return permission;

  const validation = validateCreateTransactionInput(input);
  if (!validation.valid) {
    return { ok: false, message: validation.message, fieldErrors: validation.fieldErrors };
  }

  try {
    const transaction = await createTransaction(validation.input);
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/queues");
    revalidatePath("/loans");
    return { ok: true, transaction };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        code: error.code,
        message: transactionErrorMessage(error),
        requestId: error.requestId,
      };
    }
    return { ok: false, message: "ไม่สามารถสร้างรายการได้ กรุณาลองอีกครั้ง" };
  }
}
