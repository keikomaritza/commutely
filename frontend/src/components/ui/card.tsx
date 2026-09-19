import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-xl)] border border-white/90 bg-white/88 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl transition duration-200 hover:shadow-[var(--shadow-float)]", className)} {...props} />;
}
