import React from "react";
import { Upload, FileCheck } from "lucide-react";

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
  const truncateFileName = (fileName: string, maxLength = 28): string => {
    if (fileName.length <= maxLength) return fileName;
    const lastDotIndex = fileName.lastIndexOf(".");
    const hasExtension = lastDotIndex !== -1;
    const extension = hasExtension ? fileName.substring(lastDotIndex) : "";
    const nameWithoutExt = hasExtension ? fileName.substring(0, lastDotIndex) : fileName;
    const ellipsisLength = 3;
    const availableLength = maxLength - extension.length - ellipsisLength;
    if (nameWithoutExt.length <= availableLength) return fileName;
    const frontLength = Math.max(1, Math.floor(availableLength / 2));
    const backLength = Math.max(1, availableLength - frontLength);
    const front = nameWithoutExt.substring(0, frontLength);
    const back = nameWithoutExt.substring(nameWithoutExt.length - backLength);
    return front + "..." + back + extension;
  };

  const hasFile = Boolean(currentFile);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-secondary flex items-center gap-1">
        <span className="text-brand opacity-50 leading-none">{">"}</span>
        {label}
        {required && <span className="text-brand">*</span>}
        <span className="text-[10px] text-ink-subtle ml-1 normal-case tracking-normal font-body">
          (max {maxSizeMB}MB)
        </span>
      </label>
      <div
        className={[
          "relative rounded-md px-4 py-3 cursor-pointer",
          "bg-surface-inset",
          "border border-dashed",
          hasFile
            ? "border-brand/40 hover:border-brand/70"
            : "border-[var(--border-soft)] hover:border-[var(--border-brand)]",
          "transition-[border-color,box-shadow,background] duration-150",
          "hover:shadow-[0_0_0_3px_var(--brand-soft)]",
        ].join(" ")}
      >
        <input
          type="file"
          accept={accept}
          required={required}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={label}
        />
        <div className="flex items-center gap-3 text-ink-muted">
          {hasFile ? (
            <FileCheck className="w-4 h-4 flex-shrink-0 text-brand" />
          ) : (
            <Upload className="w-4 h-4 flex-shrink-0" />
          )}
          <span
            className={[
              "text-[13px] truncate font-body",
              hasFile ? "text-ink" : "text-ink-muted",
            ].join(" ")}
            title={currentFile}
          >
            {currentFile ? truncateFileName(currentFile) : "Click to upload or drag a file here"}
          </span>
        </div>
      </div>
    </div>
  );
}
