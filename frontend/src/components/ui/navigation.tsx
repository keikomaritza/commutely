"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

export type NavigationItem = { id: string; label: string; icon: ReactNode; disabled?: boolean };

export function MapNavigation({ items, activeId, onChange, className }: { items: NavigationItem[]; activeId: string; onChange: (id: string) => void; className?: string }) {
  return <nav aria-label="Navigasi utama peta" className={cn("ui-glass flex w-full items-center gap-2 rounded-[var(--radius-xl)] p-2 md:flex-col md:items-stretch", className)}>
    {items.map((item) => {
      const active = item.id === activeId;
      return <button key={item.id} type="button" disabled={item.disabled} aria-current={active ? "page" : undefined} onClick={() => onChange(item.id)} className={cn("ui-interactive ui-soft-focus flex min-h-12 flex-1 items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 text-left text-sm font-semibold disabled:opacity-40 md:flex-none", active ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] shadow-[0_4px_14px_rgba(238,91,155,.08)]" : "text-[var(--color-muted)] hover:bg-white/75 hover:text-[var(--color-ink)]")}><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-base">{item.icon}</span><span>{item.label}</span></button>;
    })}
  </nav>;
}
