import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export function Button({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const getVariantClass = () => {
    if (disabled)
      return "bg-[rgba(13,13,13,0.5)] text-[rgba(255,255,255,0.2)] cursor-not-allowed border border-[rgba(255,255,255,0.05)]";

    switch (variant) {
      case "primary":
        return "bg-[#00FF88] hover:bg-[#00CC70] text-black font-semibold hover:shadow-[0_0_24px_rgba(0,255,136,0.55)] transition-all duration-200";
      case "secondary":
        return "bg-[rgba(13,13,13,0.8)] hover:bg-[rgba(13,13,13,0.95)] text-white border border-[rgba(0,255,136,0.25)] hover:border-[rgba(0,255,136,0.55)] backdrop-blur-[12px] transition-all duration-200";
      case "danger":
        return "bg-[rgba(0,0,0,0.5)] hover:bg-[rgba(0,0,0,0.7)] text-white border border-[rgba(0,255,136,0.3)] hover:border-[rgba(0,255,136,0.65)] hover:shadow-[0_0_16px_rgba(0,255,136,0.2)] transition-all duration-200";
      default:
        return "";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-[8px] px-[24px] py-[12px] rounded-[10px] text-[14px] ${getVariantClass()} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </button>
  );
}
