"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { InfoIcon, RefreshIcon } from "@/components/icon/icons";
import { Button } from "@/components/ui/button";

export function TransactionHistoryLoadError({
  forbidden = false,
  message,
  requestId,
}: {
  forbidden?: boolean;
  message?: string;
  requestId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="grid min-h-[420px] place-items-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm" role="alert">
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-500">
          <InfoIcon className="size-8" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-[#071a43]">
          {forbidden ? "คุณไม่มีสิทธิ์ดูประวัติรายการ" : "โหลดประวัติรายการไม่สำเร็จ"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {forbidden
            ? "สิทธิ์การใช้งานถูกตรวจสอบโดยระบบหลังบ้าน"
            : message ?? "บริการประวัติรายการเกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่อีกครั้ง"}
        </p>
        {requestId ? <p className="mt-3 text-xs text-slate-400">รหัสอ้างอิง: {requestId}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {forbidden ? (
            <Link className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white" href="/dashboard">
              กลับแดชบอร์ด
            </Link>
          ) : (
            <Button
              isLoading={pending}
              leftIcon={<RefreshIcon className="size-4" />}
              loadingText="กำลังลองใหม่"
              onClick={() => startTransition(() => router.refresh())}
            >
              ลองอีกครั้ง
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
