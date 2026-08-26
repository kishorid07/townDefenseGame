# Quick Wins — The Last Village

Changes that take **under an hour each**, need **no new art assets** (pure CSS/canvas-drawing changes), and meaningfully improve perceived polish. Ordered by impact-per-effort.

---

### 1. Give every entity a radial gradient fill instead of a flat color
**Effort:** ~20 min. **Where:** every `ctx.fill()` call in `game.js` `render()`.
Replace `ctx.fillStyle = solidColor` with a small radial gradient from a lighter tint at the top-left to the base color at the edge (`ctx.createRadialGradient`), for the player, enemies, gold, core, and tower spots. This single change makes every shape look like it has volume/lighting instead of being a flat sticker, and it's a pure drop-in replacement of one line per entity type.

### 2. Add a soft drop shadow under every entity
**Effort:** ~15 min. **Where:** same draw calls in `render()`.
Before drawing each circle, draw a slightly-offset darker/blurred ellipse beneath it (or use `ctx.shadowColor` / `ctx.shadowBlur` before filling). This alone grounds every object to the "floor" and immediately reduces the "floating cutout" look.

### 3. Put the HUD in a real panel
**Effort:** ~20 min. **Where:** `style.css` `#hud` block.
Give `#hud` a semi-transparent dark background (`rgba(0,0,0,0.5)`), `border-radius`, `padding`, and a subtle `border` or inner highlight. Optionally add a thin colored left-border-per-stat (gold = yellow, HP = red/green, timer = white) for quick-scan color coding. This is the single cheapest, highest-visibility fix in the whole audit — the HUD is on screen 100% of the time.

### 4. Give in-world labels a background chip
**Effort:** ~20 min. **Where:** `drawLabel()` in `game.js`.
Before drawing the label text, draw a small rounded rectangle behind it (`ctx.roundRect` if available, or a plain `fillRect` with `globalAlpha`) in dark semi-transparent black, sized to the text width (`ctx.measureText`). Turns floating debug-looking text into an actual UI chip.

### 5. Add a subtle vignette / radial darkening to the background
**Effort:** ~10 min. **Where:** end of the background-fill section in `render()`.
After the flat background fill, draw one large radial gradient from transparent (center) to dark/black (edges) over the whole canvas. This single overlay adds instant atmosphere and depth with almost no code, and helps hide the "flat empty void" feeling without needing any new ground art.

### 6. Add a subtle ground pattern instead of a solid fill
**Effort:** ~30 min. **Where:** background fill in `render()`.
Draw a simple repeating grid of very faint lines or dots (a "town square paving" or "grass texture" implication) using a cheap loop or a pre-rendered offscreen canvas pattern (`ctx.createPattern`). Even a barely-visible grid instantly reads as "a ground plane" rather than "an empty canvas."

### 7. Flash entities white on hit
**Effort:** ~20 min. **Where:** `Enemy` class in `entities.js` + render loop.
Add a `hitFlashTimer` field to `Enemy`, set it to ~0.08s whenever it takes damage, and in `render()` swap the fill color to white (or blend toward white) while the timer is active. Classic, cheap "juice" that makes combat feel responsive immediately.

### 8. Add a tiny particle burst on enemy death and tower/forge upgrade
**Effort:** ~30–40 min. **Where:** new lightweight `Particle` entity in `entities.js`, spawned in the death/upgrade code paths in `game.js`.
4–8 small colored circles that fly outward and fade over ~0.3s. This is the single most impactful "feels premium" trick for very little code, and reuses the same primitive-shape drawing style already in the codebase (no new art needed).

### 9. Add a floating "+Ng" text popup on gold pickup
**Effort:** ~20 min. **Where:** gold pickup logic in `game.js` `update()`.
A short-lived text object that spawns at the pickup location, drifts upward, and fades out over ~0.6s. Cheap dopamine hit that makes the economy loop feel more rewarding.

### 10. Add a screen flash / brief red vignette pulse when the core takes damage
**Effort:** ~15 min. **Where:** core-damage branch in `Enemy.update()` (or a shared "coreHitFlash" timer read by `render()`).
A quick red radial pulse from the screen edges (or just around the core) whenever the core is hit gives instant, unmissable feedback that something bad is happening — currently the only signal is a number changing in the corner.

### 11. Upgrade the win/lose overlay presentation
**Effort:** ~20 min. **Where:** `style.css` `#overlay` block + `showOverlay()` in `game.js`.
Add a CSS `@keyframes` fade/scale-in animation for the overlay panel, a colored glow behind the heading (green glow for win, red for lose), and a bit more visual separation (card-style panel with padding/border-radius instead of bare centered text). Makes the single biggest emotional beat of a session feel like an actual result screen.

### 12. Add a pulsing glow to the town core
**Effort:** ~15 min. **Where:** core rendering in `game.js`.
A slow sine-wave-driven `ctx.shadowBlur`/gradient pulse around the core makes it read immediately as "the important thing to protect" and adds free ambient motion to an otherwise static scene.

### 13. Swap the default system font for a distinct, still-web-safe display font on numbers/headings
**Effort:** ~10 min. **Where:** `style.css`.
Load a single Google Font (e.g., a rounded/geometric sans like "Baloo 2" or a monospace-ish "Space Mono" for numbers) via `@import` or `<link>`, and apply it to the HUD numbers and overlay heading only, keeping body text on system fonts. Cheap, immediate typographic personality boost.

### 14. Ease enemy/projectile motion very slightly instead of pure linear
**Effort:** ~15 min. **Where:** `Enemy.update()` transition into "attacking" state in `entities.js`.
Instead of enemies snapping instantly from moving to fully-stopped when entering attack range, lerp their speed down over ~0.15s. Tiny change, removes a lot of the "robotic" feel.

### 15. Add a directional muzzle-flash dot at the player/tower firing point
**Effort:** ~10 min. **Where:** `fireProjectile()` in `game.js` and `TowerSpot.update()` in `entities.js`.
A single bright short-lived circle/line at the origin point when a shot fires (reuse the particle system from #8). Makes shooting feel like it has recoil/impact even without new art.
