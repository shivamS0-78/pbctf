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
import { Crown, AlertTriangle } from "lucide-react";

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
        (member) => member.uid !== currentUserId
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
            <AlertDialogContent className="bg-[rgba(13,13,13,0.97)] border border-[rgba(0,255,136,0.2)] backdrop-blur-[24px] max-h-[80vh] overflow-y-auto shadow-[0_0_60px_rgba(0,255,136,0.08)]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        <Crown className="w-5 h-5 text-[#00FF88]" />
                        Transfer Team Ownership
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/50" style={{ fontFamily: 'var(--font-body)' }}>
                        Select a member to transfer ownership to.{" "}
                        <span className="text-[#8CFF00] flex items-center gap-1 mt-1 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            You will become a regular member after this action.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 flex flex-col gap-2">
                    {eligibleMembers.length === 0 ? (
                        <p className="text-sm text-white/30 text-center py-4" style={{ fontFamily: 'var(--font-body)' }}>
                            No other members to transfer ownership to.
                        </p>
                    ) : (
                        eligibleMembers.map((member) => (
                            <div
                                key={member.uid}
                                onClick={() => setSelectedMemberId(member.uid)}
                                className={`
                  p-3 rounded-[12px] border cursor-pointer transition-all flex items-center justify-between
                  ${selectedMemberId === member.uid
                                        ? "bg-[rgba(0,255,136,0.06)] border-[#00FF88] shadow-[0_0_16px_rgba(0,255,136,0.15)]"
                                        : "bg-[rgba(0,0,0,0.4)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,255,136,0.25)]"
                                    }
                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                    w-4 h-4 rounded-full border flex items-center justify-center transition-all
                    ${selectedMemberId === member.uid ? "border-[#00FF88] bg-[rgba(0,255,136,0.15)]" : "border-white/20"}
                  `}>
                                        {selectedMemberId === member.uid && (
                                            <div className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
                                        )}
                                    </div>
                                    <span className="text-white text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>{member.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: 'var(--font-body)' }}>
                                    <span>Member</span>
                                    <span>→</span>
                                    <span className={selectedMemberId === member.uid ? "text-[#00FF88]" : ""}>Lead</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <AlertDialogFooter className="sm:justify-between gap-4">
                    <AlertDialogCancel
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="m-0 bg-transparent border-[rgba(0,255,136,0.2)] text-white hover:bg-[rgba(0,255,136,0.05)] hover:text-white"
                        style={{ fontFamily: 'var(--font-body)' }}
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
                            "Confirm Transfer"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
