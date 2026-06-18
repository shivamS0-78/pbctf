/**
 * Decorative HUD frame for card-like containers.
 *
 * Visual layers (all edge-only, NO internal patterns / gradients / halos —
 * those create patchy shading that makes cards look amateur):
 *   1. Top accent line — 1px gradient that fades in and out
 *   2. Four brand-tinted corner brackets at the corners
 *
 * Drop inside any `relative` rounded container. Outer container must NOT have
 * `overflow-hidden` if you want the corner brackets to be visible (they sit
 * at -1px outside the border).
 */

interface HudFrameProps {
  cornerSize?: "sm" | "md" | "lg";
  /** "soft" for inline list cards; "strong" for section heroes. */
  intensity?: "soft" | "strong";
}

const SIZE_MAP = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
} as const;

export function HudFrame({
  cornerSize = "md",
  intensity = "strong",
}: HudFrameProps = {}) {
  const strong = intensity === "strong";

  const size = SIZE_MAP[cornerSize];
  const stroke = strong ? "border-brand/60" : "border-brand/35";
  const strokeW_TL = strong ? "border-l-[1.5px] border-t-[1.5px]" : "border-l border-t";
  const strokeW_BL = strong ? "border-l-[1.5px] border-b-[1.5px]" : "border-l border-b";
  const strokeW_TR = strong ? "border-r-[1.5px] border-t-[1.5px]" : "border-r border-t";
  const strokeW_BR = strong ? "border-r-[1.5px] border-b-[1.5px]" : "border-r border-b";
  const accentColor = strong ? "via-brand/40" : "via-brand/20";

  return (
    <>
      {/* Top accent line - fades at both ends */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${accentColor} to-transparent`}
      />

      {/* Corner brackets */}
      <span aria-hidden className={`pointer-events-none absolute -top-px -left-px ${size} ${strokeW_TL} ${stroke}`} />
      <span aria-hidden className={`pointer-events-none absolute -top-px -right-px ${size} ${strokeW_TR} ${stroke}`} />
      <span aria-hidden className={`pointer-events-none absolute -bottom-px -left-px ${size} ${strokeW_BL} ${stroke}`} />
      <span aria-hidden className={`pointer-events-none absolute -bottom-px -right-px ${size} ${strokeW_BR} ${stroke}`} />
    </>
  );
}
