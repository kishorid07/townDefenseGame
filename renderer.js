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

  // A circle filled with a radial gradient (light from upper-left) instead of a flat color.
  function drawShadedCircle(ctx, x, y, radius, color) {
    const grad = ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, radius * 0.1,
      x, y, radius
    );
    grad.addColorStop(0, lightenColor(color, 0.4));
    grad.addColorStop(1, color);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // A square (used for the forge) filled with a diagonal gradient instead of a flat color.
  function drawShadedRect(ctx, x, y, halfSize, color) {
    const grad = ctx.createLinearGradient(x - halfSize, y - halfSize, x + halfSize, y + halfSize);
    grad.addColorStop(0, lightenColor(color, 0.4));
    grad.addColorStop(1, color);
    ctx.beginPath();
    ctx.rect(x - halfSize, y - halfSize, halfSize * 2, halfSize * 2);
    ctx.fillStyle = grad;
    ctx.fill();
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
    const coreColor = core.hitFlashTimer > 0
      ? blendColor('#3498db', '#ffffff', core.hitFlashTimer / 0.15)
      : '#3498db';
    drawShadedCircle(ctx, core.x, core.y, core.radius, coreColor);
    const ok = core.canRepair && affordable(gold, CONFIG.CORE.REPAIR_COST);
    if (core.canRepair) drawRing(ctx, core.x, core.y, core.radius, ok);
    const label = core.canRepair
      ? `Repair: ${CONFIG.CORE.REPAIR_COST}g (+${CONFIG.CORE.REPAIR_AMOUNT}hp)`
      : `Core HP full`;
    drawLabel(ctx, core.x, core.y - core.radius - 12, label, ok || !core.canRepair);
  }

  function drawForge(ctx, forge, gold) {
    drawGroundShadow(ctx, forge.x, forge.y, forge.radius);
    drawShadedRect(ctx, forge.x, forge.y, forge.radius, '#9b59b6');
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
      drawShadedCircle(ctx, spot.x, spot.y, spot.radius, spot.isBuilt ? '#f1c40f' : '#555');
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

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
      drawShadedCircle(ctx, g.x, g.y, g.radius, '#f39c12');
    }
  }

  function drawEnemies(ctx, enemies) {
    for (const e of enemies) {
      drawGroundShadow(ctx, e.x, e.y, e.radius);
      const fillColor = e.hitFlashTimer > 0
        ? blendColor(e.color, '#ffffff', e.hitFlashTimer / 0.08)
        : e.color;
      drawShadedCircle(ctx, e.x, e.y, e.radius, fillColor);
      // hp bar
      const barW = e.radius * 2;
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 8, barW, 3);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 8, barW * Math.max(0, e.hp / e.maxHp), 3);
    }
  }

  function drawProjectiles(ctx, projectiles) {
    for (const p of projectiles) {
      drawShadedCircle(ctx, p.x, p.y, p.radius, '#ecf0f1');
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
    drawShadedCircle(ctx, player.x, player.y, player.radius, '#2ecc71');
  }

  // `world` = { worldCenter, townCore, forge, towerSpots, goldPickups,
  //             enemies, projectiles, particles, player, mouse, gold }
  function render(ctx, canvas, world) {
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
