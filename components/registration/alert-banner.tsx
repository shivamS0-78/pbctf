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
        return "bg-[rgba(255,77,0,0.2)] border-[#ff4d00]";
      case "error":
        return "bg-black/50 border-[#ff4d00]";
      case "warning":
        return "bg-[rgba(255,77,0,0.15)] border-[#ff8800]";
      case "yellow":
        return "bg-[rgba(255,77,0,0.15)] border-[#ff8800]";
      case "info":
        return "bg-white/5 border-white/38";
      default:
        return "bg-white/5 border-white/38";
    }
  };

  return (
    <div
      className={`backdrop-blur-[2.5px] backdrop-filter rounded-[15px] p-[16px] border ${getTypeClass()} flex items-center gap-[12px] ${className || ""}`}
    >
      <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
      <div className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
        {typeof message === 'string' ? <span>{message}</span> : message}
      </div>
    </div>
  );
}

