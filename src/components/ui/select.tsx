import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon, LockIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, disabled, ...props }: SelectProps) {
  return (
    <span className="relative block">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100",
          disabled && "cursor-not-allowed border-dashed border-slate-300 bg-slate-100 text-slate-600 shadow-inner shadow-slate-200/60",
          className,
        )}
        disabled={disabled}
        {...props}
      />
      {disabled ? (
        <LockIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      ) : (
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      )}
    </span>
  );
}
