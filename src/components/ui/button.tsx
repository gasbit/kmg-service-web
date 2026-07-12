import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { LoadingSpinner } from "./loading";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  loadingText?: string;
  rightIcon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#1685ff_0%,#0036bf_100%)] text-white shadow-lg shadow-blue-700/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/30 focus:ring-blue-200 active:translate-y-0",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-brand-blue hover:text-brand-blue focus:ring-blue-100",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-brand-blue focus:ring-blue-100",
  icon:
    "text-slate-500 hover:bg-slate-100 hover:text-brand-blue focus:ring-blue-100",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-10 rounded-md px-4 text-sm",
  md: "h-12 rounded-lg px-5 text-sm",
  lg: "h-14 rounded-lg px-5 text-base",
  icon: "h-9 w-9 rounded-md p-0",
};

export function Button({
  children,
  className,
  disabled,
  fullWidth = false,
  isLoading = false,
  leftIcon,
  loadingText,
  rightIcon,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-3 font-bold transition focus:outline-none focus:ring-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && "w-full",
        className,
      )}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : leftIcon}
      {isLoading && loadingText ? loadingText : children}
      {isLoading ? null : rightIcon}
    </button>
  );
}
