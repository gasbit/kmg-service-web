"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PlusIcon, RefreshIcon, SearchIcon } from "@/components/icon/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ProductToolbar({ initialSearch = "", includeInactive = false }: { initialSearch?: string; includeInactive?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [refreshing, startRefresh] = useTransition();
  const mounted = useRef(false);

  function updateQuery(values: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const timer = window.setTimeout(() => updateQuery({ search: search.trim() || null }), 400);
    return () => window.clearTimeout(timer);
    // searchParams intentionally excluded: only user-entered search should trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
      <form className="min-w-0 flex-1" onSubmit={(event) => { event.preventDefault(); updateQuery({ search: search.trim() || null }); }} role="search">
        <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="product-search">ค้นหาสินค้า</label>
        <Input id="product-search" leftIcon={<SearchIcon className="size-5" />} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาจากยี่ห้อสินค้า" value={search} wrapperClassName="h-12" />
      </form>
      <div className="w-full xl:w-56">
        <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="product-status">สถานะ</label>
        <Select id="product-status" onChange={(event) => updateQuery({ includeInactive: event.target.value === "all" ? "true" : null })} value={includeInactive ? "all" : "active"}>
          <option value="active">เฉพาะที่ใช้งาน</option>
          <option value="all">ทั้งหมด</option>
        </Select>
      </div>
      <div className="flex gap-3 max-sm:flex-col">
        <Button className="h-12" isLoading={refreshing} leftIcon={<RefreshIcon className="size-4" />} loadingText="กำลังรีเฟรช" onClick={() => startRefresh(() => router.refresh())} variant="secondary">รีเฟรช</Button>
        <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#1685ff_0%,#0036bf_100%)] px-5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:-translate-y-0.5" href="/products/new"><PlusIcon className="size-5" />เพิ่มสินค้า</Link>
      </div>
    </div>
  );
}
