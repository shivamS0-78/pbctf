"use client";

import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import {
  isValidPhoneNumber,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
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

const DEFAULT_COUNTRY: Country = "IN";

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
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);

  // `country` can transiently be undefined while the library re-resolves it;
  // fall back to the last known country to keep the chip stable.
  const dialCode = (() => {
    try {
      return getCountryCallingCode(country);
    } catch {
      return getCountryCallingCode(DEFAULT_COUNTRY);
    }
  })();

  return (
    <div className={`flex flex-col gap-2 w-full ${disabled ? "opacity-50" : ""}`}>
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-secondary flex items-center gap-1">
        <span className="text-brand opacity-50 leading-none">{">"}</span>
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      <div
        className={[
          "phone-input-shell",
          "rounded-md overflow-hidden",
          "bg-surface-inset",
          "border",
          error ? "border-[var(--danger)]/60" : "border-[var(--border-soft)]",
          "focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--brand-soft)]",
          "transition-[border-color,box-shadow] duration-150",
          "flex items-stretch",
        ].join(" ")}
      >
        <PhoneInput
          defaultCountry={DEFAULT_COUNTRY}
          value={value}
          onChange={onChange}
          onCountryChange={(next) => {
            if (next) setCountry(next);
          }}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
        />
        <span
          aria-hidden="true"
          className="phone-input-dial-chip font-mono text-[13px] text-brand bg-brand-soft px-3 flex items-center border-l border-r border-[var(--border-soft)] select-none"
        >
          +{dialCode}
        </span>
      </div>
      {error && (
        <span className="text-[12px] text-[var(--danger)] font-body flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[var(--danger)]" />
          {error}
        </span>
      )}
      <style jsx global>{`
        /* Flatten the library's wrapper into our shell so we can drop the
           dial-code chip between the country select and the input. */
        .phone-input-shell .PhoneInput {
          display: contents;
        }
        .phone-input-shell .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: var(--text-primary) !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
          font-family: var(--font-body) !important;
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
          order: 3;
        }
        .phone-input-shell .PhoneInputInput::placeholder {
          color: var(--text-disabled) !important;
        }
        .phone-input-shell .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0 12px;
          margin-right: 0;
          order: 1;
        }
        .phone-input-shell .phone-input-dial-chip {
          order: 2;
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
