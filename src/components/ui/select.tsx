import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, disabled, ...props }: SelectProps) {
  return (
    <span className="relative block">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100",
          disabled && "cursor-not-allowed bg-slate-50/80 text-slate-500 shadow-none",
          className,
        )}
        disabled={disabled}
        {...props}
      />
      <ChevronDownIcon className={cn("pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500", disabled && "text-slate-300")} />
    </span>
  );
}
