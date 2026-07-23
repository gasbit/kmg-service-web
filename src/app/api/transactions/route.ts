import { NextResponse } from "next/server";
import { createTransactionForCurrentAdmin } from "@/features/transactions/transaction.server";

function statusFor(code?: string) {
  if (code === "UNAUTHORIZED") return 401;
  if (code === "FORBIDDEN") return 403;
  if (code === "VALIDATION_ERROR") return 400;
  if (code === "NOT_FOUND") return 404;
  if (code === "CONFLICT" || code === "INSUFFICIENT_STOCK") return 409;
  return 500;
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  const result = await createTransactionForCurrentAdmin(input);

  return NextResponse.json(result, {
    status: result.ok ? 201 : statusFor(result.code),
  });
}
