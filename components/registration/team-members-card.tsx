"use client";

import { Trash2 } from "lucide-react";
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-[#00FF88] to-[#0ea47a]",
      "from-[#8CFF00] to-[#5caa00]",
      "from-[#00d4ff] to-[#0060ff]",
      "from-[#a855f7] to-[#6d28d9]",
      "from-[#f97316] to-[#b45309]",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <FormSection
      title="Team Members"
      status={
        isActionable && members.length > 1 && onTransferOwnership ? (
          <Button
            onClick={() => onTransferOwnership()}
            variant="secondary"
            className="h-8 px-3 text-xs"
          >
            Transfer Lead
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[10px]">
        {members.map((member) => (
          <div
            key={member.uid}
            className="flex items-center justify-between p-[14px] bg-[rgba(0,0,0,0.3)] rounded-[12px] border border-[rgba(0,255,136,0.08)] hover:border-[rgba(0,255,136,0.2)] transition-all duration-200"
          >
            <div className="flex items-center gap-[12px]">
              {/* Avatar */}
              <div
                className={`w-[40px] h-[40px] rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.2)]`}
              >
                <span className="text-[14px] text-black font-bold">
                  {getInitials(member.name)}
                </span>
              </div>

              {/* Name and Email */}
              <div className="flex flex-col gap-[2px]">
                <div className="flex items-center gap-[8px]">
                  <span
                    className="text-[14px] text-white font-medium"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {member.name}
                  </span>
                  {member.role === "Team Lead" && (
                    <span className="text-[10px] text-[#00FF88] bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] px-[8px] py-[2px] rounded-full font-semibold tracking-wide uppercase">
                      Lead
                    </span>
                  )}
                </div>
                {member.email && (
                  <span
                    className="text-[12px] text-white/40"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {member.email}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {isActionable && member.uid !== currentUserId && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onRemoveMember(member.uid, member.name)}
                  variant="danger"
                  className="h-8 px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </FormSection>
  );
}
