# Visual Priority Plan — The Last Village

A condensed, ranked action plan pulling from `visual_problems.md`, `quick_wins.md`, and `high_impact_upgrades.md`.

## Top 5 visual problems
1. **Flat, textureless background** — the entire play area is one solid fill color; the world doesn't read as "a town."
2. **Every entity is a flat, unshaded shape** — no gradients, shadows, or highlights anywhere; everything looks like the same material.
3. **Zero hit/kill/damage feedback** — enemies vanish instantly, the core takes damage silently, shots have no impact — combat feels inert.
4. **HUD looks like debug text** — no panel, no icons, default system font, no visual hierarchy, visible 100% of the time.
5. **In-world cost/upgrade labels are bare floating text** — no background chip, so the core click-to-upgrade interaction looks unfinished.

## Top 5 quick wins (do these first — all under an hour, no new assets)
1. **Put the HUD in a real dark panel** with padding/border-radius (`style.css`, `#hud`) — cheapest, highest-visibility fix in the whole audit.
2. **Add a radial gradient fill to every entity** instead of flat color (`game.js` `render()`) — instantly gives every shape volume.
3. **Add a subtle vignette over the background** (one radial gradient overlay after the base fill) — kills the "empty void" feeling in ~10 minutes of work.
4. **Give in-world labels a background chip** (rounded rect behind the text in `drawLabel()`) — turns floating debug text into real UI.
5. **Add hit-flash + a small particle burst on enemy death** — the single biggest "feels alive" upgrade for the least code, reusing shapes already in the codebase.

## Top 5 high-impact upgrades (bigger investment, biggest step-change)
1. **Build a real environment layer** (town ground area, simple props, path connecting core/towers/forge) drawn once to an offscreen canvas — the biggest lever for making it feel like a place, not a canvas.
2. **Build a reusable particle/VFX system** — infrastructure that makes every future juice addition (hit, upgrade, low-HP warning, win/lose) a two-line call instead of one-off code.
3. **Redesign the HUD with icons + a proportional core-HP bar** instead of plain "HP: 208/260" text — bars read instantly, numbers require reading.
4. **Give each entity type a distinct silhouette**, not just a distinct color (angular fast enemy, blocky tanky enemy, layered tower base+turret that visibly grows with upgrades) — reads as intentional design rather than palette-swapped circles.
5. **Tie atmosphere to game state** (core glow dims as HP drops, subtle color grade shift as the 10-minute timer escalates) — connects visuals directly to tension, which reads as far more premium than static decoration.

## What to change first
Start with the **quick wins list, in the order given** — specifically panel-ify the HUD, add gradients to entities, and add the background vignette. These three alone are achievable in under two hours combined and will visibly change the game's perceived quality more than anything else on this list, because they touch the things on screen at all times (background, HUD, every entity). Follow immediately with the hit-flash + death particle burst, since combat feedback is the core moment-to-moment loop and currently has none.

## What can wait
The systems-level high-impact upgrades — the full environment layer, the reusable particle manager, the HUD icon/bar redesign, distinct entity silhouettes, and state-tied atmosphere — are all worth doing, but they're bigger investments that make the most sense *after* the quick wins have already lifted the baseline. Doing them first would mean building bigger systems on top of the current flat/plain rendering, forcing rework once the quick-win visual language (gradients, shadows, panels) is established. Do quick wins → re-evaluate → then invest in the high-impact list roughly in the order given above (environment layer and particle system first, since the HUD/silhouette/atmosphere upgrades build naturally on top of those two).
