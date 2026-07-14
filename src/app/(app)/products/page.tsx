import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { PackageIcon, CheckCircleIcon, PauseCircleIcon } from "@/components/icon/icons";
import { redirect } from "next/navigation";
import { ApiError, NETWORK_ERROR_CODE, toUserMessage } from "@/lib/api/errors";
import { getProducts } from "@/features/products/product.api";
import { ProductLoadError } from "@/features/products/product-load-error";
import { ProductPagination } from "@/features/products/product-pagination";
import { ProductTable } from "@/features/products/product-table";
import { ProductToolbar } from "@/features/products/product-toolbar";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;
const positiveInt = (input: string | undefined, fallback: number, max = Number.MAX_SAFE_INTEGER) => { const parsed = Number(input); return Number.isInteger(parsed) && parsed > 0 && parsed <= max ? parsed : fallback; };

function productsHref({ includeInactive, limit, page, search }: { includeInactive: boolean; limit: number; page: number; search?: string }) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  if (includeInactive) query.set("includeInactive", "true");
  return `/products?${query.toString()}`;
}

export default async function ProductsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const search = value(raw.search)?.trim().slice(0, 100);
  const includeInactive = value(raw.includeInactive) === "true";
  const rawPage = value(raw.page);
  const rawLimit = value(raw.limit);
  const page = positiveInt(rawPage, 1);
  const limit = positiveInt(rawLimit, 20, 100);

  if ((rawPage !== undefined && rawPage !== String(page)) || (rawLimit !== undefined && rawLimit !== String(limit))) {
    redirect(productsHref({ includeInactive, limit, page, search }));
  }

  let result;
  try {
    result = await getProducts({ page, limit, search: search || undefined, includeInactive });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/session/clear");
    const networkMessage = error instanceof ApiError && error.code === NETWORK_ERROR_CODE ? toUserMessage(error.code) : undefined;
    return <main><PageHeader description="จัดการข้อมูลสินค้าและราคาขาย" title="สินค้า" /><div className="p-4 sm:p-6 lg:p-8 lg:pt-4"><ProductLoadError forbidden={error instanceof ApiError && error.status === 403} message={networkMessage} requestId={error instanceof ApiError ? error.requestId : undefined} /></div></main>;
  }
  const { products, pagination } = result;
  const lastPage = Math.max(pagination.totalPages, 1);
  if (page > lastPage) {
    redirect(productsHref({ includeInactive, limit, page: lastPage, search }));
  }

  const inactiveOnPage = products.filter((product) => !product.isActive).length;
  return (
    <main>
      <PageHeader description="จัดการข้อมูลสินค้าและราคาขาย" title="สินค้า" />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6"><ProductToolbar initialSearch={search} /></div>
          <div aria-labelledby="product-results-heading" className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" id="product-results" tabIndex={-1}>
          <h2 className="sr-only" id="product-results-heading">ผลลัพธ์สินค้า</h2>
          <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">พบสินค้า {pagination.totalItems.toLocaleString("th-TH")} รายการ หน้า {page.toLocaleString("th-TH")} จาก {lastPage.toLocaleString("th-TH")}</p>
          <div className="grid border-y border-slate-100 sm:grid-cols-3">
            {[{ label: "ผลลัพธ์ทั้งหมด", value: pagination.totalItems, icon: PackageIcon, tone: "bg-blue-50 text-blue-600" }, { label: "แสดงในหน้านี้", value: products.length, icon: CheckCircleIcon, tone: "bg-emerald-50 text-emerald-600" }, { label: "ปิดใช้งานในหน้านี้", value: inactiveOnPage, icon: PauseCircleIcon, tone: "bg-slate-100 text-slate-600" }].map((metric) => <div className="flex items-center gap-4 border-slate-100 px-5 py-4 sm:border-r sm:last:border-r-0" key={metric.label}><span className={`grid size-11 place-items-center rounded-xl ${metric.tone}`}><metric.icon className="size-5" /></span><div><p className="text-xs font-medium text-slate-500">{metric.label}</p><p className="mt-0.5 text-2xl font-bold text-[#071a43]">{metric.value.toLocaleString("th-TH")} <span className="text-xs font-medium text-slate-500">รายการ</span></p></div></div>)}
          </div>
          {products.length ? <><ProductTable products={products} /><ProductPagination pagination={pagination} searchParams={{ search, includeInactive: includeInactive ? "true" : undefined, limit: String(limit) }} /></> : <div className="grid min-h-80 place-items-center px-6 py-14 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-500"><PackageIcon className="size-8" /></span><h2 className="mt-5 text-lg font-bold text-[#071a43]">{search || includeInactive ? "ไม่พบสินค้าที่ตรงกับเงื่อนไข" : "ยังไม่มีสินค้า"}</h2><p className="mt-2 text-sm text-slate-500">{search || includeInactive ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง" : "เริ่มต้นด้วยการเพิ่มสินค้าแรกของร้าน"}</p><Link className="mt-5 inline-flex h-11 items-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white" href={search || includeInactive ? "/products" : "/products/new"}>{search || includeInactive ? "ล้างตัวกรอง" : "เพิ่มสินค้าแรก"}</Link></div></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
