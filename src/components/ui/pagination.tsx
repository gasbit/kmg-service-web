"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "./select";

type PaginationProps = {
  anchorId?: string;
  basePath: string;
  limit: number;
  limitOptions?: number[];
  page: number;
  searchParams: Record<string, string | undefined>;
  totalItems: number;
  totalPages: number;
};

type PageToken = number | "ellipsis";

function pageTokens(page: number, totalPages: number): PageToken[] {
  const visible = new Set([1, totalPages, page - 1, page, page + 1].filter((item) => item >= 1 && item <= totalPages));
  const ordered = [...visible].sort((left, right) => left - right);
  const tokens: PageToken[] = [];

  ordered.forEach((item, index) => {
    if (index > 0 && item - ordered[index - 1] > 1) tokens.push("ellipsis");
    tokens.push(item);
  });
  return tokens;
}

export function Pagination({
  anchorId,
  basePath,
  limit,
  limitOptions = [10, 20, 50],
  page,
  searchParams,
  totalItems,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const start = totalItems ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, totalItems);
  const href = (targetPage: number, targetLimit = limit) => {
    const query = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    query.set("limit", String(targetLimit));
    query.set("page", String(targetPage));
    return `${basePath}?${query.toString()}${anchorId ? `#${anchorId}` : ""}`;
  };

  return (
    <nav
      aria-busy={pending || undefined}
      aria-label="การแบ่งหน้าผลลัพธ์"
      className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between"
    >
      <p>
        แสดง {start.toLocaleString("th-TH")}–{end.toLocaleString("th-TH")} จาก{" "}
        {totalItems.toLocaleString("th-TH")} รายการ
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5">
          {page > 1 ? (
            <Link
              aria-label="หน้าก่อนหน้า"
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white font-bold transition hover:border-blue-400 hover:text-blue-600"
              href={href(page - 1)}
              scroll={false}
            >
              ‹
            </Link>
          ) : (
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg border border-slate-100 text-slate-300">‹</span>
          )}

          {pageTokens(page, totalPages).map((token, index) =>
            token === "ellipsis" ? (
              <span aria-hidden="true" className="grid size-10 place-items-center text-slate-400" key={`ellipsis-${index}`}>…</span>
            ) : (
              <Link
                aria-current={token === page ? "page" : undefined}
                aria-label={`หน้า ${token}`}
                className={`grid size-10 place-items-center rounded-lg border font-semibold transition ${
                  token === page
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
                }`}
                href={href(token)}
                key={token}
                scroll={false}
              >
                {token.toLocaleString("th-TH")}
              </Link>
            ),
          )}

          {page < totalPages ? (
            <Link
              aria-label="หน้าถัดไป"
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white font-bold transition hover:border-blue-400 hover:text-blue-600"
              href={href(page + 1)}
              scroll={false}
            >
              ›
            </Link>
          ) : (
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg border border-slate-100 text-slate-300">›</span>
          )}
        </div>

        <Select
          aria-label="จำนวนรายการต่อหน้า"
          className="h-10 min-w-28"
          disabled={pending}
          onChange={(event) => {
            const nextLimit = Number(event.target.value);
            startTransition(() => router.push(href(1, nextLimit), { scroll: false }));
          }}
          value={String(limit)}
        >
          {limitOptions.map((size) => <option key={size} value={size}>{size} / หน้า</option>)}
        </Select>
      </div>
    </nav>
  );
}
