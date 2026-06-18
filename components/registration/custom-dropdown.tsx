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
        <div className="flex flex-col gap-[8px]" ref={dropdownRef}>
            <label className="text-[13px] text-white/70 uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
                {label}
                {required && <span className="text-[#00FF88] ml-1">*</span>}
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between px-[16px] py-[12px] bg-[rgba(13,13,13,0.7)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.1)] rounded-[12px] text-left transition-all duration-200",
                        "hover:border-[rgba(0,255,136,0.35)]",
                        isOpen && "border-[#00FF88] shadow-[0_0_16px_rgba(0,255,136,0.35)]"
                    )}
                >
                    <span className={cn("text-[14px]", value ? "text-white" : "text-[rgba(255,255,255,0.3)]")} style={{ fontFamily: 'var(--font-body)' }}>
                        {value || "Select score..."}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[rgba(13,13,13,0.97)] border border-[rgba(0,255,136,0.2)] rounded-[12px] shadow-xl max-h-[200px] overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={cn(
                                    "w-full flex items-center justify-between px-[16px] py-[10px] text-[14px] text-white/70 hover:bg-[rgba(0,255,136,0.05)] hover:text-white transition-colors",
                                    value === option && "bg-[rgba(0,255,136,0.08)] text-[#00FF88]"
                                )}
                                style={{ fontFamily: 'var(--font-body)' }}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option}
                                {value === option && <Check className="w-4 h-4 text-[#00FF88]" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
