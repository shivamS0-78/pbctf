"use client";

import { LucideIcon } from "lucide-react";

interface SectionTabProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export function SectionTab({ active, onClick, icon: Icon, label }: SectionTabProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        "relative inline-flex items-center gap-2 px-4 h-10 rounded-md",
        "border transition-[background,border-color,color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        active
          ? "bg-brand-soft border-brand/55 text-brand shadow-[inset_0_0_0_1px_var(--brand-soft)]"
          : "bg-surface-1 border-[var(--border-soft)] text-ink-secondary hover:text-ink hover:border-[var(--border-default)]",
      ].join(" ")}
    >
      <Icon className="w-4 h-4" />
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] font-medium">
        {label}
      </span>
      {active && (
        <span className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-brand to-transparent" />
      )}
    </button>
  );
}
