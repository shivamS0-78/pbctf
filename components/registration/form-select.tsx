import React from "react";

interface FormSelectProps {
  label: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function FormSelect({
  label,
  options,
  required = false,
  value,
  onChange,
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <label className="text-[13px] text-white/70 uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{" "}
        {required && <span className="text-[#00FF88]">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="bg-[rgba(13,13,13,0.7)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.1)] border-solid rounded-[12px] px-[18px] py-[12px] text-white text-[14px] focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_16px_rgba(0,255,136,0.35)] transition-all duration-200 appearance-none cursor-pointer"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <option value="" className="bg-[#0a0a0a]">
          Select an option
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#0a0a0a]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
