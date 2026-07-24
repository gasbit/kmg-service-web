import { apiClient, apiClientWithMeta } from "@/lib/api/client";
import type {
  CreateTransactionInput,
  TransactionDetail,
  TransactionListQuery,
  TransactionPagination,
  TransactionSummary,
} from "./transaction.types";

export async function getTransactions(query: TransactionListQuery = {}) {
  const result = await apiClientWithMeta<{ transactions: TransactionSummary[] }>("/transactions", {
    cache: "no-store",
    query,
  });
  const pagination = result.meta?.pagination as TransactionPagination | undefined;

  return {
    transactions: result.data.transactions,
    pagination: pagination ?? {
      limit: query.limit ?? 10,
      page: query.page ?? 1,
      totalItems: result.data.transactions.length,
      totalPages: result.data.transactions.length ? 1 : 0,
    },
  };
}

export function createTransaction(input: CreateTransactionInput) {
  return apiClient<TransactionDetail>("/transactions", { method: "POST", body: input });
}

export function getTransaction(id: string) {
  return apiClient<TransactionDetail>(`/transactions/${id}`, { cache: "no-store" });
}
