import React, { useState, useEffect } from "react";
import { useAuth } from '@/hooks/use-auth';
import { API_ENDPOINTS } from "@/lib/api-config";
import { Button } from "./button";
import { Card } from "./card";
import { Spinner } from "@/components/ui/spinner";
import {
    UserCog, PlusCircle, UserPlus, Trash2, Search, ShieldCheck, Activity, AlertTriangle,
} from "lucide-react";
import { StickyAlert } from "./sticky-alert";
import { AssignTeamsModal } from "./assign-teams-modal";
import { AddEvaluatorModal } from "./add-evaluator-modal";
import { ConfirmationDialog } from "./confirmation-dialog";

interface Evaluator {
    id: string;
    uid: string;
    name: string;
    email: string;
    assignedCount: number;
    evaluatedCount: number;
    pendingCount: number;
}

export function EvaluatorsTab() {
    const { getToken } = useAuth();
    const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPruneDialogOpen, setIsPruneDialogOpen] = useState(false);
    const [isPruning, setIsPruning] = useState(false);
    const [selectedEvaluator, setSelectedEvaluator] = useState<{ id: string, name: string } | null>(null);

    const fetchEvaluators = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(API_ENDPOINTS.adminEvaluators, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.evaluators) {
                    setEvaluators(data.data.evaluators);
                }
            } else {
                setAlert({ type: "error", message: "Failed to fetch evaluators" });
            }
        } catch (error) {
            console.error("Failed to fetch evaluators:", error);
            setAlert({ type: "error", message: "An error occurred while loading evaluators" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvaluators();
    }, []);

    const handleOpenAssignModal = (evaluator: Evaluator) => {
        setSelectedEvaluator({ id: evaluator.uid, name: evaluator.name });
        setIsAssignModalOpen(true);
    };

    const handleAssignSuccess = () => {
        setAlert({ type: "success", message: "Teams assigned successfully!" });
        fetchEvaluators(); // Refresh list to update counts
        setTimeout(() => setAlert(null), 3000);
    };

    const requestPruneAssignments = () => {
        setIsPruneDialogOpen(true);
    };

    const executePruneAssignments = async () => {
        setIsPruning(true);
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_ENDPOINTS.adminEvaluators}/prune`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAlert({
                    type: "success",
                    message: `Cleanup successful! Removed ${data.data.prunedCount} invalid assignments.`
                });
                fetchEvaluators();
            } else {
                setAlert({ type: "error", message: "Failed to prune assignments" });
            }
        } catch (error) {
            console.error("Prune error:", error);
            setAlert({ type: "error", message: "An error occurred during cleanup" });
        } finally {
            setIsPruning(false);
            setIsPruneDialogOpen(false);
            setTimeout(() => setAlert(null), 5000);
        }
    };

    const filteredEvaluators = evaluators.filter(ev =>
        ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── derived figures ──
    const totalAssigned = evaluators.reduce((a, e) => a + (e.assignedCount || 0), 0);
    const totalEvaluated = evaluators.reduce((a, e) => a + (e.evaluatedCount || 0), 0);
    const totalPending = Math.max(totalAssigned - totalEvaluated, 0);
    const completionPct = totalAssigned > 0 ? Math.round((totalEvaluated / totalAssigned) * 100) : 0;

    return (
        <div className="flex flex-col gap-4 w-full mt-2">
            {alert && (
                <StickyAlert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* judge corps roll-up */}
            <Card className="!p-0">
                <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-brand text-[12px] leading-none">{">"}</span>
                        <h2 className="font-heading text-[15px] font-semibold text-ink tracking-tight">
                            Judge Corps
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-brand/30 bg-brand-soft font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand">
                            <ShieldCheck className="w-3 h-3" />
                            {evaluators.length} active
                        </span>
                    </div>
                </div>

                {/* roll-up KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border-hairline)]">
                    <RollupCell code="ASGN" label="Assigned" value={totalAssigned} />
                    <RollupCell code="DONE" label="Evaluated" value={totalEvaluated} tone="brand" />
                    <RollupCell code="OPEN" label="Pending" value={totalPending} tone="warn" />
                    <RollupCell code="PCT" label="Complete" value={`${completionPct}%`} tone="brand" />
                </div>

                {/* toolbar */}
                <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
                        <input
                            type="text"
                            placeholder="grep judges / name · email…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-inset border border-[var(--border-soft)] rounded-md pl-9 pr-3 py-2.5 text-ink text-[13px] font-mono placeholder:text-ink-subtle focus:outline-none focus:border-brand focus:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all duration-200"
                        />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                            <UserPlus className="w-3.5 h-3.5" />
                            Recruit Judge
                        </Button>
                        <Button variant="danger" size="sm" onClick={requestPruneAssignments}>
                            <Trash2 className="w-3.5 h-3.5" />
                            Purge Stale
                        </Button>
                    </div>
                </div>

                {/* list */}
                <div className="p-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Spinner size="lg" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                                loading judge corps…
                            </span>
                        </div>
                    ) : filteredEvaluators.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-md border border-dashed border-[var(--border-soft)] bg-surface-inset/50">
                            <div className="w-11 h-11 rounded-md bg-brand-soft border border-brand/20 flex items-center justify-center mb-3">
                                <UserCog className="w-5 h-5 text-brand" />
                            </div>
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-1">
                                no_judges.found
                            </div>
                            <h3 className="text-[15px] text-ink font-medium">
                                {searchQuery ? "No matches" : "No judges yet"}
                            </h3>
                            <p className="text-[12.5px] text-ink-muted mt-1 max-w-sm">
                                {searchQuery
                                    ? `Nothing matches "${searchQuery}".`
                                    : "Recruit an operator to the judge corps to begin evaluations."}
                            </p>
                            {!searchQuery && (
                                <div className="mt-4">
                                    <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Recruit first judge
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {filteredEvaluators.map((evaluator) => {
                                const pct =
                                    evaluator.assignedCount > 0
                                        ? Math.min(100, Math.round((evaluator.evaluatedCount / evaluator.assignedCount) * 100))
                                        : 0;
                                const pending = Math.max(
                                    (evaluator.assignedCount || 0) - (evaluator.evaluatedCount || 0),
                                    0
                                );
                                const isIdle = (evaluator.assignedCount || 0) === 0;
                                const isOverdue = pending > 0 && pct < 25;

                                return (
                                    <div
                                        key={evaluator.id}
                                        className="rounded-md border border-[var(--border-soft)] bg-surface-inset/60 hover:border-brand/30 transition-colors p-4 flex flex-col gap-3"
                                    >
                                        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-md bg-brand-soft border border-brand/20 flex items-center justify-center shrink-0">
                                                    <UserCog className="w-5 h-5 text-brand" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-[14.5px] font-medium text-ink truncate">{evaluator.name}</h3>
                                                        {isIdle ? (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                                                                idle
                                                            </span>
                                                        ) : isOverdue ? (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--warning-soft)] border border-[var(--warning)]/40 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--warning)]">
                                                                <AlertTriangle className="w-2.5 h-2.5" />
                                                                behind
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-soft border border-brand/30 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                                                                <Activity className="w-2.5 h-2.5" />
                                                                on track
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-mono text-[11.5px] text-ink-muted break-all">{evaluator.email}</p>
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-auto flex justify-end shrink-0">
                                                <Button variant="primary" size="sm" onClick={() => handleOpenAssignModal(evaluator)}>
                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                    Assign Crews
                                                </Button>
                                            </div>
                                        </div>

                                        {/* progress meter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-subtle">
                                                    progress
                                                </span>
                                                <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
                                                    <span className="text-brand">{evaluator.evaluatedCount}</span>
                                                    <span className="text-ink-subtle"> / </span>
                                                    {evaluator.assignedCount}
                                                    <span className="text-ink-subtle"> done · </span>
                                                    <span className="text-[var(--warning)]">{pending}</span>
                                                    <span className="text-ink-subtle"> open</span>
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-surface-inset border border-[var(--border-hairline)] overflow-hidden">
                                                <div
                                                    className={`h-full transition-[width] duration-500 ${isOverdue ? "bg-[var(--warning)]" : "bg-brand"} ${pct > 0 ? "shadow-glow-sm" : ""}`}
                                                    style={{ width: `${pct}%` }}
                                                    aria-hidden
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
                                                <span>completion {pct}%</span>
                                                {pending === 0 && evaluator.assignedCount > 0 ? (
                                                    <span className="text-brand">queue clear</span>
                                                ) : (
                                                    <span>{pending} in queue</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            {selectedEvaluator && (
                <AssignTeamsModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    evaluatorId={selectedEvaluator.id}
                    evaluatorName={selectedEvaluator.name}
                    onSuccess={handleAssignSuccess}
                />
            )}

            <AddEvaluatorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    setAlert({ type: "success", message: "Evaluator added successfully!" });
                    fetchEvaluators();
                }}
            />

            <ConfirmationDialog
                isOpen={isPruneDialogOpen}
                onClose={() => setIsPruneDialogOpen(false)}
                onConfirm={executePruneAssignments}
                title="Purge stale assignments"
                message="This removes every assignment whose team has not submitted yet. The action cannot be undone."
                confirmLabel="Purge"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isPruning}
            />
        </div>
    );
}

function RollupCell({
    code,
    label,
    value,
    tone = "ink",
}: {
    code: string;
    label: string;
    value: number | string;
    tone?: "ink" | "brand" | "warn";
}) {
    const toneCls =
        tone === "brand" ? "text-brand" : tone === "warn" ? "text-[var(--warning)]" : "text-ink";
    return (
        <div className="bg-surface-1 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">{code}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">{label}</span>
            </div>
            <div className={`font-heading text-[20px] tabular-nums font-semibold tracking-tight ${toneCls}`}>
                {value}
            </div>
        </div>
    );
}
