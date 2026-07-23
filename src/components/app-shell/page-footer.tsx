import type { ReactNode } from "react";

type PageFooterProps = {
  actions: ReactNode;
  leading?: ReactNode;
};

export function PageFooter({ actions, leading }: PageFooterProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0"
      />
      <footer
        aria-label="การทำงานของหน้า"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:left-[248px]"
      >
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3">
          <div className="flex shrink-0 items-center">{leading}</div>
          <div className="flex min-w-0 items-center justify-end gap-3">{actions}</div>
        </div>
      </footer>
    </>
  );
}
