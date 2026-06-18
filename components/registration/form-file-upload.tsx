import React from "react";
import { Upload } from "lucide-react";

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
  const truncateFileName = (fileName: string, maxLength: number = 25): string => {
    if (fileName.length <= maxLength) return fileName;
    const lastDotIndex = fileName.lastIndexOf('.');
    const hasExtension = lastDotIndex !== -1;
    const extension = hasExtension ? fileName.substring(lastDotIndex) : '';
    const nameWithoutExt = hasExtension ? fileName.substring(0, lastDotIndex) : fileName;
    const ellipsisLength = 3;
    const availableLength = maxLength - extension.length - ellipsisLength;
    if (nameWithoutExt.length <= availableLength) return fileName;
    const frontLength = Math.max(1, Math.floor(availableLength / 2));
    const backLength = Math.max(1, availableLength - frontLength);
    const frontPart = nameWithoutExt.substring(0, frontLength);
    const backPart = nameWithoutExt.substring(nameWithoutExt.length - backLength);
    return frontPart + '...' + backPart + extension;
  };

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <label className="text-[13px] text-white/70 uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{" "}
        {required && <span className="text-[#00FF88]">*</span>}
        <span className="text-[12px] text-white/40 ml-2 normal-case tracking-normal">(Max {maxSizeMB}MB)</span>
      </label>
      <div className="bg-[rgba(13,13,13,0.7)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.1)] border-solid rounded-[12px] px-[18px] py-[12px] cursor-pointer hover:border-[rgba(0,255,136,0.4)] hover:shadow-[0_0_16px_rgba(0,255,136,0.15)] transition-all duration-200 relative">
        <input
          type="file"
          accept={accept}
          required={required}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex items-center gap-[12px] text-[rgba(255,255,255,0.5)]">
          <Upload className="w-5 h-5 flex-shrink-0" />
          <span className="text-[14px] truncate" style={{ fontFamily: 'var(--font-body)' }} title={currentFile}>
            {currentFile ? truncateFileName(currentFile) : "Click to upload or drag and drop"}
          </span>
        </div>
      </div>
    </div>
  );
}
