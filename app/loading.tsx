"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void overflow-hidden select-none">
      {/* halo */}
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-halo opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-terminal-grid-faint opacity-50 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo lockup */}
        <div className="flex items-center gap-3">
          <motion.span
            className="inline-flex w-12 h-12 items-center justify-center rounded-md border border-brand/55 bg-brand-soft text-brand font-mono font-bold text-[18px]"
            animate={{
              boxShadow: [
                "0 0 12px rgba(0,255,136,0.25), inset 0 0 14px rgba(0,255,136,0.18)",
                "0 0 28px rgba(0,255,136,0.55), inset 0 0 22px rgba(0,255,136,0.32)",
                "0 0 12px rgba(0,255,136,0.25), inset 0 0 14px rgba(0,255,136,0.18)",
              ],
            }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            PB
          </motion.span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-ink text-[32px] sm:text-[40px] tracking-tight">
              PBCTF
            </span>
            <span className="font-mono text-brand text-[20px] sm:text-[24px] font-semibold">
              5.0
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-[220px] sm:w-[280px] h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-brand to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "50%" }}
          />
        </div>

        {/* Terminal line */}
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          <span className="text-brand">{">"}</span>
          <span>booting environment</span>
          <span className="text-brand anim-blink">▌</span>
        </div>
      </div>
    </div>
  );
}
