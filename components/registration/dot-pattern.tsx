export function DotPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
      data-name="Terminal Grid Background"
    >
      {/* Layer 1. base grid */}
      <div
        className="absolute inset-0 opacity-[0.55] bg-terminal-grid"
        style={{ maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)" }}
      />

      {/* Layer 2. sparse phosphor points */}
      <div
        className="absolute inset-0 opacity-70 stars-twinkle-1"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="240" height="240" xmlns="http://www.w3.org/2000/svg"><circle cx="42" cy="68" r="0.9" fill="rgba(0,255,136,0.85)"/><circle cx="195" cy="200" r="0.7" fill="rgba(0,255,136,0.6)"/><circle cx="160" cy="42" r="0.5" fill="rgba(255,255,255,0.4)"/></svg>')`,
          backgroundSize: "240px 240px",
        }}
      />

      {/* Layer 3. secondary phosphor */}
      <div
        className="absolute inset-0 opacity-50 stars-twinkle-3"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg"><circle cx="120" cy="240" r="0.6" fill="rgba(0,255,136,0.7)"/><circle cx="60" cy="80" r="0.5" fill="rgba(255,255,255,0.35)"/></svg>')`,
          backgroundSize: "320px 320px",
        }}
      />

      {/* Halo highlight */}
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-halo opacity-90" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 50%, rgba(5,5,7,0.65) 100%)",
        }}
      />
    </div>
  );
}
