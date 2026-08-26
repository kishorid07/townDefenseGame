// Generic, stateless helpers used across the game — plain math and color
// functions with no dependency on entities, rendering, or input. Kept as
// bare global functions (not namespaced) since every call site already
// calls them unqualified (dist2(...), lightenColor(...), etc.).

function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function normalize(dx, dy) {
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: 0, y: 0 };
  return { x: dx / len, y: dy / len };
}

// --- Color helpers (used for shaded fills, hit-flash, etc.) -----------------
function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Mixes a hex color toward white by `amount` (0..1). Used for gradient highlights.
function lightenColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

// Mixes two hex colors by `t` (0 = hexA, 1 = hexB). Used for hit-flash blending.
function blendColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const mix = (i) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
}
