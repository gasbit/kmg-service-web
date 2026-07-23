"use server";

import { revalidatePath } from "next/cache";
import { ApiError, NETWORK_ERROR_CODE, toUserMessage } from "@/lib/api/errors";
import { getCurrentUser } from "@/features/auth/server";
import { getProducts } from "@/features/products/product.api";
import { createTransaction } from "./transaction.api";
import { validateCreateTransactionInput } from "./transaction.schema";
import type {
  TransactionActionResult,
  TransactionProductSearchResult,
} from "./transaction.types";

function transactionErrorMessage(error: ApiError) {
  if (error.code === "INSUFFICIENT_STOCK") return "จำนวนถังเต็มไม่เพียงพอ กรุณาตรวจสอบรายการสินค้า";
  if (error.code === "CONFLICT") return "สินค้าบางรายการไม่พร้อมใช้งาน กรุณากลับไปเลือกสินค้าใหม่";
  if (error.code === "NOT_FOUND") return "ไม่พบสินค้าบางรายการ กรุณากลับไปเลือกสินค้าใหม่";
  if (error.code === "VALIDATION_ERROR") return "ข้อมูลรายการไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (error.code === NETWORK_ERROR_CODE) return toUserMessage(error.code);
  return toUserMessage(error.code, "ไม่สามารถสร้างรายการได้ กรุณาลองอีกครั้ง");
}

async function requireAdmin() {
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

export async function createTransactionAction(input: unknown): Promise<TransactionActionResult> {
  const permission = await requireAdmin();
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

export async function searchTransactionProductsAction({
  page,
  search,
}: {
  page: number;
  search?: string;
}): Promise<TransactionProductSearchResult> {
  const permission = await requireAdmin();
  if (!permission.ok) return { ok: false, message: permission.message };
  try {
    const result = await getProducts({
      page: Number.isInteger(page) && page > 0 ? page : 1,
      limit: 20,
      search: search?.trim().slice(0, 100) || undefined,
      includeInactive: false,
    });
    return { ok: true, ...result };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.status === 403 ? "คุณไม่มีสิทธิ์ดูข้อมูลสินค้า" : toUserMessage(error.code, "โหลดข้อมูลสินค้าไม่สำเร็จ"),
        requestId: error.requestId,
      };
    }
    return { ok: false, message: "โหลดข้อมูลสินค้าไม่สำเร็จ" };
  }
}
