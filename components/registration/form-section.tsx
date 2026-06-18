import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  status?: React.ReactNode;
}

export function FormSection({
  title,
  children,
  status,
  className,
}: FormSectionProps & { className?: string }) {
  return (
    <div className={`relative w-full rounded-[20px] ${className || ''}`}>

      {/* Background + grid clipped to rounded shape */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(13,13,13,0.85)] backdrop-blur-[24px]" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />
      </div>

      {/* Uniform 1px border — single CSS rule, same weight on every side */}
      <div className="absolute inset-0 rounded-[20px] border border-[rgba(0,255,136,0.35)] pointer-events-none z-20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-[16px] sm:gap-[20px] p-[20px] sm:p-[24px] md:p-[32px] h-full">
        <div className="flex items-center justify-between shrink-0">
          <h2
            className="text-[22px] sm:text-[26px] text-white font-semibold tracking-[-0.3px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h2>
          {status}
        </div>
        {children}
      </div>
    </div>
  );
}
