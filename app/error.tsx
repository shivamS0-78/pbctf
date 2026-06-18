"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void overflow-hidden">
      <div className="absolute inset-0 bg-terminal-grid-faint opacity-50 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-halo opacity-50 pointer-events-none" />

      <div className="relative z-10 w-[92%] max-w-[520px] bg-surface-1 border border-[var(--danger)]/30 rounded-lg p-8 shadow-modal text-center anim-fade-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--danger-soft)] border border-[var(--danger)]/40 mb-5">
          <AlertOctagon className="w-6 h-6 text-[var(--danger)]" />
        </div>

        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--danger)] mb-2">
          Process · Halted
        </div>
        <h1 className="font-heading text-[26px] sm:text-[32px] font-bold text-ink tracking-tight mb-3">
          Something went wrong
        </h1>
        <p className="text-[13.5px] text-ink-secondary font-body leading-relaxed mb-6">
          An unexpected error occurred. You can retry, or head back to the dashboard.
        </p>

        {error?.digest && (
          <div className="font-mono text-[11px] text-ink-muted bg-surface-inset border border-[var(--border-soft)] rounded-md px-3 py-2 mb-5 inline-block">
            ref: {error.digest}
          </div>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-brand text-brand-ink font-semibold text-[13px] hover:bg-brand-hover hover:shadow-glow-md transition-[background,box-shadow]"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
