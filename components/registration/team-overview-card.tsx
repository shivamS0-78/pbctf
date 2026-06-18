"use client";

import { useState } from "react";
import { Users, Copy, Check, Award } from "lucide-react";
import { FormSection } from "./form-section";
import { StatusBadge } from "./status-badge";
import { TEAM_SIZE } from "@/lib/constants";

interface TeamOverviewCardProps {
  team: {
    teamName: string;
    teamCode: string;
    memberCount: number;
    maxMembers?: number;
    problemStatement?: string;
  };
  isLead: boolean;
  status:
    | "none"
    | "active"
    | "submitted"
    | "under-review"
    | "shortlisted"
    | "confirmed"
    | "declined";
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

  const maxMembers = team.maxMembers || TEAM_SIZE;
  const pct = Math.min(100, Math.round((team.memberCount / maxMembers) * 100));

  return (
    <FormSection
      title="Team Overview"
      eyebrow="01 · Team"
      status={
        status !== "active" && status !== "none" ? (
          <StatusBadge
            status={status}
            icon={status === "shortlisted" || status === "confirmed" ? Award : Users}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {/* Team name */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-muted">
            Team Name
          </span>
          <span className="font-heading text-[24px] sm:text-[28px] font-semibold text-ink leading-tight tracking-tight">
            {team.teamName}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Team Code */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-muted">
              Team Code
            </span>
            <div className="flex items-center gap-2">
              <span className="text-mono text-[14px] font-semibold text-brand bg-brand-soft border border-brand/30 px-3 py-1.5 rounded-md tracking-[0.18em]">
                {team.teamCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="inline-flex w-9 h-9 items-center justify-center rounded-md bg-surface-inset border border-[var(--border-soft)] hover:border-brand/40 hover:text-brand text-ink-secondary transition-colors"
                aria-label={copied ? "Copied" : "Copy team code"}
                title={copied ? "Copied" : "Copy team code"}
              >
                {copied ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-muted">
              Members
            </span>
            <div className="flex items-center gap-3">
              <span className="text-mono text-[16px] text-ink">
                <span className="text-brand font-semibold">{team.memberCount}</span>
                <span className="text-ink-muted"> / {maxMembers}</span>
              </span>
              <div className="flex-1 max-w-[110px] h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-hover transition-all duration-500"
                  style={{ width: `${pct}%`, boxShadow: "0 0 8px rgba(0,255,136,0.5)" }}
                />
              </div>
            </div>
          </div>

          {team.problemStatement && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-muted">
                Problem Statement
              </span>
              <span className="text-[13.5px] text-ink-secondary font-body">
                {team.problemStatement}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-muted">
              Your Role
            </span>
            <span
              className={[
                "text-[13.5px] font-semibold font-body",
                isLead ? "text-brand" : "text-ink-secondary",
              ].join(" ")}
            >
              {isLead ? "Team Lead" : "Member"}
            </span>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
