import React from "react";
import { ChevronDown } from "lucide-react";

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
    <div className="flex flex-col gap-2 w-full">
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-secondary flex items-center gap-1">
        <span className="text-brand opacity-50 leading-none">{">"}</span>
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      <div className="relative">
        <select
          required={required}
          value={value}
          onChange={onChange}
          className={[
            "w-full px-4 pr-10 py-3 rounded-md",
            "bg-surface-inset",
            "border border-[var(--border-soft)] hover:border-[var(--border-default)]",
            "text-ink text-[14px] font-body",
            "focus:outline-none focus:border-brand focus:shadow-[0_0_0_3px_var(--brand-soft)]",
            "transition-[border-color,box-shadow] duration-150",
            "appearance-none cursor-pointer",
          ].join(" ")}
        >
          <option value="" className="bg-surface-2 text-ink-muted">
            Select an option
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-surface-2 text-ink">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
      </div>
    </div>
  );
}
