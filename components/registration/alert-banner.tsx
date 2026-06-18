import React from "react";
import { AlertCircle } from "lucide-react";

interface AlertBannerProps {
  type?: "success" | "error" | "warning" | "yellow" | "info";
  message: string | React.ReactNode;
  className?: string;
}

export function AlertBanner({
  type = "info",
  message,
  className,
}: AlertBannerProps) {
  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.5)] shadow-[0_0_20px_rgba(0,255,136,0.06)]";
      case "error":
        return "bg-[rgba(0,0,0,0.7)] border-[rgba(0,255,136,0.4)]";
      case "warning":
        return "bg-[rgba(140,255,0,0.05)] border-[rgba(140,255,0,0.4)]";
      case "yellow":
        return "bg-[rgba(140,255,0,0.05)] border-[rgba(140,255,0,0.4)]";
      case "info":
        return "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]";
      default:
        return "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-[#00FF88]";
      case "error":
        return "text-[rgba(0,255,136,0.8)]";
      case "warning":
      case "yellow":
        return "text-[#8CFF00]";
      default:
        return "text-white/60";
    }
  };

  return (
    <div
      className={`backdrop-blur-[12px] rounded-[14px] p-[16px] border ${getTypeClass()} flex items-center gap-[12px] ${className || ""}`}
    >
      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${getIconColor()}`} />
      <div className="text-[14px] text-white/90" style={{ fontFamily: 'var(--font-body)' }}>
        {typeof message === 'string' ? <span>{message}</span> : message}
      </div>
    </div>
  );
}
