// Canvas rendering for The Last Village.
// Pure drawing: everything this file needs comes in through render()'s
// `world` argument — nothing here reaches into game.js's internals, so it
// can be exercised (or swapped out) independently of the update loop.
const Renderer = (function () {
  function affordable(gold, cost) {
    return cost !== null && gold >= cost;
  }

  function drawRing(ctx, x, y, radius, ok) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = ok ? '#2ecc71' : '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawLabel(ctx, x, y, text, ok) {
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    const metrics = ctx.measureText(text);
    const paddingX = 8, paddingY = 4, textHeight = 13;
    const w = metrics.width + paddingX * 2;
    const h = textHeight + paddingY * 2;
    roundRectPath(ctx, x - w / 2, y - h + 3, w, h, 6);
    ctx.fillStyle = 'rgba(8, 12, 8, 0.72)';
    ctx.fill();
    ctx.fillStyle = ok ? '#2ecc71' : '#e74c3c';
    ctx.fillText(text, x, y);
  }

  // A soft dark ellipse beneath an entity to ground it visually.
  function drawGroundShadow(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.55, radius * 0.85, radius * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fill();
  }

  // Draws a baked pixel-art sprite (see sprites.js) centered at (x, y),
  // scaled to `radius`. `tint` optionally blends a flat color over just the
  // sprite's own drawn pixels (via 'source-atop'), used for hit-flash.
  function drawSprite(ctx, sprite, x, y, radius, tint) {
    const size = radius * 2;
    ctx.drawImage(sprite, x - radius, y - radius, size, size);
    if (tint && tint.amount > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = tint.amount;
      ctx.fillStyle = tint.color;
      ctx.fillRect(x - radius, y - radius, size, size);
      ctx.restore();
    }
  }

  function drawBackground(ctx, canvas, worldCenter) {
    ctx.fillStyle = '#1e2a1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft vignette so the world doesn't feel like a flat, empty void.
    const vignette = ctx.createRadialGradient(
      worldCenter.x, worldCenter.y, Math.min(canvas.width, canvas.height) * 0.15,
      worldCenter.x, worldCenter.y, Math.max(canvas.width, canvas.height) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawTownCore(ctx, core, gold) {
    drawGroundShadow(ctx, core.x, core.y, core.radius);
    const tint = { color: '#ffffff', amount: core.hitFlashTimer > 0 ? core.hitFlashTimer / 0.15 : 0 };
    drawSprite(ctx, Sprites.core, core.x, core.y, core.radius, tint);
    const ok = core.canRepair && affordable(gold, CONFIG.CORE.REPAIR_COST);
    if (core.canRepair) drawRing(ctx, core.x, core.y, core.radius, ok);
    const label = core.canRepair
      ? `Repair: ${CONFIG.CORE.REPAIR_COST}g (+${CONFIG.CORE.REPAIR_AMOUNT}hp)`
      : `Core HP full`;
    drawLabel(ctx, core.x, core.y - core.radius - 12, label, ok || !core.canRepair);
  }

  function drawForge(ctx, forge, gold) {
    drawGroundShadow(ctx, forge.x, forge.y, forge.radius);
    drawSprite(ctx, Sprites.forge, forge.x, forge.y, forge.radius);
    const cost = forge.cost;
    const ok = affordable(gold, cost);
    if (cost !== null) drawRing(ctx, forge.x, forge.y, forge.radius, ok);
    const label = cost !== null
      ? `Weapon Lv.${forge.level} Upgrade: ${cost}g`
      : `Weapon Lv.${forge.level} MAX`;
    drawLabel(ctx, forge.x, forge.y - forge.radius - 12, label, ok || cost === null);
  }

  function drawTowerSpots(ctx, towerSpots, gold) {
    for (const spot of towerSpots) {
      drawGroundShadow(ctx, spot.x, spot.y, spot.radius);
      const sprite = spot.isBuilt ? Sprites.tower[spot.level - 1] : Sprites.emptySpot;
      drawSprite(ctx, sprite, spot.x, spot.y, spot.radius);

      const cost = spot.cost;
      const ok = affordable(gold, cost);
      if (cost !== null) drawRing(ctx, spot.x, spot.y, spot.radius, ok);
      let label;
      if (spot.level === 0) label = `Build: ${cost}g`;
      else if (spot.isMax) label = `Lv.${spot.level} MAX`;
      else label = `Lv.${spot.level} Upgrade: ${cost}g`;
      drawLabel(ctx, spot.x, spot.y - spot.radius - 12, label, ok || spot.isMax);
    }
  }

  function drawGoldPickups(ctx, goldPickups) {
    for (const g of goldPickups) {
      drawSprite(ctx, Sprites.gold, g.x, g.y, g.radius);
    }
  }

  function drawEnemies(ctx, enemies) {
    for (const e of enemies) {
      drawGroundShadow(ctx, e.x, e.y, e.radius);
      const sprite = e.type === 'brute' ? Sprites.brute : Sprites.runner;
      const tint = { color: '#ffffff', amount: e.hitFlashTimer > 0 ? e.hitFlashTimer / 0.08 : 0 };
      drawSprite(ctx, sprite, e.x, e.y, e.radius, tint);
      // hp bar
      const barW = e.radius * 2;
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 8, barW, 3);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 8, barW * Math.max(0, e.hp / e.maxHp), 3);
    }
  }

  // The bolt sprite points "up" at rest, so it's rotated to match each
  // projectile's actual travel direction.
  function drawProjectiles(ctx, projectiles) {
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
      const size = p.radius * 2;
      ctx.drawImage(Sprites.bolt, -p.radius, -p.radius, size, size);
      ctx.restore();
    }
  }

  function drawParticles(ctx, particles) {
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      const [r, g, b] = hexToRgb(particle.color.startsWith('#') ? particle.color : '#ffffff');
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`;
      ctx.fill();
    }
  }

  function drawPlayer(ctx, player, mouse) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    drawGroundShadow(ctx, player.x, player.y, player.radius);
    drawSprite(ctx, Sprites.player, player.x, player.y, player.radius);
  }

  // `world` = { worldCenter, townCore, forge, towerSpots, goldPickups,
  //             enemies, projectiles, particles, player, mouse, gold }
  function render(ctx, canvas, world) {
    ctx.imageSmoothingEnabled = false; // keep baked pixel sprites crisp when scaled
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas, world.worldCenter);
    drawTownCore(ctx, world.townCore, world.gold);
    drawForge(ctx, world.forge, world.gold);
    drawTowerSpots(ctx, world.towerSpots, world.gold);
    drawGoldPickups(ctx, world.goldPickups);
    drawEnemies(ctx, world.enemies);
    drawProjectiles(ctx, world.projectiles);
    drawParticles(ctx, world.particles);
    drawPlayer(ctx, world.player, world.mouse);
  }

  return { render };
})();
