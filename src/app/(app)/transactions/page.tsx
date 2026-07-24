import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { CalendarIcon, HistoryIcon, PlusIcon, ReceiptIcon } from "@/components/icon/icons";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getTransactions } from "@/features/transactions/transaction.api";
import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from "@/features/transactions/transaction.constants";
import { TransactionHistoryLoadError } from "@/features/transactions/transaction-history-load-error";
import { TransactionHistoryToolbar } from "@/features/transactions/transaction-history-toolbar";
import { TransactionTable } from "@/features/transactions/transaction-table";
import type {
  TransactionStatus,
  TransactionType,
} from "@/features/transactions/transaction.types";
import { ApiError, NETWORK_ERROR_CODE, toUserMessage } from "@/lib/api/errors";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type HistoryQuery = {
  dateFrom: string;
  dateTo: string;
  limit: number;
  page: number;
  search?: string;
  status?: TransactionStatus;
  transactionType?: TransactionType;
};

const limits = new Set([10, 20, 50]);
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : undefined;
const positiveInt = (input: string | undefined, fallback: number) => {
  const parsed = Number(input);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

function bangkokToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Bangkok",
    year: "numeric",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const year = part("year");
  const month = part("month");
  const day = part("day");
  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${day}`,
  };
}

function isCalendarDate(input: string | undefined): input is string {
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const parsed = new Date(`${input}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(input);
}

function historyHref(query: HistoryQuery) {
  const params = new URLSearchParams({
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    limit: String(query.limit),
    page: String(query.page),
  });
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.transactionType) params.set("transactionType", query.transactionType);
  return `/transactions?${params.toString()}`;
}

function normalizeQuery(raw: Record<string, string | string[] | undefined>) {
  const defaults = bangkokToday();
  const rawSearch = value(raw.search);
  const search = rawSearch?.trim().slice(0, 150) || undefined;
  const rawDateFrom = value(raw.dateFrom);
  const rawDateTo = value(raw.dateTo);
  let dateFrom = isCalendarDate(rawDateFrom) ? rawDateFrom : defaults.dateFrom;
  let dateTo = isCalendarDate(rawDateTo) ? rawDateTo : defaults.dateTo;
  let invalid = Boolean(
    (rawSearch !== undefined && rawSearch !== search)
    || (rawDateFrom !== undefined && !isCalendarDate(rawDateFrom))
    || (rawDateTo !== undefined && !isCalendarDate(rawDateTo)),
  );

  if (dateFrom > dateTo) {
    dateFrom = defaults.dateFrom;
    dateTo = defaults.dateTo;
    invalid = true;
  }

  const rawPage = value(raw.page);
  const page = positiveInt(rawPage, 1);
  if (rawPage !== undefined && rawPage !== String(page)) invalid = true;

  const rawLimit = value(raw.limit);
  const parsedLimit = positiveInt(rawLimit, 10);
  const limit = limits.has(parsedLimit) ? parsedLimit : 10;
  if (rawLimit !== undefined && rawLimit !== String(limit)) invalid = true;

  const rawStatus = value(raw.status);
  const status = Object.values(TRANSACTION_STATUSES).includes(rawStatus as TransactionStatus)
    ? rawStatus as TransactionStatus
    : undefined;
  if (rawStatus !== undefined && !status) invalid = true;

  const rawType = value(raw.transactionType);
  const transactionType = Object.values(TRANSACTION_TYPES).includes(rawType as TransactionType)
    ? rawType as TransactionType
    : undefined;
  if (rawType !== undefined && !transactionType) invalid = true;

  return {
    defaults,
    invalid,
    query: { dateFrom, dateTo, limit, page, search, status, transactionType } satisfies HistoryQuery,
  };
}

export default async function TransactionsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { defaults, invalid, query } = normalizeQuery(raw);
  if (invalid) redirect(historyHref(query));

  let result;
  try {
    result = await getTransactions(query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/session/clear");
    const message = error instanceof ApiError && error.code === NETWORK_ERROR_CODE
      ? toUserMessage(error.code)
      : undefined;
    return (
      <main>
        <PageHeader description="ค้นหาและตรวจสอบรายการย้อนหลัง" title="ประวัติรายการ" />
        <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
          <TransactionHistoryLoadError
            forbidden={error instanceof ApiError && error.status === 403}
            message={message}
            requestId={error instanceof ApiError ? error.requestId : undefined}
          />
        </div>
      </main>
    );
  }

  const { pagination, transactions } = result;
  const lastPage = Math.max(pagination.totalPages, 1);
  if (query.page > lastPage) redirect(historyHref({ ...query, page: lastPage }));

  const searchParamsForPagination = {
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    search: query.search,
    status: query.status,
    transactionType: query.transactionType,
  };
  const hasCustomFilters = Boolean(
    query.search
    || query.status
    || query.transactionType
    || query.dateFrom !== defaults.dateFrom
    || query.dateTo !== defaults.dateTo,
  );
  const toolbarKey = new URLSearchParams({
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    search: query.search ?? "",
    status: query.status ?? "",
    transactionType: query.transactionType ?? "",
  }).toString();

  return (
    <main>
      <PageHeader description="ค้นหาและตรวจสอบรายการย้อนหลัง" title="ประวัติรายการ" />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <TransactionHistoryToolbar
              dateFrom={query.dateFrom}
              dateTo={query.dateTo}
              defaultDateFrom={defaults.dateFrom}
              defaultDateTo={defaults.dateTo}
              initialSearch={query.search}
              key={toolbarKey}
              status={query.status}
              transactionType={query.transactionType}
            />
          </div>

          <div
            aria-labelledby="transaction-results-heading"
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            id="transaction-results"
            tabIndex={-1}
          >
            <h2 className="sr-only" id="transaction-results-heading">ผลลัพธ์ประวัติรายการ</h2>
            <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">
              พบ {pagination.totalItems.toLocaleString("th-TH")} รายการ หน้า {query.page.toLocaleString("th-TH")} จาก {lastPage.toLocaleString("th-TH")}
            </p>

            <div className="grid border-y border-slate-100 sm:grid-cols-3">
              {[
                {
                  icon: HistoryIcon,
                  label: "ผลลัพธ์ทั้งหมด",
                  tone: "bg-blue-50 text-blue-600",
                  unit: "รายการ",
                  value: pagination.totalItems,
                },
                {
                  icon: CalendarIcon,
                  label: "หน้าปัจจุบัน",
                  tone: "bg-violet-50 text-violet-600",
                  unit: `จาก ${lastPage.toLocaleString("th-TH")} หน้า`,
                  value: query.page,
                },
                {
                  icon: ReceiptIcon,
                  label: "แสดงในหน้านี้",
                  tone: "bg-emerald-50 text-emerald-600",
                  unit: "รายการ",
                  value: transactions.length,
                },
              ].map((metric) => (
                <div className="flex items-center gap-4 border-slate-100 px-5 py-4 sm:border-r sm:last:border-r-0" key={metric.label}>
                  <span className={`grid size-11 place-items-center rounded-xl ${metric.tone}`}>
                    <metric.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                    <p className="mt-0.5 text-2xl font-bold text-[#071a43]">
                      {metric.value.toLocaleString("th-TH")}{" "}
                      <span className="text-xs font-medium text-slate-500">{metric.unit}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {transactions.length ? (
              <>
                <TransactionTable transactions={transactions} />
                <Pagination
                  anchorId="transaction-results"
                  basePath="/transactions"
                  limit={pagination.limit}
                  page={pagination.page}
                  searchParams={searchParamsForPagination}
                  totalItems={pagination.totalItems}
                  totalPages={pagination.totalPages}
                />
              </>
            ) : (
              <div className="grid min-h-80 place-items-center px-6 py-14 text-center">
                <div className="max-w-md">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-500">
                    <ReceiptIcon className="size-8" />
                  </span>
                  <h2 className="mt-5 text-lg font-bold text-[#071a43]">
                    {hasCustomFilters ? "ไม่พบรายการที่ตรงกับเงื่อนไข" : "ยังไม่มีรายการในช่วงเวลานี้"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {hasCustomFilters
                      ? "ลองเปลี่ยนคำค้นหา ช่วงวันที่ ประเภท หรือสถานะ"
                      : "เมื่อมีการสร้างรายการ ประวัติจะปรากฏที่หน้านี้"}
                  </p>
                  <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                    {hasCustomFilters ? (
                      <Link
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                        href={historyHref({ ...query, dateFrom: defaults.dateFrom, dateTo: defaults.dateTo, page: 1, search: undefined, status: undefined, transactionType: undefined })}
                      >
                        ล้างตัวกรอง
                      </Link>
                    ) : null}
                    <ButtonLink href="/transactions/new" leftIcon={<PlusIcon className="size-4" />} size="sm">
                      สร้างรายการใหม่
                    </ButtonLink>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
