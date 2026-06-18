"use client";

import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface FormPhoneInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export function FormPhoneInput({
  label,
  placeholder = "Enter phone number",
  required = false,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: FormPhoneInputProps) {
  return (
    <div className={`flex flex-col gap-2 w-full ${disabled ? "opacity-50" : ""}`}>
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-secondary flex items-center gap-1">
        <span className="text-brand opacity-50 leading-none">{">"}</span>
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      <div
        className={[
          "rounded-md overflow-hidden",
          "bg-surface-inset",
          "border",
          error ? "border-[var(--danger)]/60" : "border-[var(--border-soft)]",
          "focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--brand-soft)]",
          "transition-[border-color,box-shadow] duration-150",
        ].join(" ")}
      >
        <PhoneInput
          international
          defaultCountry="IN"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <span className="text-[12px] text-[var(--danger)] font-body flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[var(--danger)]" />
          {error}
        </span>
      )}
      <style jsx global>{`
        .PhoneInput {
          display: flex;
          align-items: center;
        }
        .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: var(--text-primary) !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
          font-family: var(--font-body) !important;
          flex: 1;
          width: 100%;
        }
        .PhoneInputInput::placeholder {
          color: var(--text-disabled) !important;
        }
        .PhoneInputCountry {
          padding: 0 12px;
          border-right: 1px solid var(--border-soft);
          margin-right: 0;
        }
        .PhoneInputCountryIcon {
          width: 1.4em;
          height: 1em;
          box-shadow: none;
          border: none;
        }
        .PhoneInputCountrySelect {
          background: transparent !important;
          color: var(--text-primary) !important;
          border: none !important;
          outline: none !important;
          padding: 12px 8px !important;
          font-size: 14px !important;
          font-family: var(--font-body) !important;
          cursor: pointer !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
        }
        .PhoneInputCountrySelect:hover {
          background: var(--brand-soft) !important;
        }
        .PhoneInputCountrySelectArrow {
          opacity: 0.5;
          margin-left: 4px;
          color: var(--text-secondary) !important;
        }
        .PhoneInputCountrySelect option {
          background: var(--surface-2) !important;
          color: var(--text-primary) !important;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}

export { isValidPhoneNumber };
