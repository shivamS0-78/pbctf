import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const danger = variant === "danger";
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="flex flex-col items-center text-center gap-4 pt-1 pb-2">
        <div
          className={[
            "w-12 h-12 rounded-full flex items-center justify-center border",
            danger
              ? "bg-[var(--danger-soft)] border-[var(--danger)]/40"
              : "bg-brand-soft border-brand/35",
          ].join(" ")}
        >
          <AlertTriangle
            className={`w-5 h-5 ${danger ? "text-[var(--danger)]" : "text-brand"}`}
          />
        </div>

        <h3 className="text-[18px] md:text-[20px] font-semibold text-ink tracking-tight font-heading">
          {title}
        </h3>

        <p className="text-ink-secondary text-[13.5px] max-w-[90%] font-body leading-relaxed">
          {message}
        </p>

        <div className="flex gap-2.5 mt-3 w-full justify-center">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
