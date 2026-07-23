import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { getProducts } from "@/features/products/product.api";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { TransactionLoadError } from "@/features/transactions/transaction-load-error";
import { ApiError, NETWORK_ERROR_CODE, toUserMessage } from "@/lib/api/errors";

export default async function NewTransactionPage() {
  let result: Awaited<ReturnType<typeof getProducts>> | null = null;
  let loadError: unknown;
  try {
    result = await getProducts({ page: 1, limit: 20, includeInactive: false });
  } catch (error) {
    loadError = error;
  }

  if (result) {
    const { products, pagination } = result;
    return (
      <main>
        <PageHeader description="สร้างรายการขาย แลก หรือยืมถัง" title="สร้างรายการใหม่" />
        <TransactionForm initialPagination={pagination} initialProducts={products.filter((product) => product.isActive)} />
      </main>
    );
  }

  if (loadError instanceof ApiError && loadError.status === 401) redirect("/api/auth/session/clear");
  const message = loadError instanceof ApiError && loadError.code === NETWORK_ERROR_CODE
    ? toUserMessage(loadError.code)
    : undefined;
  return (
    <main>
      <PageHeader description="สร้างรายการขาย แลก หรือยืมถัง" title="สร้างรายการใหม่" />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
        <TransactionLoadError
          forbidden={loadError instanceof ApiError && loadError.status === 403}
          message={message}
          requestId={loadError instanceof ApiError ? loadError.requestId : undefined}
        />
      </div>
    </main>
  );
}
