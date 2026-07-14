"use client";

import { useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type DialogProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  description?: ReactNode;
  dismissible?: boolean;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title?: ReactNode;
};

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Dialog({ children, className, description, dismissible = true, footer, onOpenChange, open = true, title, ...props }: DialogProps) {
  const generatedId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const dismissibleRef = useRef(dismissible);
  const onOpenChangeRef = useRef(onOpenChange);
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    dismissibleRef.current = dismissible;
    onOpenChangeRef.current = onOpenChange;
  }, [dismissible, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      const initialFocus = panel?.querySelector<HTMLElement>("[data-dialog-initial-focus]")
        ?? panel?.querySelector<HTMLElement>(focusableSelector)
        ?? panel;
      initialFocus?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape") {
        if (!dismissibleRef.current) return;
        event.preventDefault();
        onOpenChangeRef.current?.(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissibleRef.current) onOpenChangeRef.current?.(false);
      }}
    >
      <div aria-describedby={description ? descriptionId : undefined} aria-labelledby={title ? titleId : undefined} aria-modal="true" className={cn("max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/70 bg-white p-5 text-slate-900 shadow-2xl sm:p-6", className)} ref={panelRef} role="dialog" tabIndex={-1} {...props}>
        {title ? <h2 className="text-lg font-bold text-[#071a43]" id={titleId}>{title}</h2> : null}
        {description ? <div className="mt-2 text-sm leading-6 text-slate-600" id={descriptionId}>{description}</div> : null}
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto">{footer}</div> : null}
      </div>
    </div>
  );
}
