"use client";

import { CheckCircleIcon, CloseIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";

export type ToastVariant = "error" | "info" | "success" | "warning";

export type ToastOptions = {
  description?: string;
  duration?: number;
  requestId?: string;
  title: string;
  variant?: ToastVariant;
};

export type ToastItem = ToastOptions & {
  id: string;
};

const variantStyles: Record<ToastVariant, { accent: string; icon: string; iconLabel: string }> = {
  success: { accent: "border-l-emerald-500", icon: "bg-emerald-50 text-emerald-600", iconLabel: "สำเร็จ" },
  error: { accent: "border-l-red-500", icon: "bg-red-50 text-red-600", iconLabel: "ผิดพลาด" },
  warning: { accent: "border-l-amber-500", icon: "bg-amber-50 text-amber-700", iconLabel: "คำเตือน" },
  info: { accent: "border-l-blue-500", icon: "bg-blue-50 text-blue-600", iconLabel: "ข้อมูล" },
};

export function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const variant = item.variant ?? "info";
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "toast-enter pointer-events-auto flex w-full gap-3 rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10",
        styles.accent,
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      <span
        aria-label={styles.iconLabel}
        className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold", styles.icon)}
        role="img"
      >
        {variant === "success" ? <CheckCircleIcon className="size-5" /> : variant === "info" ? "i" : "!"}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-[#071a43]">{item.title}</p>
        {item.description ? <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p> : null}
        {item.requestId ? <p className="mt-1.5 break-all text-xs text-slate-400">รหัสอ้างอิง: {item.requestId}</p> : null}
      </div>
      <button
        aria-label="ปิดการแจ้งเตือน"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        onClick={() => onDismiss(item.id)}
        type="button"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
