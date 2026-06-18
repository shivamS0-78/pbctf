"use client";

import { Crown, Trash2, UserMinus } from "lucide-react";
import { FormSection } from "./form-section";
import { Button } from "./button";

interface TeamMember {
  uid: string;
  name: string;
  email?: string;
  role: string;
}

interface TeamMembersCardProps {
  members: TeamMember[];
  isLead: boolean;
  teamStatus: string;
  currentUserId: string;
  onRemoveMember: (memberId: string, memberName: string) => void;
}

export function TeamMembersCard({
  members,
  isLead,
  teamStatus,
  currentUserId,
  onRemoveMember,
  onTransferOwnership,
}: TeamMembersCardProps & { onTransferOwnership?: () => void }) {
  const isActionable =
    isLead &&
    teamStatus !== "submitted" &&
    teamStatus !== "shortlisted" &&
    teamStatus !== "confirmed";

  const getInitials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (!members || members.length === 0) return null;

  return (
    <FormSection
      title="Team Members"
      eyebrow="02 · Roster"
      status={
        isActionable && members.length > 1 && onTransferOwnership ? (
          <Button onClick={() => onTransferOwnership()} variant="secondary" size="sm">
            <Crown className="w-3.5 h-3.5" />
            Transfer Lead
          </Button>
        ) : undefined
      }
    >
      <ul className="flex flex-col gap-2">
        {members.map((member) => {
          const isMemberLead = member.role === "Team Lead";
          return (
            <li
              key={member.uid}
              className="flex items-center gap-3 p-3 sm:p-3.5 bg-surface-inset border border-[var(--border-soft)] rounded-md hover:border-brand/25 transition-colors"
            >
              <span
                className={[
                  "w-10 h-10 shrink-0 rounded-md inline-flex items-center justify-center font-mono text-[12px] font-bold",
                  isMemberLead
                    ? "bg-brand text-brand-ink"
                    : "bg-surface-2 text-ink border border-[var(--border-default)]",
                ].join(" ")}
              >
                {getInitials(member.name)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13.5px] text-ink font-medium font-body truncate">
                    {member.name}
                  </span>
                  {isMemberLead && (
                    <span className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-brand bg-brand-soft border border-brand/35 px-1.5 py-0.5 rounded">
                      <Crown className="w-2.5 h-2.5" />
                      Lead
                    </span>
                  )}
                </div>
                {member.email && (
                  <span className="block text-[11.5px] text-ink-muted font-mono truncate mt-0.5">
                    {member.email}
                  </span>
                )}
              </div>

              {isActionable && member.uid !== currentUserId && (
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.uid, member.name)}
                  className="shrink-0 inline-flex w-9 h-9 items-center justify-center rounded-md border border-[var(--border-soft)] hover:border-[var(--danger)]/55 hover:bg-[var(--danger-soft)] text-ink-muted hover:text-[var(--danger)] transition-colors"
                  aria-label={`Remove ${member.name}`}
                  title={`Remove ${member.name}`}
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </FormSection>
  );
}
