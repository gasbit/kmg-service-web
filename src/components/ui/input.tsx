import type { InputHTMLAttributes, ReactNode } from "react";
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
        wrapperClassName,
        className,
      )}
    >
      {leftIcon}
      <input
        data-ui="input"
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400",
          inputClassName,
        )}
        {...props}
      />
      {rightElement}
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
