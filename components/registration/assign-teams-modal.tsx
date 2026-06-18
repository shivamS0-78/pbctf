import React, { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Search, CheckSquare, Square, Users, AlertTriangle, Target, X } from "lucide-react";
import { StickyAlert } from "./sticky-alert";
import { ConfirmationDialog } from "./confirmation-dialog";

interface AssignTeamsModalProps {
    isOpen: boolean;
    onClose: () => void;
    evaluatorId: string;
    evaluatorName: string;
    onSuccess: () => void;
}

interface TeamSelect {
    teamCode: string;
    teamName: string;
    isAssigned: boolean;
    assignedToName?: string;
    problemStatement?: string;
}

export function AssignTeamsModal({
    isOpen,
    onClose,
    evaluatorId,
    evaluatorName,
    onSuccess
}: AssignTeamsModalProps) {
    const { getToken } = useAuth();
    const [teams, setTeams] = useState<TeamSelect[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        teamCode: "",
    });

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            setTeams([]);
            setHasMore(true);
            setSelectedTeams(new Set());
            setSearch("");
            setAlert(null);
            fetchTeams(1, "");
        }
    }, [isOpen]);

    // Debounce search
    useEffect(() => {
        if (!isOpen) return;
        const timeoutId = setTimeout(() => {
            if (search) {
                setPage(1);
                setTeams([]);
                fetchTeams(1, search);
            } else if (page === 1 && teams.length === 0) {
                fetchTeams(1, "");
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchTeams = async (pageNum: number, searchQuery: string) => {
        setIsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const queryParams = new URLSearchParams({
                limit: '50', // Chunk size
                page: pageNum.toString(),
                search: searchQuery,
                excludeAssigned: 'true'
            });

            const response = await fetch(`${API_ENDPOINTS.adminTeams}?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.teams) {
                    const mappedTeams = data.data.teams.map((t: any) => ({
                        teamCode: t.teamCode,
                        teamName: t.teamName,
                        isAssigned: !!t.evaluator,
                        assignedToName: t.evaluator?.name,
                        problemStatement: t.appliedFor?.title || "No Problem Statement"
                    }));

                    if (pageNum === 1) {
                        setTeams(mappedTeams);
                    } else {
                        setTeams(prev => [...prev, ...mappedTeams]);
                    }

                    setHasMore(data.data.pagination.currentPage < data.data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error);
            setAlert({ type: "error", message: "Failed to load teams." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTeams(nextPage, search);
    };

    const handleToggleTeam = (teamCode: string) => {
        const newSelected = new Set(selectedTeams);
        if (newSelected.has(teamCode)) {
            newSelected.delete(teamCode);
        } else {
            newSelected.add(teamCode);
        }
        setSelectedTeams(newSelected);
    };

    const handleAssign = async () => {
        if (selectedTeams.size === 0) return;

        setIsSubmitting(true);
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(API_ENDPOINTS.adminAssignEvaluators, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    evaluatorUid: evaluatorId,
                    teamCodes: Array.from(selectedTeams),
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await response.json();
                setAlert({
                    type: "error",
                    message: data.message || "Failed to assign teams."
                });
            }
        } catch (error) {
            console.error("Assign error:", error);
            setAlert({ type: "error", message: "An error occurred while assigning teams." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter teams based on search
    const filteredTeams = teams;
    const reassignCount = filteredTeams.filter(
        (t) => selectedTeams.has(t.teamCode) && t.isAssigned
    ).length;

    // Pull selected team names for the deliberate preview strip
    const selectedTeamObjects = filteredTeams.filter((t) => selectedTeams.has(t.teamCode));
    const previewNames = selectedTeamObjects.slice(0, 6).map((t) => t.teamName);
    const previewExtra = Math.max(selectedTeamObjects.length - previewNames.length, 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign crews · ${evaluatorName}`}
            size="2xl"
        >
            <div className="flex flex-col gap-4 max-h-[70vh]">
                {alert && (
                    <StickyAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Context strip. who, how many, what */}
                <div className="rounded-md border border-brand/20 bg-brand-soft/40 p-3 flex items-center gap-3">
                    <Target className="w-4 h-4 text-brand shrink-0" />
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary flex-1 min-w-0">
                        <span className="text-ink-muted">target:</span>{" "}
                        <span className="text-brand">{evaluatorName}</span>{" "}
                        <span className="text-ink-muted">·</span>{" "}
                        <span className="text-ink">{selectedTeams.size}</span>{" "}
                        <span className="text-ink-muted">crew{selectedTeams.size !== 1 ? "s" : ""} queued</span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
                    <input
                        type="text"
                        placeholder="grep crews / name or code…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-inset border border-[var(--border-soft)] rounded-md pl-9 pr-3 py-2.5 text-ink text-[13px] font-mono placeholder:text-ink-subtle focus:outline-none focus:border-brand focus:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all duration-200"
                    />
                </div>

                {/* Selection preview strip */}
                {selectedTeams.size > 0 && (
                    <div className="rounded-md border border-[var(--border-soft)] bg-surface-inset p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand">
                                pending batch · preview
                            </span>
                            <button
                                onClick={() => setSelectedTeams(new Set())}
                                className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted hover:text-ink transition-colors flex items-center gap-1"
                                type="button"
                            >
                                <X className="w-3 h-3" />
                                clear
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {previewNames.map((name, i) => (
                                <span
                                    key={`${name}-${i}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-1 border border-brand/25 font-mono text-[11px] text-brand/90 truncate max-w-[180px]"
                                >
                                    <span className="truncate">{name}</span>
                                </span>
                            ))}
                            {previewExtra > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-1 border border-[var(--border-soft)] font-mono text-[11px] text-ink-muted">
                                    +{previewExtra} more
                                </span>
                            )}
                        </div>
                        {reassignCount > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--warning)]">
                                <AlertTriangle className="w-3 h-3" />
                                {reassignCount} crew{reassignCount !== 1 ? "s" : ""} already assigned to another judge. will reassign
                            </div>
                        )}
                    </div>
                )}

                {/* Selectable list */}
                <div className="flex-1 overflow-y-auto min-h-[200px] flex flex-col gap-1.5 pr-1 -mr-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Spinner size="lg" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                                fetching crews…
                            </span>
                        </div>
                    ) : filteredTeams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-md border border-dashed border-[var(--border-soft)] bg-surface-inset/50">
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-1">
                                no_crews.match
                            </div>
                            <p className="text-[12.5px] text-ink-muted max-w-xs">
                                Adjust your query or load more.
                            </p>
                        </div>
                    ) : (
                        filteredTeams.map((team) => {
                            const isSelected = selectedTeams.has(team.teamCode);
                            return (
                                <button
                                    type="button"
                                    key={team.teamCode}
                                    onClick={() => handleToggleTeam(team.teamCode)}
                                    className={`flex items-center justify-between gap-3 p-3 rounded-md border text-left transition-all duration-150 ${
                                        isSelected
                                            ? "bg-brand-soft border-brand/55 shadow-[0_0_16px_rgba(0,255,136,0.15)]"
                                            : "bg-surface-inset border-[var(--border-soft)] hover:border-brand/30 hover:bg-surface-1"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="shrink-0">
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-brand" />
                                            ) : (
                                                <Square className="w-5 h-5 text-ink-disabled" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-ink text-[13.5px] font-medium truncate">
                                                    {team.teamName}
                                                </span>
                                                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-subtle">
                                                    {team.teamCode}
                                                </span>
                                            </div>
                                            <div className="font-mono text-[11px] text-ink-muted truncate mt-0.5">
                                                {team.problemStatement}
                                            </div>
                                            {team.isAssigned && (
                                                <div className="mt-1 inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--warning)]">
                                                    <Users className="w-3 h-3" />
                                                    already assigned
                                                    {team.assignedToName ? ` → ${team.assignedToName}` : ""}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                    {hasMore && !isLoading && filteredTeams.length > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleLoadMore}
                            className="w-full mt-2"
                        >
                            Load more crews
                        </Button>
                    )}
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between gap-3 pt-3">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                        <span className="text-ink-subtle">queued:</span>{" "}
                        <span className="text-brand tabular-nums">{selectedTeams.size}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setConfirmation({ isOpen: true, teamCode: "" })}
                            disabled={isSubmitting || selectedTeams.size === 0}
                        >
                            {isSubmitting && <Spinner size="sm" className="mr-2" />}
                            Commit assignment
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={() => {
                    handleAssign();
                    setConfirmation({ ...confirmation, isOpen: false });
                }}
                title="Commit assignment"
                message={`Assign ${selectedTeams.size} crew${selectedTeams.size !== 1 ? "s" : ""} to ${evaluatorName}?${
                    reassignCount > 0
                        ? ` ${reassignCount} will be reassigned from another judge.`
                        : ""
                }`}
            />
        </Modal>
    );
}
