"use client";

import { HudFrame } from "./hud-frame";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** Show subtle HUD corner brackets */
  hudCorners?: boolean;
  /** Compact padding */
  compact?: boolean;
}

export function Card({
  children,
  onClick,
  className = "",
  hudCorners = false,
  compact = false,
}: CardProps) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={[
        "relative rounded-lg",
        compact ? "p-4" : "p-5 md:p-6",
        "card-surface",
        "border border-[var(--border-soft)]",
        "transition-[background,border-color,box-shadow,transform] duration-200 ease-out",
        interactive
          ? "cursor-pointer hover:border-[var(--border-brand)] hover:shadow-glow-sm"
          : "",
        className,
      ].join(" ")}
    >
      <HudFrame />
      <div className="relative">{children}</div>
    </div>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, title, eyebrow, action, className = "" }: CardSectionProps) {
  return (
    <div className={["flex items-start justify-between gap-3 mb-4", className].join(" ")}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-mono text-[10.5px] uppercase tracking-[0.18em] text-brand mb-1.5">
            {eyebrow}
          </div>
        )}
        {title && (
          <h3 className="font-heading text-[18px] md:text-[20px] font-semibold text-ink tracking-tight leading-tight">
            {title}
          </h3>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
