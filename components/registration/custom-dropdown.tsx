"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}

export function CustomDropdown({ label, value, options, onChange, required }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-secondary flex items-center gap-1">
        <span className="text-brand opacity-50 leading-none">{">"}</span>
        {label}
        {required && <span className="text-brand">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-md text-left",
            "bg-surface-inset",
            "border border-[var(--border-soft)] hover:border-[var(--border-default)]",
            "transition-[border-color,box-shadow] duration-150",
            isOpen && "border-brand shadow-[0_0_0_3px_var(--brand-soft)]"
          )}
        >
          <span
            className={cn(
              "text-[14px] font-body",
              value ? "text-ink" : "text-ink-disabled"
            )}
          >
            {value || "Select score..."}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-ink-muted transition-transform duration-150",
              isOpen && "rotate-180 text-brand"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-surface-2 border border-[var(--border-default)] rounded-md shadow-modal max-h-[220px] overflow-y-auto thin-scrollbar anim-fade-up">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-body text-ink-secondary",
                  "hover:bg-brand-soft hover:text-ink transition-colors",
                  value === option && "bg-brand-soft text-brand"
                )}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
                {value === option && <Check className="w-4 h-4 text-brand" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
