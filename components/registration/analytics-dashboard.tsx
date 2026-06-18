import React, { useState, useEffect } from "react";
import { useAuth } from '@/hooks/use-auth';
import {
    UserCircle, Users, CheckCircle, Trophy, Search, Sparkles, Activity,
    TrendingUp, PieChart as PieIcon, Terminal,
} from "lucide-react";
import { Card } from "./card";
import { HudFrame } from "./hud-frame";
import { StickyAlert } from "./sticky-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AdminStats {
    totalUsers: number;
    totalTeams: number;
    totalEvaluated: number;
}

interface ShortlistedTeam {
    _id: string;
    teamCode: string;
    teamName: string;
    teamLead: string;
    memberCount: number;
    status: string;
    createdAt: string;
}

interface ShortlistedStats {
    totalTeams: number;
    totalParticipants: number;
}

const COLORS = ['#00FF88', '#8CFF00', '#00CC70', '#8CFF00', '#0088FE', '#8884d8'];

import { API_ENDPOINTS } from "@/lib/api-config";

export function AnalyticsDashboard() {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState("analytics");

    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalTeams: 0,
        totalEvaluated: 0,
    });

    const [registrationData, setRegistrationData] = useState<any[]>([]);
    const [teamStatusData, setTeamStatusData] = useState<any[]>([]);

    // Shortlisted teams state
    const [shortlistedTeams, setShortlistedTeams] = useState<ShortlistedTeam[]>([]);
    const [shortlistedStats, setShortlistedStats] = useState<ShortlistedStats>({
        totalTeams: 0,
        totalParticipants: 0,
    });
    const [shortlistedSearchQuery, setShortlistedSearchQuery] = useState('');
    const [shortlistedLoading, setShortlistedLoading] = useState(false);

    const [alert, setAlert] = useState<{
        type: "success" | "error" | "warning" | "info";
        message: string;
    } | null>(null);

    // Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch('/api/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setStats({
                            totalUsers: result.data.totalUsers || 0,
                            totalTeams: result.data.totalTeams || 0,
                            totalEvaluated: result.data.totalEvaluated || 0,
                        });

                        if (result.data.history) {
                            const chartData = result.data.history.map((item: any) => {
                                const date = new Date(item.date);
                                return {
                                    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    users: item.totalUsers
                                };
                            });
                            setRegistrationData(chartData);
                        }

                        if (result.data.teamDistribution) {
                            setTeamStatusData(result.data.teamDistribution);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
    }, [getToken]);

    // Fetch Shortlisted Teams
    useEffect(() => {
        const fetchShortlistedTeams = async () => {
            try {
                setShortlistedLoading(true);
                const token = await getToken();
                if (!token) return;

                const response = await fetch('/api/shortlisted-teams', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setShortlistedTeams(result.data.teams || []);
                        setShortlistedStats(result.data.stats || {
                            totalTeams: 0,
                            totalParticipants: 0,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch shortlisted teams", error);
            } finally {
                setShortlistedLoading(false);
            }
        };

        fetchShortlistedTeams();
    }, [getToken]);

    // Filter shortlisted teams based on search query
    const filteredShortlistedTeams = shortlistedTeams.filter(team =>
        team.teamName.toLowerCase().includes(shortlistedSearchQuery.toLowerCase()) ||
        team.teamCode.toLowerCase().includes(shortlistedSearchQuery.toLowerCase()) ||
        team.teamLead.toLowerCase().includes(shortlistedSearchQuery.toLowerCase())
    );

    // Generate initials from team name
    const getTeamInitials = (teamName: string) => {
        const words = teamName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    // ---- derived presentation values (no functional change) ----

    // 24h delta: last - prev
    const last = registrationData.length > 0 ? registrationData[registrationData.length - 1]?.users ?? 0 : 0;
    const prev = registrationData.length > 1 ? registrationData[registrationData.length - 2]?.users ?? 0 : last;
    const delta = last - prev;
    const deltaPct = prev > 0 ? Math.round((delta / prev) * 100) : 0;

    const conversionPct = stats.totalUsers > 0 ? Math.round((stats.totalEvaluated / stats.totalUsers) * 100) : 0;

    const metricTiles = [
        { code: "USR", label: "Operators", value: stats.totalUsers, icon: UserCircle, hint: "registered identities" },
        { code: "TM", label: "Crews", value: stats.totalTeams, icon: Users, hint: "active teams" },
        { code: "EV", label: "Evaluated", value: stats.totalEvaluated, icon: CheckCircle, hint: "scored submissions" },
    ];

    return (
        <div className="flex flex-col gap-6 w-full">
            {alert && (
                <StickyAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* ──────────────────────────────────────────────
                 TERMINAL HEADER + KEY METRICS
               ────────────────────────────────────────────── */}
            <section className="relative rounded-lg border border-brand/20 bg-surface-1/80 shadow-card">
      <HudFrame cornerSize="md" intensity="strong" />
<div className="relative z-10 flex flex-col gap-5 p-5 md:p-7">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-2 flex items-center gap-2">
                                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-brand shadow-glow-sm anim-blink" />
                                root@pbctf:~/analytics
                            </div>
                            <h1 className="font-heading text-[26px] md:text-[32px] font-semibold text-ink tracking-tight leading-tight">
                                Telemetry
                            </h1>
                            <p className="font-mono text-[12px] text-ink-muted mt-1.5">
                                <span className="text-brand">&gt;</span> live snapshot. registration · evaluation · finalist roster
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-brand/30 bg-brand-soft font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand">
                            <Activity className="w-3 h-3" />
                            STREAM ACTIVE
                        </span>
                    </div>

                    {/* primary metric tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {metricTiles.map(({ code, label, value, icon: Icon, hint }) => (
                            <div
                                key={label}
                                className="rounded-md border border-[var(--border-soft)] bg-surface-inset/80 p-4 hover:border-brand/40 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
                                        {code}
                                    </span>
                                    <Icon className="w-3.5 h-3.5 text-brand/70" />
                                </div>
                                <div
                                    className="font-heading text-[28px] md:text-[32px] font-semibold text-ink tabular-nums tracking-tight leading-none"
                                    style={{ textShadow: "0 0 20px rgba(0,255,136,0.28)" }}
                                >
                                    {value.toLocaleString()}
                                </div>
                                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand mt-2">
                                    {label}
                                </div>
                                <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div>
                            </div>
                        ))}
                    </div>

                    {/* secondary KPIs (derived from same data) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        <KpiCell
                            code="Δ24"
                            label="24h delta"
                            value={delta >= 0 ? `+${delta}` : `${delta}`}
                            sub={prev > 0 ? `${deltaPct >= 0 ? "+" : ""}${deltaPct}% vs prev` : "no prior sample"}
                            tone={delta >= 0 ? "up" : "down"}
                        />
                        <KpiCell
                            code="CONV"
                            label="Eval rate"
                            value={`${conversionPct}%`}
                            sub={`${stats.totalEvaluated}/${stats.totalUsers} reviewed`}
                            tone="neutral"
                        />
                        <KpiCell
                            code="WIN"
                            label="Finalists"
                            value={shortlistedStats.totalTeams.toLocaleString()}
                            sub={`${shortlistedStats.totalParticipants} ops shortlisted`}
                            tone="neutral"
                        />
                    </div>
                </div>
            </section>

            {/* ──────────────────────────────────────────────
                 TABBED WORK SURFACE
               ────────────────────────────────────────────── */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-white">
                <div className="rounded-lg border border-[var(--border-soft)] bg-surface-1/60 p-1.5">
                    <TabsList className="flex flex-wrap items-center gap-1 bg-transparent p-0 h-auto w-full">
                        {[
                            { value: "analytics", label: "Telemetry", code: "01" },
                            { value: "shortlisted", label: "Finalists", code: "02" },
                        ].map(({ value, label, code }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="flex items-center gap-2 bg-transparent border border-transparent text-ink-muted rounded-md px-3 py-2 text-[13px] font-medium whitespace-nowrap data-[state=active]:bg-brand-soft data-[state=active]:border-brand/55 data-[state=active]:text-brand data-[state=active]:shadow-[0_0_16px_rgba(0,255,136,0.18)] hover:text-ink hover:bg-white/[0.03] transition-all duration-200"
                            >
                                <span className="font-mono text-[10.5px] tracking-[0.16em] opacity-70">{code}</span>
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="analytics" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* registration growth */}
                        <Card className="!p-0">
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="min-w-0">
                                    <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand mb-0.5 flex items-center gap-1.5">
                                        <TrendingUp className="w-3 h-3" />
                                        CHART_01
                                    </div>
                                    <h3 className="font-heading text-[15px] font-semibold text-ink tracking-tight">
                                        Registration Curve
                                    </h3>
                                </div>
                                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">
                                    daily · users
                                </span>
                            </div>
                            <div className="p-4">
                                {registrationData.length === 0 ? (
                                    <ChartEmpty label="Waiting for registration signal…" />
                                ) : (
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={registrationData}>
                                                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,255,136,0.1)" />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="rgba(255,255,255,0.4)"
                                                    tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                                                />
                                                <YAxis
                                                    stroke="rgba(255,255,255,0.4)"
                                                    tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                                                    width={32}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#0a0a0a",
                                                        border: "1px solid rgba(0,255,136,0.35)",
                                                        borderRadius: 6,
                                                        fontFamily: "var(--font-mono)",
                                                        fontSize: 11,
                                                    }}
                                                    itemStyle={{ color: "#00ff88" }}
                                                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="users"
                                                    stroke="#00FF88"
                                                    strokeWidth={2}
                                                    dot={{ r: 2, fill: "#00ff88" }}
                                                    activeDot={{ r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* team status distribution */}
                        <Card className="!p-0">
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="min-w-0">
                                    <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand mb-0.5 flex items-center gap-1.5">
                                        <PieIcon className="w-3 h-3" />
                                        CHART_02
                                    </div>
                                    <h3 className="font-heading text-[15px] font-semibold text-ink tracking-tight">
                                        Crew Status Mix
                                    </h3>
                                </div>
                                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">
                                    distribution
                                </span>
                            </div>
                            <div className="p-4">
                                {teamStatusData.length === 0 ? (
                                    <ChartEmpty label="No crew distribution yet…" />
                                ) : (
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={teamStatusData}
                                                    cx="40%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={88}
                                                    fill="#8884d8"
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="rgba(0,0,0,0.4)"
                                                >
                                                    {teamStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#0a0a0a",
                                                        border: "1px solid rgba(0,255,136,0.35)",
                                                        borderRadius: 6,
                                                        fontFamily: "var(--font-mono)",
                                                        fontSize: 11,
                                                    }}
                                                    itemStyle={{ color: "#fff" }}
                                                />
                                                <Legend
                                                    layout="vertical"
                                                    verticalAlign="middle"
                                                    align="right"
                                                    iconType="square"
                                                    wrapperStyle={{
                                                        fontSize: 11,
                                                        fontFamily: "var(--font-mono)",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.14em",
                                                        color: "rgba(255,255,255,0.7)",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="shortlisted" className="mt-4">
                    <Card className="!p-0">
                        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                            <div className="min-w-0 flex items-center gap-2.5">
                                <span className="font-mono text-brand text-[12px] leading-none">{">"}</span>
                                <h2 className="font-heading text-[15px] font-semibold text-ink tracking-tight">
                                    Finalists
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-brand/30 bg-brand-soft font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand">
                                    <Trophy className="w-3 h-3" />
                                    {shortlistedStats.totalTeams} crews · {shortlistedStats.totalParticipants} ops
                                </span>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="px-5 pt-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="grep finalists / name · code · lead…"
                                    value={shortlistedSearchQuery}
                                    onChange={(e) => setShortlistedSearchQuery(e.target.value)}
                                    className="w-full bg-surface-inset border border-[var(--border-soft)] rounded-md pl-9 pr-3 py-2.5 text-ink text-[13px] font-mono placeholder:text-ink-subtle focus:outline-none focus:border-brand focus:shadow-[0_0_16px_rgba(0,255,136,0.25)] transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="px-5 py-4">
                            {shortlistedLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <span className="inline-flex w-2 h-2 rounded-full bg-brand shadow-glow-sm anim-blink" />
                                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                                        loading finalist roster…
                                    </span>
                                </div>
                            ) : filteredShortlistedTeams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-md border border-dashed border-[var(--border-soft)] bg-surface-inset/50">
                                    <div className="w-11 h-11 rounded-md bg-brand-soft border border-brand/20 flex items-center justify-center mb-3">
                                        <Trophy className="w-5 h-5 text-brand" />
                                    </div>
                                    <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand mb-1">
                                        no_finalists.found
                                    </div>
                                    <h3 className="text-[15px] text-ink font-medium">
                                        {shortlistedSearchQuery ? "No matches" : "No shortlisted teams yet"}
                                    </h3>
                                    <p className="text-[12.5px] text-ink-muted mt-1 max-w-sm">
                                        {shortlistedSearchQuery
                                            ? `Nothing matches "${shortlistedSearchQuery}".`
                                            : "Promote crews to populate the finalist list."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {filteredShortlistedTeams.map((team, index) => {
                                        const initials = getTeamInitials(team.teamName);
                                        return (
                                            <div
                                                key={team._id || team.teamCode}
                                                className="group relative rounded-md border border-[var(--border-soft)] bg-surface-inset/70 hover:border-brand/40 hover:bg-surface-inset transition-all duration-200 p-4"
                                            >
                                                {/* rank */}
                                                <div className="absolute top-2 right-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
                                                    #{String(index + 1).padStart(2, "0")}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-md flex items-center justify-center text-[15px] font-semibold text-brand shrink-0 bg-brand-soft border border-brand/30 shadow-glow-sm">
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-ink font-medium text-[14px] leading-tight truncate" title={team.teamName}>
                                                            {team.teamName}
                                                        </h3>
                                                        <p className="text-[11.5px] text-ink-muted mt-0.5 truncate" title={team.teamLead}>
                                                            led_by: {team.teamLead}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-3">
                                                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-subtle">
                                                        {team.teamCode}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                                                            <Users className="w-3 h-3" />
                                                            {team.memberCount}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
                                                            <Sparkles className="w-3 h-3" />
                                                            Finalist
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-subtle px-1">
                <Terminal className="w-3 h-3" />
                <span>telemetry stream · refresh on reload</span>
            </div>
        </div>
    );
}

// ───── helpers ─────

function KpiCell({
    code,
    label,
    value,
    sub,
    tone,
}: {
    code: string;
    label: string;
    value: string;
    sub: string;
    tone: "up" | "down" | "neutral";
}) {
    const toneCls =
        tone === "up"
            ? "text-brand"
            : tone === "down"
                ? "text-[var(--danger)]"
                : "text-ink";
    return (
        <div className="rounded-md border border-[var(--border-soft)] bg-surface-inset/60 p-3">
            <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">{code}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">{label}</span>
            </div>
            <div className={`font-heading text-[20px] tabular-nums font-semibold tracking-tight ${toneCls}`}>
                {value}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted mt-0.5">{sub}</div>
        </div>
    );
}

function ChartEmpty({ label }: { label: string }) {
    return (
        <div className="h-[280px] flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border-soft)] bg-surface-inset/40">
            <span className="inline-flex w-2 h-2 rounded-full bg-brand shadow-glow-sm anim-blink" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">{label}</span>
        </div>
    );
}
