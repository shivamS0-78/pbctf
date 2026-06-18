"use client";

import { Search, Trash2, LogOut } from "lucide-react";
import { FormSection } from "./form-section";
import { Button } from "./button";
import { TEAM_SIZE } from "@/lib/constants";

interface QuickActionsCardProps {
  isLead: boolean;
  teamStatus: string;
  memberCount: number;
  maxMembers?: number;
  onNavigate: (path: string) => void;
  onDeleteTeam: () => void;
  onLeaveTeam: () => void;
}

export function QuickActionsCard({
  isLead,
  teamStatus,
  memberCount,
  maxMembers = TEAM_SIZE,
  onNavigate,
  onDeleteTeam,
  onLeaveTeam,
}: QuickActionsCardProps) {
  const canDiscover = isLead && memberCount < maxMembers;
  const canDelete = isLead && teamStatus !== "shortlisted" && teamStatus !== "confirmed";
  const canLeave = !isLead && teamStatus !== "shortlisted" && teamStatus !== "confirmed";

  const hasActions = canDiscover || canDelete || canLeave;
  if (!hasActions) return null;

  return (
    <FormSection title="Quick Actions" eyebrow="03 · Controls">
      <div className="flex flex-col gap-2.5">
        {canDiscover && (
          <Button onClick={() => onNavigate("/dashboard/discover")} variant="secondary" className="w-full">
            <Search className="w-4 h-4" />
            Discover Members
          </Button>
        )}

        {canDelete && (
          <Button onClick={onDeleteTeam} variant="danger" className="w-full">
            <Trash2 className="w-4 h-4" />
            Delete Team
          </Button>
        )}
        {canLeave && (
          <Button onClick={onLeaveTeam} variant="danger" className="w-full">
            <LogOut className="w-4 h-4" />
            Leave Team
          </Button>
        )}
      </div>
    </FormSection>
  );
}
