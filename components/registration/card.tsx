"use client";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  return (
    <div
      className={`bg-[rgba(13,13,13,0.7)] backdrop-blur-[16px] rounded-[16px] p-[20px] border border-[rgba(0,255,136,0.12)] transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-[rgba(0,255,136,0.35)] hover:bg-[rgba(13,13,13,0.85)]' : ''} ${className}`}
      onClick={onClick}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </div>
  );
}
