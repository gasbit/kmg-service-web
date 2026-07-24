import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  CloseCircleIcon,
  EyeIcon,
  TruckIcon,
} from "@/components/icon/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPE_LABELS,
} from "./transaction.constants";
import type { TransactionStatus, TransactionSummary, TransactionType } from "./transaction.types";

const statusTone: Record<TransactionStatus, string> = {
  [TRANSACTION_STATUSES.PENDING]: "bg-amber-50 text-amber-700 ring-amber-200/70",
  [TRANSACTION_STATUSES.IN_PROGRESS]: "bg-blue-50 text-blue-700 ring-blue-200/70",
  [TRANSACTION_STATUSES.COMPLETED]: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  [TRANSACTION_STATUSES.CANCELLED]: "bg-red-50 text-red-600 ring-red-200/70",
};

function StatusIcon({ status }: { status: TransactionStatus }) {
  if (status === TRANSACTION_STATUSES.COMPLETED) return <CheckCircleIcon className="size-3.5" />;
  if (status === TRANSACTION_STATUSES.CANCELLED) return <CloseCircleIcon className="size-3.5" />;
  if (status === TRANSACTION_STATUSES.IN_PROGRESS) return <TruckIcon className="size-3.5" />;
  return <ClockIcon className="size-3.5" />;
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone[status]}`}>
      <StatusIcon status={status} />
      {TRANSACTION_STATUS_LABELS[status]}
    </span>
  );
}

function Quantity({ transaction }: { transaction: TransactionSummary }) {
  return (
    <div className="whitespace-nowrap">
      <p className="font-semibold text-slate-800">{transaction.totalQuantity.toLocaleString("th-TH")} ถัง</p>
      {transaction.itemCount > 1 ? (
        <p className="mt-0.5 text-xs text-slate-400">{transaction.itemCount.toLocaleString("th-TH")} สินค้า</p>
      ) : null}
    </div>
  );
}

function Customer({ transaction }: { transaction: TransactionSummary }) {
  return (
    <div className="w-32 max-w-32">
      <p className="break-words font-semibold leading-5 text-[#071a43]">{transaction.customerName}</p>
      <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
        {transaction.customerPhone ? formatPhone(transaction.customerPhone) : "—"}
      </p>
    </div>
  );
}

export function TransactionTable({ transactions }: { transactions: TransactionSummary[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <caption className="sr-only">ประวัติรายการตามตัวกรองปัจจุบัน</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center" scope="col">เลขรายการ</TableHead>
              <TableHead className="text-center" scope="col">วันที่ / เวลา</TableHead>
              <TableHead className="w-32 max-w-32 text-center" scope="col">ลูกค้า</TableHead>
              <TableHead className="min-w-48 text-center" scope="col">ประเภทรายการ</TableHead>
              <TableHead className="text-center" scope="col">จำนวน</TableHead>
              <TableHead className="text-center" scope="col">ยอดรวม (บาท)</TableHead>
              <TableHead className="text-center" scope="col">สถานะ</TableHead>
              <TableHead className="text-center" scope="col">สร้างโดย</TableHead>
              <TableHead className="text-center" scope="col">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow className="group" key={transaction.id}>
                <TableCell>
                  <Link className="whitespace-nowrap font-bold text-blue-700 hover:underline" href={`/transactions/${transaction.id}`}>
                    {transaction.transactionNo}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-slate-500">{formatDate(transaction.createdAt)}</TableCell>
                <TableCell className="w-32 max-w-32"><Customer transaction={transaction} /></TableCell>
                <TableCell className="min-w-48">
                  <span className="inline-flex min-w-44 justify-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-700">
                    {TRANSACTION_TYPE_LABELS[transaction.transactionType as TransactionType] ?? transaction.transactionType}
                  </span>
                </TableCell>
                <TableCell><Quantity transaction={transaction} /></TableCell>
                <TableCell className="whitespace-nowrap text-right font-bold tabular-nums text-[#071a43]">
                  {formatCurrency(transaction.totalAmount)}
                </TableCell>
                <TableCell><TransactionStatusBadge status={transaction.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-sm font-medium text-slate-600">{transaction.createdBy.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      aria-label={`ดูรายละเอียดรายการ ${transaction.transactionNo}`}
                      className="grid size-10 place-items-center rounded-lg border border-blue-200 text-blue-600 transition group-hover:border-blue-300 hover:bg-blue-50"
                      href={`/transactions/${transaction.id}`}
                      title="ดูรายละเอียด"
                    >
                      <EyeIcon className="size-4" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {transactions.map((transaction) => (
          <article className="p-5" key={transaction.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link className="font-bold text-blue-700 hover:underline" href={`/transactions/${transaction.id}`}>
                  {transaction.transactionNo}
                </Link>
                <p className="mt-1 text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
              </div>
              <TransactionStatusBadge status={transaction.status} />
            </div>

            <div className="mt-4">
              <Customer transaction={transaction} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">ประเภทรายการ</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {TRANSACTION_TYPE_LABELS[transaction.transactionType as TransactionType] ?? transaction.transactionType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">จำนวน</dt>
                <dd className="mt-1"><Quantity transaction={transaction} /></dd>
              </div>
              <div className="text-right">
                <dt className="text-xs text-slate-500">ยอดรวม</dt>
                <dd className="mt-1 font-bold tabular-nums text-[#071a43]">{formatCurrency(transaction.totalAmount)} บาท</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">สร้างโดย</dt>
                <dd className="mt-1 font-semibold text-slate-800">{transaction.createdBy.name}</dd>
              </div>
            </dl>

            <Link
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 font-semibold text-blue-700 transition hover:bg-blue-50"
              href={`/transactions/${transaction.id}`}
            >
              <EyeIcon className="size-4" />
              ดูรายละเอียด
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
