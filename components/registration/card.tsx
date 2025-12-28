"use client";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  return (
    <div 
      className={`backdrop-blur-[2.5px] backdrop-filter bg-[rgba(138,138,138,0.1)] rounded-[15px] p-[20px] border border-[rgba(255,255,255,0.15)] ${onClick ? 'cursor-pointer hover:bg-[rgba(138,138,138,0.15)] transition-all' : ''} ${className}`}
      onClick={onClick}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </div>
  );
}

