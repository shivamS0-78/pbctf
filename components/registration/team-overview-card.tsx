"use client";

import { useState } from "react";
import { Users, Copy, Check, Award } from "lucide-react";
import { FormSection } from "./form-section";
import { StatusBadge } from "./status-badge";

interface TeamOverviewCardProps {
  team: {
    teamName: string;
    teamCode: string;
    memberCount: number;
    maxMembers?: number;
    problemStatement?: string;
  };
  isLead: boolean;
  status: "none" | "active" | "submitted" | "under-review" | "shortlisted" | "confirmed" | "declined";
}

export function TeamOverviewCard({ team, isLead, status }: TeamOverviewCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(team.teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy team code:", err);
    }
  };

  const maxMembers = team.maxMembers || 2;

  return (
    <FormSection
      title="Team Overview"
      status={
        status !== "active" && status !== "none" ? (
          <StatusBadge
            status={status}
            icon={status === "shortlisted" || status === "confirmed" ? Award : Users}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[20px]">
        {/* Team Name */}
        <div className="flex flex-col gap-[4px]">
          <span
            className="text-[11px] text-white/40 uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Team Name
          </span>
          <span
            className="text-[26px] text-white font-semibold tracking-[-0.5px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {team.teamName}
          </span>
        </div>

        {/* Team Details Grid */}
        <div className="grid grid-cols-2 gap-[16px]">
          {/* Team Code with Copy */}
          <div className="flex flex-col gap-[8px]">
            <span
              className="text-[11px] text-white/40 uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Team Code
            </span>
            <div className="flex items-center gap-[8px]">
              <span
                className="text-[15px] text-[#00FF88] font-mono bg-[rgba(0,255,136,0.06)] border border-[rgba(0,255,136,0.2)] px-[12px] py-[6px] rounded-[8px] tracking-widest"
              >
                {team.teamCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-[8px] rounded-[8px] bg-[rgba(0,255,136,0.06)] hover:bg-[rgba(0,255,136,0.14)] border border-[rgba(0,255,136,0.2)] transition-all duration-200 text-[#00FF88]"
                title={copied ? "Copied!" : "Copy team code"}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="flex flex-col gap-[8px]">
            <span
              className="text-[11px] text-white/40 uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Members
            </span>
            <div className="flex items-center gap-[10px]">
              <span
                className="text-[16px] text-white"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {team.memberCount}{" "}
                <span className="text-white/30">/ {maxMembers}</span>
              </span>
              <div className="flex-1 max-w-[60px] bg-[rgba(255,255,255,0.06)] rounded-full h-[5px] overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00FF88] to-[#8CFF00] h-full transition-all duration-500 shadow-[0_0_6px_rgba(0,255,136,0.6)]"
                  style={{ width: `${(team.memberCount / maxMembers) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          {team.problemStatement && (
            <div className="flex flex-col gap-[6px] col-span-2">
              <span
                className="text-[11px] text-white/40 uppercase tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Problem Statement
              </span>
              <span
                className="text-[14px] text-white/80"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {team.problemStatement}
              </span>
            </div>
          )}

          {/* Your Role */}
          <div className="flex flex-col gap-[6px]">
            <span
              className="text-[11px] text-white/40 uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Your Role
            </span>
            <span
              className={`text-[14px] font-semibold ${isLead ? 'text-[#00FF88]' : 'text-white/70'}`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {isLead ? "Team Lead" : "Member"}
            </span>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
