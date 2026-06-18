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
    <div className={`flex flex-col gap-[8px] w-full ${disabled ? "opacity-50" : ""}`}>
      <label className="text-[13px] text-white/70 uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{" "}
        {required && <span className="text-[#00FF88]">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        disabled={disabled}
        className={`bg-[rgba(13,13,13,0.7)] backdrop-blur-[12px] border w-full ${
          error ? "border-[rgba(0,255,136,0.6)]" : "border-[rgba(255,255,255,0.1)]"
        } border-solid rounded-[12px] px-[18px] py-[12px] text-white text-[14px] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_16px_rgba(0,255,136,0.35)] transition-all duration-200 resize-none disabled:cursor-not-allowed`}
        style={{ fontFamily: 'var(--font-body)' }}
      />
      {error && (
        <span className="text-[12px] text-[#00FF88]" style={{ fontFamily: 'var(--font-body)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
