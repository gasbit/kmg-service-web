import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  textareaClassName?: string;
  wrapperClassName?: string;
};

export function Textarea({
  className,
  textareaClassName,
  wrapperClassName,
  ...props
}: TextareaProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-sm transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100",
        wrapperClassName,
        className,
      )}
    >
      <textarea
        className={cn(
          "min-h-24 w-full resize-y bg-transparent text-sm font-medium leading-6 text-slate-900 outline-none placeholder:text-slate-400",
          textareaClassName,
        )}
        {...props}
      />
    </div>
  );
}
