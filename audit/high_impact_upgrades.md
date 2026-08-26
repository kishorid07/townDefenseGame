# High-Impact Upgrades — The Last Village

Changes that take **longer than a quick win** (roughly a few hours to a day each) but produce a step-change in perceived production value. None of these require hiring an artist or building an asset pipeline — all are achievable with more sophisticated `ctx` drawing code, layered canvas techniques, or CSS, matching the project's current all-code-no-assets approach.

---

### 1. Build a real environment layer for the town
**Effort:** medium-high (a few hours).
Right now the "town" is a blue circle on an empty background. A genuinely high-impact upgrade is a static (or lightly animated) environment layer drawn once at load and cached to an offscreen canvas:
- A visually distinct "inside town" ground area (e.g., a soft-edged lighter/paved patch) versus "wilderness" beyond it, matching the game's own fiction (enemies come from "outside the town").
- Simple procedural props around the fixed layout — a few huts/crates/fences drawn as layered rectangles+triangles near the tower spots and forge, so those locations feel like *places* instead of bare geometric markers.
- A subtle path or worn-ground texture connecting the core to each tower spot/forge, reinforcing the town's layout.
This is the single biggest lever for making the game feel like "a town" rather than "shapes on a canvas," and it can be built entirely from primitive canvas shapes layered cleverly (no image assets required) — draw it once to an offscreen canvas and blit it each frame for free performance.

### 2. Build a lightweight, reusable particle/VFX system
**Effort:** medium (half a day).
Rather than one-off effects per event (quick-wins approach), invest in a small generic `Particle`/`Effect` manager: a pool of simple objects with position, velocity, color, size, fade-curve, and lifetime, updated and drawn generically. Once this exists, adding polish to *any* new event (hit, kill, upgrade, level-up, low-HP warning, win/lose) becomes a 2-line call instead of new bespoke code each time. This is the infrastructure investment that makes all the "juice" quick-wins compound rather than feeling like scattered patches.

### 3. Redesign the HUD as a proper game-UI composition
**Effort:** medium (a few hours).
Beyond the quick-win panel treatment, a genuinely premium HUD would:
- Use icon glyphs (simple drawn/SVG icons for gold coin, heart/shield for core HP, clock for timer, sword for weapon level) instead of plain text labels, so the HUD is scannable at a glance without reading words.
- Represent core HP as a proper segmented/gradient health bar rather than a `"HP: 208/260"` text string — bars communicate proportion instantly, numbers require reading.
- Add a subtle low-HP warning state (pulsing red border/icon when core HP drops below ~25%) to reinforce urgency visually, not just numerically.
This turns the HUD from "debug stats" into "a designed instrument panel," which is one of the fastest tells of a professional game vs. a prototype.

### 4. Add a dynamic lighting/atmosphere pass tied to game state
**Effort:** medium (a few hours).
Layer in a screen-space effect that responds to what's happening rather than being purely decorative:
- Subtle overall color grade shift as difficulty ramps over the 10 minutes (e.g., background very gradually shifts cooler/darker or gains a faint red tint as danger increases), giving players a subconscious sense of rising stakes that matches the design's explicit difficulty curve.
- A soft warm glow radius around the core that shrinks/dims as its HP drops, and brightens on repair — making the core's status legible from anywhere on screen, not just the HUD text.
This connects visual atmosphere directly to game feel/tension, which reads as much more intentional/high-end than static art.

### 5. Give each entity type a distinct silhouette, not just a distinct color
**Effort:** medium (a few hours, no new art pipeline).
Currently differentiation is color-only (every entity is a circle, forge is a rounded square). A meaningfully higher-end pass would give each entity type a distinct *shape language* built from layered primitives — e.g., the runner enemy as a small sharp/angular triangle-ish silhouette (fast, aggressive read), the brute as a larger blocky/hexagonal silhouette (slow, tanky read), the player as a simple humanoid silhouette (circle head + small directional indicator for aim), towers as a layered base+turret composition that visibly changes silhouette per upgrade level (not just color/ring). Shape language communicates "fast vs. strong" and "upgraded vs. base" at a glance, which is both a readability and a polish win, and is entirely achievable with compound canvas path drawing — still zero external art assets.

### 6. Animate state transitions instead of instant snaps
**Effort:** medium (a few hours across several places).
Building on the quick-win easing tip, go further: tower build/upgrade should have a brief "grow in" scale animation instead of the level just changing instantly; the forge upgrade should have a brief flash/glow pulse at the moment of upgrade; the core repair should have a visible "heal" ripple. Implemented via small per-entity animation-state timers (similar pattern to the hit-flash quick win, generalized). This is what makes moment-to-moment upgrades feel *earned* rather than just a number changing.

### 7. Add a proper typographic system with a real icon/number font pairing
**Effort:** low-medium (a couple hours), high visual return.
Beyond swapping one font (quick win), establish an actual type scale: one display font for big numbers/headings (timer, overlay heading), one clean body font for labels/hints, consistent sizes/weights across HUD/labels/overlay, and consistent use of tabular/monospace figures for the countdown timer so it doesn't visually jitter as digits change width. This is cheap relative to its payoff — typography consistency is one of the most reliable "looks professional" signals.

---

## Why these are separated from quick wins
The quick wins in `quick_wins.md` are all isolated, drop-in changes to existing code paths. These six are **systems-level investments** (a particle manager, an environment layer, a HUD redesign, etc.) — they take longer because they touch more of the codebase or require new small subsystems, but they compound: once built, they make every future visual addition cheaper and more consistent, rather than being one-off patches.
