import { PageHeader } from "@/components/app-shell/page-header";
import { Skeleton } from "@/components/ui/loading";

export default function ProductsLoading() { return <main><PageHeader description="จัดการข้อมูลสินค้าและราคาขาย" title="สินค้า" /><div className="p-4 sm:p-6 lg:p-8 lg:pt-4"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"><div className="flex gap-4"><Skeleton className="h-12 flex-1" /><Skeleton className="h-12 w-56" /><Skeleton className="h-12 w-64" /></div><div className="mt-6 grid grid-cols-3 gap-4"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div><div className="mt-6 space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-16" key={index} />)}</div></div></div></main>; }
