"use client";

import Link from "next/link";
import { Select } from "@/components/ui/select";
import type { ProductPagination as PaginationData } from "./product.types";

function href(searchParams: Record<string, string | undefined>, page: number, limit?: number) {
  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => { if (value) query.set(key, value); });
  query.set("page", String(page));
  if (limit) query.set("limit", String(limit));
  return `/products?${query.toString()}`;
}

export function ProductPagination({ pagination, searchParams }: { pagination: PaginationData; searchParams: Record<string, string | undefined> }) {
  const { page, limit, totalItems, totalPages } = pagination;
  const start = totalItems ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, totalItems);
  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>แสดง {start.toLocaleString("th-TH")}–{end.toLocaleString("th-TH")} จาก {totalItems.toLocaleString("th-TH")} รายการ</p>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? <Link className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white font-bold hover:border-blue-400 hover:text-blue-600" href={href(searchParams, page - 1)} aria-label="หน้าก่อนหน้า">‹</Link> : <span className="grid size-10 place-items-center rounded-lg border border-slate-100 text-slate-300">‹</span>}
        <span className="px-2 font-semibold text-slate-800">หน้า {page.toLocaleString("th-TH")} จาก {Math.max(totalPages, 1).toLocaleString("th-TH")}</span>
        {page < totalPages ? <Link className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white font-bold hover:border-blue-400 hover:text-blue-600" href={href(searchParams, page + 1)} aria-label="หน้าถัดไป">›</Link> : <span className="grid size-10 place-items-center rounded-lg border border-slate-100 text-slate-300">›</span>}
        <form action="/products" className="ml-1">
          {Object.entries(searchParams).filter(([key, value]) => key !== "limit" && key !== "page" && value).map(([key, value]) => <input key={key} name={key} type="hidden" value={value} />)}
          <Select aria-label="จำนวนรายการต่อหน้า" className="h-10 min-w-24" defaultValue={String(limit)} name="limit" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
            {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size} / หน้า</option>)}
          </Select>
        </form>
      </div>
    </div>
  );
}
