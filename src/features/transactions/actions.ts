"use server";

import { ApiError, toUserMessage } from "@/lib/api/errors";
import { getProducts } from "@/features/products/product.api";
import { requireTransactionAdmin } from "./transaction.server";
import type { TransactionProductSearchResult } from "./transaction.types";

export async function searchTransactionProductsAction({
  page,
  search,
}: {
  page: number;
  search?: string;
}): Promise<TransactionProductSearchResult> {
  const permission = await requireTransactionAdmin();
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
