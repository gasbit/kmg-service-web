import { apiClient } from "@/lib/api/client";
import type { CreateTransactionInput, TransactionDetail } from "./transaction.types";

export function createTransaction(input: CreateTransactionInput) {
  return apiClient<TransactionDetail>("/transactions", { method: "POST", body: input });
}

export function getTransaction(id: string) {
  return apiClient<TransactionDetail>(`/transactions/${id}`, { cache: "no-store" });
}
