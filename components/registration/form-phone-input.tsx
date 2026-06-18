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
    <div className={`flex flex-col gap-[8px] w-full ${disabled ? "opacity-50" : ""}`}>
      <label className="text-[13px] text-white/70 uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{" "}
        {required && <span className="text-[#00FF88]">*</span>}
      </label>
      <div className={`bg-[rgba(13,13,13,0.7)] backdrop-blur-[12px] border ${
        error ? "border-[rgba(0,255,136,0.6)]" : "border-[rgba(255,255,255,0.1)]"
      } border-solid rounded-[12px] overflow-hidden focus-within:border-[#00FF88] focus-within:shadow-[0_0_16px_rgba(0,255,136,0.35)] transition-all duration-200`}>
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
        <span className="text-[12px] text-[#00FF88]" style={{ fontFamily: 'var(--font-body)' }}>
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
          color: white !important;
          font-size: 14px !important;
          padding: 12px 18px !important;
          font-family: var(--font-body) !important;
          flex: 1;
          width: 100%;
        }

        .PhoneInputInput::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }

        .PhoneInputCountry {
          padding: 0 12px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          margin-right: 0;
        }

        .PhoneInputCountryIcon {
          width: 1.5em;
          height: 1.2em;
          box-shadow: none;
          border: none;
        }

        .PhoneInputCountrySelect {
          background: transparent !important;
          color: white !important;
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
          background: rgba(0, 255, 136, 0.05) !important;
        }

        .PhoneInputCountrySelectArrow {
          opacity: 0.4;
          margin-left: 4px;
          color: white !important;
        }

        .PhoneInputCountrySelect option {
          background: #0a0a0a !important;
          color: white !important;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}

export { isValidPhoneNumber };
