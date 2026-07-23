import { PageHeader } from "@/components/app-shell/page-header";
import { Skeleton } from "@/components/ui/loading";

export default function NewTransactionLoading() {
  return (
    <main>
      <PageHeader description="สร้างรายการขาย แลก หรือยืมถัง" title="สร้างรายการใหม่" />
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="flex flex-1 flex-col items-center gap-3" key={index}>
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-28 max-w-full" />
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => <Skeleton className="h-48 rounded-2xl" key={index} />)}
        </div>
      </div>
    </main>
  );
}
