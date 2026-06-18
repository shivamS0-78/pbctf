"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./button";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Crown, AlertTriangle, Users, ArrowRight } from "lucide-react";

interface TeamMember {
    uid: string;
    name: string;
    role: string;
}

interface TransferOwnershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newLeadId: string) => Promise<void>;
    members: TeamMember[];
    currentUserId: string;
}

export function TransferOwnershipModal({
    isOpen,
    onClose,
    onConfirm,
    members,
    currentUserId,
}: TransferOwnershipModalProps) {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const eligibleMembers = members.filter(
        (member) => member.uid !== currentUserId,
    );

    const handleConfirm = async () => {
        if (!selectedMemberId) return;
        setIsSubmitting(true);
        try {
            await onConfirm(selectedMemberId);
        } finally {
            setIsSubmitting(false);
            setSelectedMemberId(null);
        }
    };

    const handleClose = () => {
        setSelectedMemberId(null);
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleClose}>
            <AlertDialogContent className="bg-surface-1 border border-[var(--border-default)] max-h-[80vh] overflow-y-auto shadow-modal">
                <AlertDialogHeader>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-1.5">
                        // TRANSFER_OWNERSHIP
                    </div>
                    <AlertDialogTitle className="text-ink flex items-center gap-2 font-heading">
                        <Crown className="w-4 h-4 text-brand" />
                        Hand off team lead
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-ink-secondary text-[13px]">
                        Pick the operator who takes over as lead.
                    </AlertDialogDescription>
                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-md bg-[var(--warning-soft)] border border-[var(--warning)]/35">
                        <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)] mt-0.5 shrink-0" />
                        <p className="font-mono text-[11px] text-[var(--warning)] leading-relaxed">
                            &gt; you become a regular member after confirm. lead-only controls go away.
                        </p>
                    </div>
                </AlertDialogHeader>

                <div className="py-3 flex flex-col gap-2">
                    {eligibleMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                            <Users className="w-6 h-6 text-ink-muted" />
                            <p className="text-[13px] text-ink-secondary">No eligible operators</p>
                            <p className="font-mono text-[10.5px] text-ink-muted">
                                &gt; recruit a member before transferring
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-muted mb-1">
                                &gt; select_new_lead
                            </p>
                            {eligibleMembers.map((member) => {
                                const selected = selectedMemberId === member.uid;
                                return (
                                    <button
                                        key={member.uid}
                                        type="button"
                                        onClick={() => setSelectedMemberId(member.uid)}
                                        aria-pressed={selected}
                                        className={[
                                            "p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between gap-3 text-left",
                                            selected
                                                ? "bg-brand-soft border-brand/55 shadow-glow-sm"
                                                : "bg-surface-2 border-[var(--border-soft)] hover:border-[var(--border-default)]",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={[
                                                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                                                    selected
                                                        ? "border-brand bg-brand-soft"
                                                        : "border-[var(--border-default)]",
                                                ].join(" ")}
                                            >
                                                {selected && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-glow-sm" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-ink text-[14px] font-medium truncate">
                                                    {member.name}
                                                </span>
                                                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted flex items-center gap-1">
                                                    <span>member</span>
                                                    <ArrowRight className="w-2.5 h-2.5" />
                                                    <span className={selected ? "text-brand" : "text-ink-secondary"}>lead</span>
                                                </span>
                                            </div>
                                        </div>
                                        {selected && <Crown className="w-3.5 h-3.5 text-brand shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <AlertDialogFooter className="sm:justify-between gap-3">
                    <AlertDialogCancel
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="m-0 bg-transparent border border-[var(--border-soft)] text-ink hover:bg-surface-2 hover:text-ink"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedMemberId || isSubmitting}
                        variant="primary"
                        className="m-0 w-full sm:w-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" className="mr-2" />
                                Transferring...
                            </>
                        ) : (
                            <>
                                <Crown className="w-3.5 h-3.5" />
                                Confirm transfer
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
