import type { CreateTransactionInput, TransactionActionResult } from "./transaction.types";

export async function createTransactionRequest(input: CreateTransactionInput): Promise<TransactionActionResult> {
  try {
    const response = await fetch("/api/transactions", {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as TransactionActionResult | null;

    if (!payload || typeof payload !== "object" || typeof payload.ok !== "boolean") {
      return { ok: false, message: "รูปแบบข้อมูลตอบกลับไม่ถูกต้อง กรุณาลองอีกครั้ง" };
    }
    return payload;
  } catch {
    return { ok: false, message: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง" };
  }
}
