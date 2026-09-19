import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Button } from "./button";

export function MapControls({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ui-glass flex flex-col overflow-hidden rounded-[var(--radius-lg)] p-1", className)}>{children}</div>;
}

export function MapControlButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <Button variant="map" size="icon" aria-label={label} title={label} className={cn("rounded-[var(--radius-md)] border-0 shadow-none", className)} {...props}>{children}</Button>;
}
