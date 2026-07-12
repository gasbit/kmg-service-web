import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "./card";

type LoadingSize = "sm" | "md" | "lg";

type LoadingSpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string;
  size?: LoadingSize;
};

type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  description?: string;
  label?: string;
  size?: LoadingSize;
  variant?: "inline" | "page";
};

type LoadingModalProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  description?: string;
  label?: string;
  open: boolean;
};

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const spinnerSizes: Record<LoadingSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
  lg: "h-10 w-10 border-4",
};

export function LoadingSpinner({
  className,
  label,
  size = "md",
  ...props
}: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent motion-reduce:animate-none",
        spinnerSizes[size],
        className,
      )}
      role={label ? "status" : undefined}
      {...props}
    />
  );
}

export function LoadingState({
  className,
  description,
  label = "กำลังโหลดข้อมูล...",
  size = "lg",
  variant = "inline",
  ...props
}: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center text-center text-slate-600",
        variant === "page" ? "min-h-[45vh] flex-col gap-4 px-6 py-16" : "min-h-32 gap-3 px-4 py-8",
        className,
      )}
      role="status"
      {...props}
    >
      <LoadingSpinner className="text-brand-blue" size={size} />
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
      </div>
    </div>
  );
}

export function LoadingModal({
  className,
  description,
  label = "กำลังโหลดข้อมูล...",
  open,
  ...props
}: LoadingModalProps) {
  if (!open) return null;

  return (
    <div
      aria-busy="true"
      aria-label={label}
      aria-live="assertive"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm",
        className,
      )}
      role="dialog"
      {...props}
    >
      <Card className="w-full max-w-sm" variant="glass">
        <CardContent
          className="flex min-h-56 flex-col items-center justify-center px-8 py-9 text-center"
          variant="glass"
        >
          <LoadingSpinner className="text-brand-blue" size="lg" />
          <p className="mt-5 text-base font-bold text-slate-900">{label}</p>
          {description ? <p className="mt-2 text-sm font-medium text-slate-600">{description}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-slate-200/80 motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
