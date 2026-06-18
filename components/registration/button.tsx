import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const sizeMap: Record<Size, string> = {
  sm: "h-9  px-3.5 text-[12px] gap-1.5",
  md: "h-11 px-5   text-[13px] gap-2",
  lg: "h-12 px-6   text-[14px] gap-2",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-ink font-semibold " +
    "hover:bg-brand-hover hover:shadow-glow-md " +
    "active:bg-brand-press active:translate-y-px " +
    "border border-brand",
  secondary:
    "bg-surface-1 text-ink hover:bg-surface-2 " +
    "border border-[var(--border-default)] hover:border-[var(--border-brand)] " +
    "hover:text-brand",
  ghost:
    "bg-transparent text-ink-secondary hover:text-ink " +
    "border border-transparent hover:border-[var(--border-soft)] " +
    "hover:bg-white/[0.03]",
  danger:
    "bg-transparent text-[var(--danger)] " +
    "border border-[var(--danger)]/40 hover:border-[var(--danger)] " +
    "hover:bg-[var(--danger-soft)]",
};

export function Button({
  onClick,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const disabledCls = disabled
    ? "!bg-surface-1 !text-ink-disabled !border-[var(--border-hairline)] !shadow-none cursor-not-allowed pointer-events-none"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center",
        "rounded-md",
        "font-medium tracking-[0.02em]",
        "transition-[background,border-color,color,box-shadow,transform] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "whitespace-nowrap select-none",
        sizeMap[size],
        variantMap[variant],
        disabledCls,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
