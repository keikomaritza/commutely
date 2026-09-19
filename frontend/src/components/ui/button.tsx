import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "map";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export function Button({ variant = "primary", size = "md", className, children, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; children: ReactNode }) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[var(--color-primary)] text-white shadow-[0_8px_22px_rgba(238,91,155,.22)] hover:bg-[var(--color-primary-strong)] hover:shadow-[0_12px_28px_rgba(238,91,155,.25)]",
    secondary: "border border-[var(--color-line)] bg-white/90 text-[var(--color-ink)] shadow-[var(--shadow-soft)] hover:border-[var(--color-primary-soft)] hover:bg-[#fffafd]",
    ghost: "bg-transparent text-[var(--color-ink)] hover:bg-black/[.04]",
    danger: "bg-[var(--color-risk)] text-white shadow-[0_8px_22px_rgba(233,90,118,.2)] hover:brightness-95",
    map: "border border-white/80 bg-white/88 text-[var(--color-ink)] shadow-[var(--shadow-card)] backdrop-blur-xl hover:bg-white",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "min-h-9 px-3 text-sm", md: "min-h-11 px-4 text-sm", lg: "min-h-12 px-5 text-base", icon: "size-11 p-0",
  };
  return <button type={type} className={cn("ui-button ui-soft-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-soft)] disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} {...props}>{children}</button>;
}
