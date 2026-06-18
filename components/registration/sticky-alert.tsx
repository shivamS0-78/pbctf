import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

interface StickyAlertProps {
  type?: AlertType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const variants: Record<AlertType, { wrap: string; icon: string; Icon: typeof AlertCircle }> = {
  success: { wrap: "border-brand/45 bg-brand-soft",                    icon: "text-brand",          Icon: CheckCircle2 },
  error:   { wrap: "border-[var(--danger)]/55 bg-[var(--danger-soft)]", icon: "text-[var(--danger)]", Icon: AlertCircle },
  warning: { wrap: "border-[var(--warning)]/45 bg-[var(--warning-soft)]", icon: "text-[var(--warning)]", Icon: AlertTriangle },
  info:    { wrap: "border-[var(--info)]/40 bg-[var(--info-soft)]",    icon: "text-[var(--info)]",   Icon: Info },
};

export function StickyAlert({
  type = "info",
  message,
  onClose,
  duration = 5000,
}: StickyAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const effectiveDuration = type === "error" ? Math.max(duration, 10000) : duration;
    if (effectiveDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 280);
      }, effectiveDuration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  if (!isVisible) return null;

  const v = variants[type];
  const Icon = v.Icon;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={[
        "w-full",
        "transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      ].join(" ")}
    >
      <div
        className={[
          "rounded-md p-3.5 md:p-4 relative",
          "border bg-surface-2",
          v.wrap,
          "shadow-card",
          "flex items-center gap-3",
        ].join(" ")}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${v.icon}`} />
        <span className="text-[13.5px] text-ink flex-1 font-body leading-snug">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 280);
          }}
          aria-label="Dismiss"
          className="text-ink-muted hover:text-ink transition-colors flex-shrink-0 w-7 h-7 inline-flex items-center justify-center rounded hover:bg-white/[0.05]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
