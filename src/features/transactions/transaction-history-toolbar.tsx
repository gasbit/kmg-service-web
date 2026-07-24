"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { PlusIcon, RefreshIcon, SearchIcon } from "@/components/icon/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
} from "./transaction.constants";
import type { TransactionStatus, TransactionType } from "./transaction.types";

type TransactionHistoryToolbarProps = {
  dateFrom: string;
  dateTo: string;
  defaultDateFrom: string;
  defaultDateTo: string;
  initialSearch?: string;
  status?: TransactionStatus;
  transactionType?: TransactionType;
};

export function TransactionHistoryToolbar({
  dateFrom: initialDateFrom,
  dateTo: initialDateTo,
  defaultDateFrom,
  defaultDateTo,
  initialSearch = "",
  status,
  transactionType,
}: TransactionHistoryToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [querying, startQuery] = useTransition();

  const updateQuery = useCallback((values: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.set("page", "1");
    startQuery(() => router.push(`${pathname}?${next.toString()}#transaction-results`, { scroll: false }));
  }, [pathname, router, searchParams]);

  const updateDates = (nextFrom: string, nextTo: string) => {
    if (!nextFrom || !nextTo || nextFrom > nextTo) return;
    updateQuery({ dateFrom: nextFrom, dateTo: nextTo });
  };

  const reset = () => {
    setSearch("");
    setDateFrom(defaultDateFrom);
    setDateTo(defaultDateTo);
    const query = new URLSearchParams({
      dateFrom: defaultDateFrom,
      dateTo: defaultDateTo,
      limit: "10",
      page: "1",
    });
    startQuery(() => router.push(`${pathname}?${query.toString()}#transaction-results`, { scroll: false }));
  };

  return (
    <div aria-busy={querying || undefined}>
      <span aria-live="polite" className="sr-only" role="status">
        {querying ? "กำลังอัปเดตประวัติรายการ" : ""}
      </span>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(220px,1.2fr)_minmax(270px,1.25fr)_minmax(165px,.8fr)_minmax(150px,.7fr)_auto]">
        <form
          className="min-w-0"
          onSubmit={(event) => {
            event.preventDefault();
            updateQuery({ search: search.trim() || null });
          }}
          role="search"
        >
          <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="transaction-search">
            ค้นหา
          </label>
          <Input
            id="transaction-search"
            maxLength={150}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="เลขรายการ ชื่อลูกค้า หรือเบอร์โทร"
            rightElement={(
              <button
                aria-label="ค้นหาประวัติรายการ"
                className="grid size-8 place-items-center rounded-md text-blue-600 transition hover:bg-blue-50"
                type="submit"
              >
                <SearchIcon className="size-5" />
              </button>
            )}
            value={search}
            wrapperClassName="h-12"
          />
        </form>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-slate-600">ช่วงวันที่</legend>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Input
              aria-label="ตั้งแต่วันที่"
              max={dateTo}
              onChange={(event) => {
                const next = event.target.value;
                setDateFrom(next);
                updateDates(next, dateTo);
              }}
              type="date"
              value={dateFrom}
              wrapperClassName="h-12 px-3"
            />
            <span aria-hidden="true" className="text-sm text-slate-400">–</span>
            <Input
              aria-label="ถึงวันที่"
              min={dateFrom}
              onChange={(event) => {
                const next = event.target.value;
                setDateTo(next);
                updateDates(dateFrom, next);
              }}
              type="date"
              value={dateTo}
              wrapperClassName="h-12 px-3"
            />
          </div>
          {dateFrom && dateTo && dateFrom > dateTo ? (
            <p className="mt-1.5 text-xs text-red-600" role="alert">วันเริ่มต้นต้องไม่เกินวันสิ้นสุด</p>
          ) : null}
        </fieldset>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="transaction-type">
            ประเภทรายการ
          </label>
          <Select
            id="transaction-type"
            onChange={(event) => updateQuery({ transactionType: event.target.value === "all" ? null : event.target.value })}
            value={transactionType ?? "all"}
          >
            <option value="all">ทั้งหมด</option>
            {Object.values(TRANSACTION_TYPES).map((type) => (
              <option key={type} value={type}>{TRANSACTION_TYPE_LABELS[type as TransactionType]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600" htmlFor="transaction-status">
            สถานะ
          </label>
          <Select
            id="transaction-status"
            onChange={(event) => updateQuery({ status: event.target.value === "all" ? null : event.target.value })}
            value={status ?? "all"}
          >
            <option value="all">ทั้งหมด</option>
            {Object.values(TRANSACTION_STATUSES).map((value) => (
              <option key={value} value={value}>{TRANSACTION_STATUS_LABELS[value]}</option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2 lg:flex-row lg:justify-end 2xl:col-span-1 2xl:self-end">
          <Button
            className="h-12"
            disabled={querying}
            leftIcon={<RefreshIcon className="size-4" />}
            onClick={reset}
            variant="secondary"
          >
            ล้างตัวกรอง
          </Button>
          <ButtonLink className="h-12" href="/transactions/new" leftIcon={<PlusIcon className="size-5" />}>
            สร้างรายการใหม่
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
