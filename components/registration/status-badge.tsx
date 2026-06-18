import React from "react";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: string | undefined | null;
  icon: LucideIcon;
}

export function StatusBadge({
  status,
  icon: Icon,
}: StatusBadgeProps) {
  const getStatusStyle = () => {
    if (!status || typeof status !== 'string') {
      return "bg-white/5 border-white/10 text-white/60";
    }
    switch (status.toLowerCase()) {
      case "rsvped":
      case "confirmed":
      case "shortlisted":
      case "accepted":
        return "bg-[rgba(0,255,136,0.12)] border-[rgba(0,255,136,0.5)] text-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.15)]";
      case "pending":
      case "active":
      case "under-review":
        return "bg-[rgba(0,255,136,0.07)] border-[rgba(140,255,0,0.4)] text-[#8CFF00]";
      case "submitted":
        return "bg-white/5 border-white/10 text-white/70";
      case "declined":
      case "rejected":
      case "rsvp_declined":
        return "bg-[rgba(0,0,0,0.5)] border-[rgba(0,255,136,0.3)] text-white/60";
      case "withdrawn":
        return "bg-white/5 border-white/10 text-white/40";
      default:
        return "bg-white/5 border-white/10 text-white/60";
    }
  };

  return (
    <div
      className={`flex items-center gap-[8px] px-[12px] py-[6px] rounded-[10px] border ${getStatusStyle()}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[12px] capitalize font-medium" style={{ fontFamily: 'var(--font-body)' }}>
        {status || 'Unknown'}
      </span>
    </div>
  );
}
