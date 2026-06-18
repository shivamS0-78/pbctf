import React, { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Search, UserPlus, Check, ShieldCheck } from "lucide-react";
import { StickyAlert } from "./sticky-alert";
import { ConfirmationDialog } from "./confirmation-dialog";

interface AddEvaluatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface UserResult {
    uid: string;
    name: string;
    email: string;
    role: string;
    isEvaluator: boolean;
}

export function AddEvaluatorModal({
    isOpen,
    onClose,
    onSuccess
}: AddEvaluatorModalProps) {
    const { getToken } = useAuth();
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<UserResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [promotingId, setPromotingId] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        userId: "",
    });

    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setUsers([]);
            setAlert(null);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim().length >= 2) {
                searchUsers(search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const searchUsers = async (query: string) => {
        setIsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_ENDPOINTS.adminParticipants}?search=${query}&limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.participants) {
                    const mappedUsers = data.data.participants.map((u: any) => ({
                        uid: u.uid,
                        name: u.name,
                        email: u.email,
                        role: u.role || 'user',
                        isEvaluator: u.role === 'evaluator'
                    }));
                    setUsers(mappedUsers);
                }
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromote = async (userId: string) => {
        setPromotingId(userId);
        setAlert(null);

        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(API_ENDPOINTS.adminPromoteUser, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({ type: "success", message: "User promoted to evaluator!" });
                // Update local state to reflect change immediately
                setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isEvaluator: true, role: 'evaluator' } : u));

                // Notify parent after short delay
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            } else {
                setAlert({ type: "error", message: data.message || "Failed to promote user." });
            }
        } catch (error) {
            setAlert({ type: "error", message: "An error occurred." });
        } finally {
            setPromotingId(null);
        }
    };

    const queryReady = search.trim().length >= 2;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Recruit judge"
            size="md"
        >
            <div className="flex flex-col gap-4 min-h-[320px]">
                {alert && (
                    <StickyAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Eyebrow context */}
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                    <span>
                        <span className="text-ink-subtle">role:</span>{" "}
                        <span className="text-brand">evaluator</span>
                    </span>
                    <span className="text-ink-subtle">·</span>
                    <span>grants access to the evaluator console</span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
                    <input
                        type="text"
                        placeholder="grep operators / min 2 chars…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                        className="w-full bg-surface-inset border border-[var(--border-soft)] rounded-md pl-9 pr-9 py-2.5 text-ink text-[13px] font-mono placeholder:text-ink-subtle focus:outline-none focus:border-brand focus:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all duration-200"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Spinner size="sm" />
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 flex flex-col gap-2">
                    {!queryReady && (
                        <div className="flex flex-col items-center justify-center text-center py-8 px-6 rounded-md border border-dashed border-[var(--border-soft)] bg-surface-inset/50">
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-1">
                                awaiting_query
                            </div>
                            <p className="text-[12.5px] text-ink-muted max-w-xs">
                                Type a name or email to search the operator directory.
                            </p>
                        </div>
                    )}

                    {queryReady && users.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center py-8 px-6 rounded-md border border-dashed border-[var(--border-soft)] bg-surface-inset/50">
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-1">
                                no_match
                            </div>
                            <p className="text-[12.5px] text-ink-muted max-w-xs">
                                Nothing matches “{search}”. Try a different query.
                            </p>
                        </div>
                    )}

                    {users.map((user) => (
                        <div
                            key={user.uid}
                            className="flex items-center justify-between gap-3 p-3 rounded-md bg-surface-inset border border-[var(--border-soft)] hover:border-brand/25 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-md bg-brand-soft border border-brand/20 flex items-center justify-center shrink-0 font-mono text-[12px] text-brand uppercase">
                                    {user.name?.[0] ?? "?"}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-ink text-[13.5px] font-medium truncate">{user.name}</div>
                                    <div className="font-mono text-[11.5px] text-ink-muted truncate">{user.email}</div>
                                </div>
                            </div>

                            {user.isEvaluator ? (
                                <span className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand px-2 py-1 bg-brand-soft rounded-md border border-brand/40 shrink-0">
                                    <Check className="w-3 h-3" />
                                    Judge
                                </span>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setConfirmation({ isOpen: true, userId: user.uid })}
                                    disabled={!!promotingId}
                                >
                                    {promotingId === user.uid ? (
                                        <Spinner size="sm" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Promote
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={() => {
                    handlePromote(confirmation.userId);
                    setConfirmation({ ...confirmation, isOpen: false });
                }}
                title="Promote to judge"
                message="Promote this operator to evaluator? They will gain access to the evaluator console."
            />
        </Modal>
    );
}
