"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Override max-width. defaults to 2xl */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  "2xl": "max-w-3xl",
};

export function Modal({ isOpen, onClose, title, children, size = "xl" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 anim-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[6px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div
        className={[
          "relative z-[101] w-full",
          sizeMap[size],
          "max-h-[92vh] overflow-y-auto thin-scrollbar",
          "bg-surface-2 border border-[var(--border-default)]",
          "rounded-t-xl sm:rounded-lg",
          "shadow-modal",
          "anim-fade-up",
        ].join(" ")}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 md:px-6 py-4 bg-surface-2/95 backdrop-blur-md">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="text-mono text-brand text-[12px] leading-none">{">"}</span>
            <h2 className="font-heading text-[16px] md:text-[18px] font-semibold text-ink truncate tracking-tight">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 md:px-6 py-5 md:py-6">{children}</div>
      </div>
    </div>
  );
}
