"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-void relative overflow-hidden">
      <div className="absolute inset-0 bg-terminal-grid-faint opacity-40" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-halo opacity-60" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-bold text-ink text-[28px] sm:text-[36px] tracking-tight">
            PBCTF
          </span>
          <span className="font-mono text-brand text-[18px] sm:text-[22px] font-semibold">
            5.0
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          <span className="text-brand">{">"}</span>
          <span>redirecting to dashboard</span>
          <span className="text-brand anim-blink">▌</span>
        </div>
      </div>
    </div>
  );
}
