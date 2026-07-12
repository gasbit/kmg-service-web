import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  description?: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  title?: ReactNode;
};

export function Dialog({ children, className, description, footer, open = true, title, ...props }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div aria-describedby={description ? "dialog-description" : undefined} aria-labelledby={title ? "dialog-title" : undefined} aria-modal="true" className={cn("w-full max-w-md rounded-2xl border border-white/70 bg-white p-6 text-slate-900 shadow-2xl", className)} role="dialog" {...props}>
        {title ? <h2 className="text-lg font-bold text-[#071a43]" id="dialog-title">{title}</h2> : null}
        {description ? <div className="mt-2 text-sm leading-6 text-slate-600" id="dialog-description">{description}</div> : null}
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
