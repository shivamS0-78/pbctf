import React from "react";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: string | undefined | null;
  icon: LucideIcon;
}

type Variant = {
  cls: string;
  dot: string;
};

const variantMap: Record<string, Variant> = {
  rsvped:        { cls: "bg-brand-soft border-brand/45 text-brand",                dot: "bg-brand" },
  confirmed:     { cls: "bg-brand-soft border-brand/45 text-brand",                dot: "bg-brand" },
  shortlisted:   { cls: "bg-brand-soft border-brand/45 text-brand",                dot: "bg-brand" },
  accepted:      { cls: "bg-brand-soft border-brand/45 text-brand",                dot: "bg-brand" },
  pending:       { cls: "bg-[var(--warning-soft)] border-[var(--warning)]/40 text-[var(--warning)]", dot: "bg-[var(--warning)]" },
  active:        { cls: "bg-[var(--warning-soft)] border-[var(--warning)]/40 text-[var(--warning)]", dot: "bg-[var(--warning)]" },
  "under-review":{ cls: "bg-[var(--warning-soft)] border-[var(--warning)]/40 text-[var(--warning)]", dot: "bg-[var(--warning)]" },
  submitted:     { cls: "bg-[var(--info-soft)] border-[var(--info)]/35 text-[var(--info)]",     dot: "bg-[var(--info)]" },
  declined:      { cls: "bg-[var(--danger-soft)] border-[var(--danger)]/35 text-[var(--danger)]", dot: "bg-[var(--danger)]" },
  rejected:      { cls: "bg-[var(--danger-soft)] border-[var(--danger)]/35 text-[var(--danger)]", dot: "bg-[var(--danger)]" },
  rsvp_declined: { cls: "bg-[var(--danger-soft)] border-[var(--danger)]/35 text-[var(--danger)]", dot: "bg-[var(--danger)]" },
  withdrawn:     { cls: "bg-white/[0.03] border-[var(--border-soft)] text-ink-muted",            dot: "bg-ink-muted" },
};

export function StatusBadge({ status, icon: Icon }: StatusBadgeProps) {
  const key = (status || "").toString().toLowerCase();
  const v = variantMap[key] ?? {
    cls: "bg-white/[0.03] border-[var(--border-soft)] text-ink-secondary",
    dot: "bg-ink-muted",
  };

  return (
    <div
      className={[
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md",
        "border",
        v.cls,
      ].join(" ")}
    >
      <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${v.dot}`}>
        <span className="absolute inset-0 rounded-full opacity-60 anim-pulse-soft" style={{ background: "currentColor" }} />
      </span>
      <Icon className="w-3.5 h-3.5 opacity-80" />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
        {status || "unknown"}
      </span>
    </div>
  );
}
