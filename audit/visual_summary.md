# Visual Summary — The Last Village

Scope: visual quality and presentation only. Gameplay/logic is out of scope and already works well (see the main build notes) — this audit is about how it *looks*.

## 1. Overall visual impression

**Right now it reads as a functional prototype, not a game.** Every on-screen object is a single flat-colored primitive shape (`ctx.arc` / `ctx.rect`) with no outline weight variation, no shading, and no texture. That's the single biggest signal of "placeholder art" to a player's eye — it looks like debug/whiteboxing graphics that never got a pass, even though the mechanics behind them are solid.

**What makes it feel low-end:**
- Every entity is a flat-filled circle or square — player, core, forge, enemies, gold, projectiles, towers all use the exact same rendering technique (solid fill, no gradient, no border shading). Nothing has visual weight or material.
- The background is one solid color (`#1e2a1e`) with zero texture, ground detail, or environmental storytelling. It doesn't read as "a town" at all — it reads as an empty canvas.
- The HUD is plain-text-on-transparent-background in the corner, using the browser's default system font stack with no panel, icon, or visual container. It looks like debug overlay text, not a game HUD.
- There is no feedback juice: no hit flash, no screen shake, no particle burst on kill, no glow on projectiles, no animation easing anywhere. Everything just appears/disappears or moves at constant linear speed. This is the fastest way a player subconsciously clocks a game as "unfinished."
- In-world labels ("Build: 20g", "Repair: 15g") are bare canvas text floating in space with no background chip — they look like debug annotations rather than UI.

**What already looks good / is worth keeping:**
- The color-coded affordability system (green ring + green label when a player can afford an action, red/grey when they can't) is a genuinely good UX idea and a good bone structure — it just needs a visual glow-up, not a redesign.
- The core loop's visual clarity is actually strong: it's easy to tell player vs. enemies vs. buildings apart by color and shape alone. Don't lose that legibility when polishing.
- The aim-line-to-cursor is a nice subtle touch that most MVPs skip.
- Enemy HP bars above their heads are a good, standard readability feature already in place.

**What to improve first:** the background/ground (biggest "empty void" problem), the HUD panel treatment, and adding basic hit/kill feedback (flash + particle burst). These three changes alone would change the game's perceived quality more than anything else, and none of them require new art assets — see `quick_wins.md`.

## 2. Art style

There currently **is no defined art style** — the project uses default "programmer art" (flat geometric primitives), which is appropriate for prototyping but reads as unfinished for anything shown to a real audience. Because everything uses the same shape language (circles) and the same flat-fill technique, nothing is *mismatched* per se — the consistency is accidental but real. The problem isn't clashing styles; it's the total absence of one.

**Recommended direction:** lean into a **clean vector/flat-design style with depth cues**, rather than jumping to pixel art or hand-drawn sprites (both would require real asset production). Flat design polished with soft shadows, subtle gradients, and consistent stroke outlines can look genuinely premium (think modern mobile tower-defense UI) without needing an artist — it's all achievable with more sophisticated `ctx` drawing (gradients, shadow blur, layered shapes) rather than new image assets. This is the realistic path for an MVP: upgrade the *rendering technique*, not the *asset pipeline*.

## 3. Color and lighting

- The current palette (background `#1e2a1e`, player `#2ecc71`, enemies `#e74c3c`/`#d35400`, core `#3498db`, forge `#9b59b6`, gold `#f39c12`) is actually a **reasonable, distinguishable hue set** — this is a strength, not a weakness. Contrast between entities and background is adequate for gameplay legibility.
- What's missing is **depth**: everything sits at the exact same visual "elevation" — no drop shadows under entities, no glow on the core/projectiles, no gradient fills to suggest volume. Flat fills on a flat background is what reads as cheap, not the hue choices themselves.
- There is no lighting model at all — no ambient vignette, no light source implied anywhere, no glow around the town core (which is supposed to feel like the thing worth protecting — right now it looks identical in "weight" to a tower spot).
- Important elements (core, player) are not visually separated from background beyond color — a soft outer glow or ground shadow under the core and player would immediately make them read as "the important things," and would also make the empty background feel less like a void.

## 4. UI quality

- HUD (`townDefenseGame/index.html:9-14`, styled in `style.css:22-37`) is unstyled text stacked in the corner — no background panel, no icons, default system sans-serif font, all four stats the same visual weight. This is the weakest part of the presentation relative to how cheap it is to fix.
- In-world labels (drawn in `game.js`'s `drawLabel`) are bare canvas `fillText` calls with no backing shape — floating text with no container reads as debug output.
- The win/lose overlay (`showOverlay` in `game.js`) is functional but plain: black semi-transparent scrim, default heading font, one flat green button. It works but has zero personality or drama for a "win/lose" moment, which is usually the biggest emotional beat in a session.
- Fonts are 100% default system stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) everywhere, with no distinct display font for numbers/headings vs. body text — everything has identical typographic weight and personality.
- Spacing in the HUD is a simple `flex` column with a small `gap` — acceptable but has no padding/container, so it has no visual boundary from the game world behind it.

## 5. Animation and visual feedback

This is the **highest-leverage category** for perceived polish relative to effort. Currently:
- Enemies vanish instantly on death — no death animation, no particle burst, no flash.
- The player and towers have no muzzle flash or recoil when firing.
- Taking core damage has no screen feedback (no flash, no shake) — only a number in the corner changes.
- Gold pickup has no "+2" floating text or pop/scale animation — it just increments a number.
- Upgrades (tower level-up, forge level-up) have no celebratory feedback — the label text just changes.
- Movement, enemy pathing, and projectile motion are all linear/constant-speed with no easing, which reads as robotic rather than physical.

Every one of these is a small, self-contained addition (a few lines of `ctx` drawing or a CSS keyframe) and collectively they are what separates "tech demo" from "game that feels good to play."

## 6. Backgrounds and environment

This is the single biggest visual gap. The world is currently `ctx.fillStyle = '#1e2a1e'; ctx.fillRect(...)` — one flat rectangle for the entire play area (`game.js`, top of `render()`). There is:
- No ground texture or tiling pattern (dirt/grass distinction, town square paving, etc.)
- No sense of "town" at all beyond the blue core circle — no paths connecting buildings, no decorative structures, no fences/walls
- No depth cues (no vignette darkening toward screen edges, no parallax, no shadows grounding objects to the floor)
- No indication of "outside the town" vs. "inside the town" even though enemies spawn from "outside" per the game design — visually it's all the same undifferentiated green

This single fillRect is doing a lot of damage to the game's perceived production value, and it's also the cheapest thing to meaningfully improve (a subtle radial gradient + a procedural ground pattern would go a long way with no new assets).

## Related files
See [visual_problems.md](visual_problems.md), [quick_wins.md](quick_wins.md), [high_impact_upgrades.md](high_impact_upgrades.md), and [visual_priority_plan.md](visual_priority_plan.md) for actionable, prioritized detail.
