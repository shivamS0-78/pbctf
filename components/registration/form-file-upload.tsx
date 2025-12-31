import React from "react";
import { Upload } from "lucide-react";

interface FormFileUploadProps {
  label: string;
  accept?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentFile?: string;
}

interface FormFileUploadProps {
  label: string;
  accept?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentFile?: string;
  maxSizeMB?: number;
}

export function FormFileUpload({
  label,
  accept,
  required = false,
  onChange,
  currentFile,
  maxSizeMB = 1,
}: FormFileUploadProps) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <label className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{" "}
        {required && <span className="text-[#ff4d00]">*</span>}
        <span className="text-[12px] text-white/60 ml-2">(Max {maxSizeMB}MB)</span>
      </label>
      <div className="backdrop-blur-[2.5px] backdrop-filter bg-[rgba(138,138,138,0.2)] border border-[rgba(255,255,255,0.38)] border-solid rounded-[15px] px-[18px] py-[12px] cursor-pointer hover:border-[#ff4d00] transition-all relative">
        <input
          type="file"
          accept={accept}
          required={required}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex items-center gap-[12px] text-[rgba(255,255,255,0.7)]">
          <Upload className="w-5 h-5" />
          <span className="text-[14px]" style={{ fontFamily: 'var(--font-body)' }}>
            {currentFile
              ? currentFile
              : "Click to upload or drag and drop"}
          </span>
        </div>
      </div>
    </div>
  );
}

