import React from "react";

interface FormTextareaProps {
  label: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  error?: string;
}

export function FormTextarea({
  label,
  placeholder,
  required = false,
  value,
  onChange,
  onBlur,
  rows = 4,
  disabled = false,
  error,
}: FormTextareaProps) {
  return (
    <div className={`flex flex-col gap-2 w-full ${disabled ? "opacity-50" : ""}`}>
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-secondary flex items-center gap-1">
        <span className="text-brand opacity-50 leading-none">{">"}</span>
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        disabled={disabled}
        className={[
          "w-full px-4 py-3 rounded-md",
          "bg-surface-inset",
          "border",
          error
            ? "border-[var(--danger)]/60"
            : "border-[var(--border-soft)] hover:border-[var(--border-default)]",
          "text-ink text-[14px] font-body leading-relaxed",
          "placeholder:text-ink-disabled placeholder:font-light",
          "focus:outline-none focus:border-brand focus:shadow-[0_0_0_3px_var(--brand-soft)]",
          "transition-[border-color,box-shadow] duration-150",
          "resize-none disabled:cursor-not-allowed",
        ].join(" ")}
      />
      {error && (
        <span className="text-[12px] text-[var(--danger)] font-body flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[var(--danger)]" />
          {error}
        </span>
      )}
    </div>
  );
}
