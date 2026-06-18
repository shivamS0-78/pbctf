export function DotPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      data-name="Star Field"
      style={{ opacity: 0.85 }}
    >
      {/* Layer 1 — far stars, drifts right-down (35 s / tile) */}
      <div
        className="absolute inset-0 stars-layer-a"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><circle cx="52" cy="88" r="0.9" fill="rgba(0,255,136,0.7)"/><line x1="52" y1="85" x2="52" y2="91" stroke="rgba(0,255,136,0.2)" stroke-width="0.5" stroke-linecap="round"/><line x1="49" y1="88" x2="55" y2="88" stroke="rgba(0,255,136,0.2)" stroke-width="0.5" stroke-linecap="round"/><circle cx="11" cy="23" r="0.6" fill="rgba(255,255,255,0.5)"/><circle cx="95" cy="8" r="0.4" fill="rgba(255,255,255,0.35)"/><circle cx="107" cy="95" r="0.6" fill="rgba(255,255,255,0.45)"/><circle cx="73" cy="118" r="0.4" fill="rgba(255,255,255,0.3)"/><circle cx="127" cy="38" r="0.5" fill="rgba(255,255,255,0.35)"/><circle cx="118" cy="15" r="0.5" fill="rgba(255,255,255,0.35)"/></svg>')`,
          backgroundSize: '130px 130px',
        }}
      />

      {/* Layer 2 — near stars, drifts left-down (22 s / tile) — parallax depth */}
      <div
        className="absolute inset-0 stars-layer-b"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="90" height="90" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="15" r="0.4" fill="rgba(255,255,255,0.4)"/><circle cx="70" cy="38" r="0.4" fill="rgba(255,255,255,0.25)"/><circle cx="88" cy="82" r="0.4" fill="rgba(255,255,255,0.25)"/></svg>')`,
          backgroundSize: '90px 90px',
        }}
      />

      {/* Twinkling layers — 3 layers at staggered timings */}

      {/* T1: white star, 170×170 tile, 4 s cycle */}
      <div
        className="absolute inset-0 stars-twinkle-1"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="170" height="170" xmlns="http://www.w3.org/2000/svg"><circle cx="35" cy="95" r="3" fill="white" opacity="0.1"/><circle cx="35" cy="95" r="1.1" fill="white" opacity="0.9"/></svg>')`,
          backgroundSize: '170px 170px',
        }}
      />

      {/* T3: neon green star, 190×190 tile, 3.8 s cycle */}
      <div
        className="absolute inset-0 stars-twinkle-3"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="190" height="190" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="140" r="3" fill="rgba(0,255,136,0.12)"/><circle cx="60" cy="140" r="1.0" fill="rgba(0,255,136,0.9)"/></svg>')`,
          backgroundSize: '190px 190px',
        }}
      />

      {/* T5: neon green star, 250×250 tile, 4.5 s cycle */}
      <div
        className="absolute inset-0 stars-twinkle-5"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg"><circle cx="90" cy="30" r="2.5" fill="rgba(0,255,136,0.1)"/><circle cx="90" cy="30" r="0.9" fill="rgba(0,255,136,0.85)"/></svg>')`,
          backgroundSize: '250px 250px',
        }}
      />
    </div>
  );
}
