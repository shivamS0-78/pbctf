"use client";

import { usePathname } from "next/navigation";
import {
  LogOut,
  LogIn,
  Shield,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Radar,
  Sliders,
  Gavel,
} from "lucide-react";
import { Logo } from "./logo";

interface User {
  uid: string;
  name: string;
  email: string;
  role?: string;
}

interface NavBarProps {
  user?: User;
  onLogout: () => void;
  onNavigate?: (view: string) => void;
  /** Auth is still resolving. Show a skeleton avatar instead of the Login button. */
  isAuthLoading?: boolean;
}

type NavItem = {
  view: string;
  match: string;
  label: string;
  short: string;
  Icon: typeof LayoutDashboard;
};

const BASE_NAV: NavItem[] = [
  { view: "/dashboard",          match: "/dashboard",          label: "Dashboard", short: "Home",     Icon: LayoutDashboard },
  { view: "/dashboard/team",     match: "/dashboard/team",     label: "Team",      short: "Team",     Icon: Users },
  { view: "/dashboard/discover", match: "/dashboard/discover", label: "Discover",  short: "Discover", Icon: Radar },
];

const ROLE_NAV: Record<string, NavItem[]> = {
  admin: [
    { view: "/dashboard/admin", match: "/dashboard/admin", label: "Admin", short: "Admin", Icon: Sliders },
  ],
  evaluator: [
    { view: "/dashboard/evaluator", match: "/dashboard/evaluator", label: "Evaluator", short: "Eval", Icon: Gavel },
  ],
};

function RoleChip({ role }: { role: string }) {
  const map: Record<string, { Icon: typeof Shield; cls: string }> = {
    admin: { Icon: ShieldCheck, cls: "text-brand border-brand/40 bg-brand-soft" },
    evaluator: { Icon: Shield, cls: "text-[var(--info)] border-[var(--info)]/35 bg-[var(--info-soft)]" },
  };
  const entry = map[role.toLowerCase()];
  if (!entry) return null;
  const { Icon, cls } = entry;
  return (
    <span
      className={[
        "hidden md:inline-flex items-center gap-1.5 px-2 h-6 rounded border",
        "font-mono text-[10px] uppercase tracking-[0.18em]",
        cls,
      ].join(" ")}
    >
      <Icon className="w-3 h-3" />
      {role}
    </span>
  );
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const { Icon, label, short } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={[
        "relative inline-flex shrink-0 items-center gap-2 h-9 px-3 rounded-md",
        "transition-[background,border-color,color] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        active
          ? "bg-brand-soft text-brand border border-brand/40"
          : "text-ink-secondary hover:text-ink border border-transparent hover:bg-white/[0.03]",
      ].join(" ")}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[12.5px] font-medium font-body whitespace-nowrap">
        <span className="hidden lg:inline">{label}</span>
        <span className="lg:hidden">{short}</span>
      </span>
      {active && (
        <span className="absolute -bottom-px left-3 right-3 h-px bg-brand opacity-70" />
      )}
    </button>
  );
}

export function NavBar({ user, onLogout, onNavigate, isAuthLoading }: NavBarProps) {
  const pathname = usePathname() || "";

  const initials =
    (user?.name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  // Role-scoped nav. Admins and evaluators only get their own workspace;
  // they shouldn't see the participant routes (Dashboard / Team / Discover).
  const roleKey = user?.role?.toLowerCase();
  const roleNav = (roleKey && ROLE_NAV[roleKey]) || [];
  const isPrivilegedRole = roleKey === "admin" || roleKey === "evaluator";
  const nav: NavItem[] = user
    ? isPrivilegedRole
      ? roleNav
      : [...BASE_NAV, ...roleNav]
    : [];

  const isActive = (match: string) => {
    if (match === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname === match || pathname.startsWith(match + "/");
  };

  const handleNav = (view: string) => {
    if (!onNavigate) return;
    if (view === "/dashboard") onNavigate("");
    else onNavigate(view.replace("/dashboard/", ""));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-base/85 backdrop-blur-md border-b border-[var(--border-soft)]">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="h-14 md:h-16 flex items-center justify-between gap-3 md:gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("landing")}
            className="group flex shrink-0 items-center gap-2.5 -ml-1 px-1 py-1 rounded-md transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="PBCTF 5.0 Home"
          >
            <Logo />
            <span className="hidden md:inline-block ml-1 w-1 h-1 rounded-full bg-brand anim-blink" />
          </button>

          {/* Nav. scroll horizontally on small screens */}
          {user && nav.length > 0 && (
            <nav
              aria-label="Primary"
              className="flex-1 min-w-0 overflow-x-auto no-scrollbar"
            >
              <div className="inline-flex items-center gap-1 px-1">
                {nav.map((item) => (
                  <NavLink
                    key={item.view}
                    item={item}
                    active={isActive(item.match)}
                    onClick={() => handleNav(item.view)}
                  />
                ))}
              </div>
            </nav>
          )}

          {/* Auth zone */}
          {isAuthLoading ? (
            <div className="flex shrink-0 items-center gap-2 md:gap-3" aria-label="Loading user">
              <div className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 h-9 rounded-md border border-[var(--border-soft)] bg-surface-1">
                <span className="inline-flex w-7 h-7 rounded-sm bg-surface-2 animate-pulse" />
                <span className="inline-flex w-14 h-3 rounded bg-surface-2 animate-pulse" />
              </div>
              <span className="sm:hidden inline-flex w-9 h-9 rounded-md border border-[var(--border-soft)] bg-surface-1 animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              {user.role && <RoleChip role={user.role} />}

              {isPrivilegedRole ? (
                // Admin / evaluator: profile page doesn't apply, so the
                // avatar tile is non-interactive and just displays identity.
                <div
                  className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 h-9 rounded-md border border-[var(--border-soft)] bg-surface-1"
                  aria-label="Current operator"
                >
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-sm bg-brand text-brand-ink text-[11px] font-mono font-bold">
                    {initials}
                  </span>
                  <span className="text-[13px] text-ink font-body font-medium leading-none max-w-[120px] truncate">
                    {user.name.split(/\s+/)[0]}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav("/dashboard/profile")}
                  aria-label="Open profile"
                  aria-current={isActive("/dashboard/profile") ? "page" : undefined}
                  className={[
                    "hidden sm:flex items-center gap-2.5 pl-1 pr-3 h-9 rounded-md border bg-surface-1",
                    "transition-[background,border-color,color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    isActive("/dashboard/profile")
                      ? "border-brand/45 ring-1 ring-brand/30"
                      : "border-[var(--border-soft)] hover:border-[var(--border-default)] hover:bg-surface-2",
                  ].join(" ")}
                >
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-sm bg-brand text-brand-ink text-[11px] font-mono font-bold">
                    {initials}
                  </span>
                  <span className="text-[13px] text-ink font-body font-medium leading-none max-w-[120px] truncate">
                    {user.name.split(/\s+/)[0]}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-[var(--border-soft)] bg-surface-1 hover:bg-surface-2 hover:border-[var(--border-default)] text-ink-secondary hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline text-[12.5px] font-medium font-body">Logout</span>
              </button>

              {isPrivilegedRole ? (
                <div
                  className="sm:hidden inline-flex w-9 h-9 items-center justify-center rounded-md border border-[var(--border-soft)] bg-surface-1"
                  aria-label="Current operator"
                >
                  <span className="text-[11px] font-mono font-bold text-ink">{initials}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav("/dashboard/profile")}
                  aria-label="Open profile"
                  aria-current={isActive("/dashboard/profile") ? "page" : undefined}
                  className={[
                    "sm:hidden inline-flex w-9 h-9 items-center justify-center rounded-md border bg-surface-1",
                    "transition-[background,border-color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    isActive("/dashboard/profile")
                      ? "border-brand/45 text-brand"
                      : "border-[var(--border-soft)] hover:border-[var(--border-default)] text-ink-secondary",
                  ].join(" ")}
                >
                  <span className="text-[11px] font-mono font-bold">{initials}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("login")}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-brand text-brand-ink hover:bg-brand-hover hover:shadow-glow-sm transition-[background,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-[12.5px] font-semibold font-body">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
