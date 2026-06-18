import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export function FormInput({
  label,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className={`flex flex-col gap-[8px] w-full ${disabled ? "opacity-50" : ""}`}>
      <label className="text-[13px] text-white/70 uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{" "}
        {required && <span className="text-[#00FF88]">*</span>}
      </label>
      
      <div className="relative w-full flex items-center">
        <input
          type={inputType}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`bg-[rgba(13,13,13,0.7)] backdrop-blur-[12px] border w-full ${
            error ? "border-[rgba(0,255,136,0.6)]" : "border-[rgba(255,255,255,0.1)]"
          } border-solid rounded-[12px] pl-[18px] pr-[48px] py-[12px] text-white text-[14px] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_16px_rgba(0,255,136,0.35)] transition-all duration-200 disabled:cursor-not-allowed`}
          style={{ fontFamily: 'var(--font-body)' }}
        />

        {isPasswordType && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[16px] flex items-center justify-center text-[rgba(255,255,255,0.6)] hover:text-white select-none cursor-pointer focus:outline-none hover:scale-110 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-[18px] h-[18px]" />
            ) : (
              <Eye className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[12px] text-[#00FF88]" style={{ fontFamily: 'var(--font-body)' }}>
          {error}
        </span>
      )}
    </div>
  );
}