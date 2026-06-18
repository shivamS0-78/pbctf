export function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-brand/45 bg-brand-soft text-brand font-mono font-bold text-[11px]"
        aria-hidden
        style={{ boxShadow: "0 0 14px rgba(0,255,136,0.18) inset" }}
      >
        PB
      </span>
      <span className="flex items-baseline gap-1">
        <span className="font-heading font-bold text-ink text-[15px] sm:text-[16px] tracking-tight">
          PBCTF
        </span>
        <span className="font-mono text-brand text-[12px] sm:text-[13px] font-semibold tracking-tight">
          5.0
        </span>
      </span>
    </div>
  );
}
