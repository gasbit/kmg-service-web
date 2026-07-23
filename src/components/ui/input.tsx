import type { InputHTMLAttributes, ReactNode } from "react";
import { LockIcon } from "@/components/icon/icons";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  wrapperClassName?: string;
};

export function Input({
  className,
  inputClassName,
  leftIcon,
  rightElement,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div
      className={cn(
        "group flex h-14 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100",
        disabled && "cursor-not-allowed border-dashed border-slate-300 bg-slate-100 text-slate-500 shadow-inner shadow-slate-200/60 focus-within:border-slate-300 focus-within:ring-0",
        wrapperClassName,
        className,
      )}
    >
      {leftIcon}
      <input
        data-ui="input"
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-600 disabled:opacity-100 disabled:placeholder:text-slate-500",
          inputClassName,
        )}
        {...props}
      />
      {rightElement}
      {disabled && !rightElement ? <LockIcon aria-hidden="true" className="size-4 shrink-0 text-slate-400" /> : null}
    </div>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={cn("h-4 w-4 rounded border-slate-300 accent-brand-blue", className)}
      type="checkbox"
      {...props}
    />
  );
}
