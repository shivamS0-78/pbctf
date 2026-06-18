import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "yellow" | "info";

interface AlertBannerProps {
  type?: AlertType;
  message: string | React.ReactNode;
  className?: string;
}

const variants: Record<AlertType, { wrap: string; icon: string; Icon: typeof AlertCircle }> = {
  success: {
    wrap: "bg-brand-soft border-brand/40",
    icon: "text-brand",
    Icon: CheckCircle2,
  },
  error: {
    wrap: "bg-[var(--danger-soft)] border-[var(--danger)]/45",
    icon: "text-[var(--danger)]",
    Icon: AlertCircle,
  },
  warning: {
    wrap: "bg-[var(--warning-soft)] border-[var(--warning)]/40",
    icon: "text-[var(--warning)]",
    Icon: AlertTriangle,
  },
  yellow: {
    wrap: "bg-[var(--warning-soft)] border-[var(--warning)]/40",
    icon: "text-[var(--warning)]",
    Icon: AlertTriangle,
  },
  info: {
    wrap: "bg-[var(--info-soft)] border-[var(--info)]/35",
    icon: "text-[var(--info)]",
    Icon: Info,
  },
};

export function AlertBanner({ type = "info", message, className }: AlertBannerProps) {
  const v = variants[type];
  const Icon = v.Icon;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={[
        "relative w-full rounded-md p-3.5 md:p-4",
        "border",
        v.wrap,
        "flex items-start gap-3",
        className || "",
      ].join(" ")}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${v.icon}`} />
      <div className="text-[13px] md:text-[14px] text-ink font-body leading-relaxed min-w-0">
        {typeof message === "string" ? <span>{message}</span> : message}
      </div>
    </div>
  );
}
