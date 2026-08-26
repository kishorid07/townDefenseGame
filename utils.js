// Generic, stateless helpers used across the game — plain math and color
// functions with no dependency on entities, rendering, or input. Kept as
// bare global functions (not namespaced) since every call site already
// calls them unqualified (dist2(...), hexToRgb(...), etc.).

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

// True if two circles (radius ar/br, centered at a/b) touch or overlap.
// Used anywhere two round entities need a hit/range/pickup check.
function circlesOverlap(ax, ay, ar, bx, by, br) {
  const r = ar + br;
  return dist2(ax, ay, bx, by) <= r * r;
}

// Used by renderer.js to tint particle colors with alpha (see drawParticles).
function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
