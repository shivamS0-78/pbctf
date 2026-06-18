"use client";

import { User, Users, Crown, X, ArrowRight, Send, Check } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./button";
import { Spinner } from "@/components/ui/spinner";
import { TEAM_SIZE } from "@/lib/constants";

export interface TeamDetails {
  teamCode: string;
  teamName: string;
  teamLead: {
    id?: string;
    uid?: string;
    name: string;
    email?: string;
    discord_username?: string;
    organisation?: string;
  };
  teamMembers: Array<{
    uid: string;
    name: string;
    email?: string;
    role: string;
  }>;
  appliedFor?: { id: string; title: string };
  memberCount: number;
  maxMembers: number;
  teamStatus: string;
}

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamDetails: TeamDetails | null;
  isLoading: boolean;
  error: string | null;
  onMemberClick: (userId: string) => void;
  requestStatus?: string;
  onSendRequest?: () => void;
  isSendingRequest?: boolean;
}

function initialsOf(name: string) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

function MemberRow({
  name,
  email,
  isLead,
  onClick,
}: {
  name: string;
  email?: string;
  isLead?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md bg-surface-inset border border-[var(--border-soft)] hover:border-brand/35 hover:bg-surface-2 transition-[background,border-color]"
    >
      <span
        className={[
          "w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-sm font-mono text-[11px] font-bold",
          isLead
            ? "bg-brand text-brand-ink"
            : "bg-surface-2 text-ink border border-[var(--border-default)]",
        ].join(" ")}
      >
        {initialsOf(name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] text-ink font-medium font-body truncate">{name}</span>
          {isLead && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-brand bg-brand-soft border border-brand/35 px-1.5 py-0.5 rounded">
              <Crown className="w-2.5 h-2.5" />
              Lead
            </span>
          )}
        </div>
        {email && (
          <span className="block text-[11.5px] text-ink-muted font-mono truncate mt-0.5">
            {email}
          </span>
        )}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand transition-colors" />
    </button>
  );
}

export function TeamDetailsModal({
  isOpen,
  onClose,
  teamDetails,
  isLoading,
  error,
  onMemberClick,
  requestStatus,
  onSendRequest,
  isSendingRequest = false,
}: TeamDetailsModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = teamDetails?.memberCount || teamDetails?.teamMembers?.length || 0;
  const max = teamDetails?.maxMembers || TEAM_SIZE;
  const leadId = teamDetails?.teamLead.uid || teamDetails?.teamLead.id;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Team Details"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[6px] pointer-events-auto"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-[101] pointer-events-auto w-full max-w-xl max-h-[92vh] overflow-y-auto thin-scrollbar bg-surface-2 border border-[var(--border-default)] rounded-t-xl sm:rounded-lg shadow-modal anim-fade-up">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 md:px-6 py-4 bg-surface-2/95 backdrop-blur-md">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="text-mono text-brand text-[12px] leading-none">{">"}</span>
            <h2 className="font-heading text-[16px] md:text-[18px] font-semibold text-ink truncate tracking-tight">
              Team Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex w-8 h-8 items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 md:px-6 py-5 md:py-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-[var(--danger)] mb-1 font-medium">Failed to load team</p>
              <p className="text-[13.5px] text-ink-secondary font-body">{error}</p>
            </div>
          ) : teamDetails && teamDetails.teamName ? (
            <div className="flex flex-col gap-5">
              {/* Header card */}
              <div className="rounded-md bg-surface-inset border border-[var(--border-soft)] p-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 shrink-0 inline-flex items-center justify-center rounded-md bg-brand-soft border border-brand/35 font-mono text-[14px] font-bold text-brand">
                    {initialsOf(teamDetails.teamName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-[18px] font-semibold text-ink leading-tight tracking-tight truncate">
                      {teamDetails.teamName}
                    </h3>
                    <p className="font-mono text-[11.5px] text-ink-muted mt-0.5">
                      <span className="text-brand">{teamDetails.teamCode}</span>
                      <span className="text-ink-subtle"> · </span>
                      {total}/{max} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Lead */}
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-muted">
                  Team Lead
                </div>
                <MemberRow
                  name={teamDetails.teamLead.name}
                  email={teamDetails.teamLead.email}
                  isLead
                  onClick={() => {
                    if (leadId) onMemberClick(leadId);
                  }}
                />
              </div>

              {/* Other Members */}
              {teamDetails.teamMembers && teamDetails.teamMembers.length > 1 && (
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-muted">
                    Members
                  </div>
                  <ul className="flex flex-col gap-2">
                    {teamDetails.teamMembers
                      .filter((m) => m.uid !== leadId)
                      .map((member) => (
                        <li key={member.uid}>
                          <MemberRow
                            name={member.name}
                            email={member.email}
                            onClick={() => onMemberClick(member.uid)}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Action */}
              {onSendRequest && (
                <div className="pt-4 flex justify-end">
                  {requestStatus === "pending" ? (
                    <Button variant="secondary" disabled onClick={() => {}}>
                      <Send className="w-4 h-4" />
                      Request Sent
                    </Button>
                  ) : requestStatus === "accepted" ? (
                    <Button variant="secondary" disabled onClick={() => {}}>
                      <Check className="w-4 h-4" />
                      Accepted
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => onSendRequest()}
                      disabled={isSendingRequest}
                    >
                      {isSendingRequest ? (
                        <>
                          <Spinner size="sm" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Request
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-ink-secondary text-center py-10 font-body text-[13.5px]">
              Failed to load team details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
