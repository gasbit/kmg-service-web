import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "glass";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

type CardContentVariant = "default" | "glass";

type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardContentVariant;
};

const cardVariants: Record<CardVariant, string> = {
  default:
    "border-slate-200/90 bg-white/88 shadow-blue-950/12 backdrop-blur-xl",
  glass:
    "border-white/70 bg-white/8 shadow-blue-950/14 backdrop-blur-3xl shadow-[0_30px_90px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(255,255,255,0.24)]",
};

const cardContentVariants: Record<CardContentVariant, string> = {
  default: "",
  glass:
    "border border-white/55 bg-[linear-gradient(120deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.18)_48%,rgba(148,163,184,0.24)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_0_30px_rgba(255,255,255,0.22)] backdrop-blur-3xl",
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border shadow-2xl",
        cardVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  variant = "default",
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn(
        "rounded-[inherit] px-8 py-9 max-lg:px-7 max-md:px-5 max-md:py-7",
        cardContentVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
