import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TextLabelAs = "p" | "span" | "h1" | "h2" | "h3" | "label";
type TextLabelVariant =
  | "eyebrow"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "form";

type TextLabelProps = HTMLAttributes<HTMLElement> & {
  as?: TextLabelAs;
  children: ReactNode;
  srOnly?: boolean;
  variant?: TextLabelVariant;
};

const variants: Record<TextLabelVariant, string> = {
  eyebrow: "text-base font-semibold text-slate-700 max-md:text-sm",
  title:
    "text-3xl font-extrabold leading-tight text-brand-blue-strong max-md:text-2xl",
  subtitle: "text-base font-medium text-slate-700 max-md:text-sm",
  body: "text-sm leading-6 text-slate-700",
  caption: "text-xs font-medium text-slate-400",
  form: "text-sm font-semibold text-slate-700",
};

export function TextLabel({
  as: Component = "span",
  children,
  className,
  srOnly = false,
  variant = "body",
  ...props
}: TextLabelProps) {
  return (
    <Component
      className={cn(srOnly ? "sr-only" : variants[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
