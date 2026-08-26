# Visual Problems — The Last Village

Concrete, specific issues found, with file references. Ordered roughly by visual impact.

---

### 1. Flat, textureless background makes the world feel empty and unfinished
**Where:** `game.js` `render()` — `ctx.fillStyle = '#1e2a1e'; ctx.fillRect(0, 0, canvas.width, canvas.height);`
**Problem:** The entire play area is one solid color with no ground texture, pattern, or environmental detail. There's no visual distinction between "inside the town" and "the wilderness enemies come from." This is the #1 thing making the game look like a prototype rather than a finished product.
**Impact:** High — it's the largest visual element on screen at all times.

### 2. Every entity is a flat, unshaded primitive shape
**Where:** All draw calls in `game.js` `render()` (core, forge, tower spots, enemies, player, projectiles, gold) and the entity color constants in `config.js`.
**Problem:** Every object is `ctx.arc`/`ctx.rect` filled with one solid color and nothing else — no gradient, no outline shading, no highlight, no shadow. This flattens everything to the same visual "material" and is the classic tell of programmer-art placeholder graphics.
**Impact:** High — affects literally everything on screen simultaneously.

### 3. No hit/kill/damage feedback anywhere
**Where:** Collision handling in `game.js` `update()` (projectile-vs-enemy loop) and the core damage logic in `entities.js` `Enemy.update()`.
**Problem:** Enemies disappear instantly with no death effect; the core takes damage with no screen response; the player's shots produce no muzzle flash or impact spark. Combat currently has zero juice.
**Impact:** High — this is the core moment-to-moment loop (shoot → kill → loot) and it currently feels inert.

### 4. HUD looks like debug text, not a game UI
**Where:** `index.html:9-14` (`#hud` block), `style.css:22-37`.
**Problem:** Plain stacked text, default system font, no background panel, no icons, no visual hierarchy between gold/HP/timer/weapon level. It looks like a stats overlay a developer left on, not a designed HUD.
**Impact:** High — the HUD is visible 100% of the time during play, so its cheapness is constantly reinforced.

### 5. In-world cost/level labels are bare floating text
**Where:** `drawLabel()` in `game.js`.
**Problem:** `ctx.fillText` with a color, no background chip/pill, no border. Floating colored text with nothing behind it reads as a debug annotation rather than a UI element the player is meant to trust and click.
**Impact:** Medium-high — these labels are the primary way the player understands the core interaction loop (what does clicking this cost?), so their cheapness undermines trust in the whole upgrade system.

### 6. No lighting, glow, or depth separation for important objects
**Where:** Town core and player rendering in `game.js` `render()`.
**Problem:** The town core — the object the entire game is about protecting — is visually no more prominent than a tower spot. No glow, no pulsing, no shadow grounding it to the world. Same for the player character.
**Impact:** Medium — hurts read-at-a-glance clarity of "what matters most" and generally flattens visual hierarchy.

### 7. Constant-speed, non-eased motion everywhere
**Where:** `Player` movement, `Enemy.update()`, `Projectile.update()` in `entities.js`.
**Problem:** All movement is pure linear velocity with instant start/stop — no acceleration/deceleration, no squash/stretch, no easing on state transitions (e.g., enemy stopping to attack snaps instantly from moving to stationary).
**Impact:** Medium — makes everything feel mechanical/robotic rather than alive.

### 8. Overlay screens (win/lose) are visually flat and low-drama
**Where:** `showOverlay()` in `game.js`, `#overlay` styles in `style.css`.
**Problem:** A plain black scrim, default heading font, one flat green button. No entrance animation, no distinct win-vs-lose visual treatment beyond text/color of the heading, no particle/confetti or screen-shake moment to match the significance of a run ending.
**Impact:** Medium — this is the emotional climax of every session and currently has no "wow" moment either way.

### 9. Typography has no hierarchy or personality
**Where:** `style.css` (font-family declared once, reused everywhere), canvas label font in `game.js` (`'13px sans-serif'`).
**Problem:** One default system font stack used for HUD, hint text, overlay heading, overlay body, and in-world labels alike. No distinct display font for numbers/headings, no weight/size hierarchy beyond the timer being slightly larger.
**Impact:** Medium — typography is one of the cheapest ways to look "designed," and currently there's none.

### 10. No ambient atmosphere or screen-level mood
**Where:** Global rendering — no vignette, no particles, no subtle background motion (e.g., drifting embers/dust), no day/night or tension shift as difficulty ramps.
**Problem:** The screen looks and feels identical whether it's second 1 or second 590 of a 10-minute session, even though the design explicitly wants tension to escalate. There's no visual signal of mounting danger.
**Impact:** Medium-low — a "nice to have" but a well-known trick for perceived polish and pacing.

### 11. Onboarding hint box and cursor styling are inconsistent with nothing else
**Where:** `#hint` styles in `style.css`, `cursor: crosshair` on `#game-canvas`.
**Problem:** The hint box is the only UI element with a background panel + border-radius + padding — meaning it's actually the *most* polished-looking element in the whole game by accident, which makes everything else look worse by comparison once you notice the mismatch.
**Impact:** Low, but easy to fix — worth using the hint box's treatment (dark panel, rounded corners, padding) as the *template* for the HUD and labels rather than a one-off.
