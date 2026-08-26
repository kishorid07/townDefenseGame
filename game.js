// Main loop, input, spawning/difficulty ramp, rendering, win/lose, reset.
(function () {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const hudGold = document.getElementById('hud-gold');
  const hudHp = document.getElementById('hud-hp');
  const hudTimer = document.getElementById('hud-timer');
  const hudWeapon = document.getElementById('hud-weapon');
  const overlayEl = document.getElementById('overlay');
  const hintEl = document.getElementById('hint');

  let worldCenter = { x: 0, y: 0 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    worldCenter = { x: canvas.width / 2, y: canvas.height / 2 };
  }

  // --- Mutable game state -----------------------------------------------
  let gameState, player, townCore, forge, towerSpots, enemies, projectiles, goldPickups, particles;
  let spawnTimer;

  // --- VFX helpers ---------------------------------------------------------------
  function spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        color, 2 + Math.random() * 2, 0.35 + Math.random() * 0.2
      ));
    }
  }

  function layoutTownObjects() {
    // Fixed diamond of tower spots around the core, forge just off to one side.
    const d = 180; // distance from core center to each tower spot
    towerSpots = [
      new TowerSpot(worldCenter.x, worldCenter.y - d),       // top
      new TowerSpot(worldCenter.x + d, worldCenter.y),       // right
      new TowerSpot(worldCenter.x, worldCenter.y + d),       // bottom
      new TowerSpot(worldCenter.x - d, worldCenter.y),       // left
    ];
    forge = new Forge(worldCenter.x - d * 0.55, worldCenter.y - d * 0.55);
  }

  function resetGame() {
    resize();
    gameState = {
      phase: 'playing', // 'playing' | 'won' | 'lost'
      elapsed: 0,
      gold: CONFIG.START_GOLD,
      paused: false,
    };
    player = new Player(worldCenter.x, worldCenter.y);
    townCore = new TownCore(worldCenter.x, worldCenter.y);
    layoutTownObjects();
    enemies = [];
    projectiles = [];
    goldPickups = [];
    particles = [];
    spawnTimer = CONFIG.SPAWN.START_INTERVAL;
    overlayEl.style.display = 'none';
  }

  // --- Input ---------------------------------------------------------------
  // Raw key/mouse tracking and DOM event wiring live in input.js (Input);
  // here we only decide what a left-click *means* for the game.
  function findClickedWorldObject(cx, cy) {
    // Fixed priority order: core, forge, then tower spots.
    if (dist2(cx, cy, townCore.x, townCore.y) <= townCore.radius * townCore.radius) return townCore;
    if (dist2(cx, cy, forge.x, forge.y) <= forge.radius * forge.radius) return forge;
    for (const spot of towerSpots) {
      if (dist2(cx, cy, spot.x, spot.y) <= spot.radius * spot.radius) return spot;
    }
    return null;
  }

  function fireProjectile(cx, cy) {
    if (!player.canFire()) return;
    projectiles.push(new Projectile(
      player.x, player.y,
      cx - player.x, cy - player.y,
      CONFIG.PLAYER.PROJECTILE_SPEED, player.damage,
      CONFIG.PLAYER.PROJECTILE_TTL, CONFIG.PLAYER.PROJECTILE_RADIUS, 'player'
    ));
    player.timeSinceLastShot = 0;
  }

  Input.init(canvas, {
    onLeftClick(cx, cy) {
      if (gameState.phase !== 'playing') return;
      const worldObject = findClickedWorldObject(cx, cy);
      if (worldObject) {
        worldObject.tryInteract({ gameState, player });
      } else {
        fireProjectile(cx, cy);
      }
    },
  });

  window.addEventListener('resize', () => {
    // Keep town objects anchored relative to the (possibly new) world center.
    const oldCenter = worldCenter;
    resize();
    const dx = worldCenter.x - oldCenter.x;
    const dy = worldCenter.y - oldCenter.y;
    player.x += dx; player.y += dy;
    townCore.x += dx; townCore.y += dy;
    forge.x += dx; forge.y += dy;
    for (const spot of towerSpots) { spot.x += dx; spot.y += dy; }
    for (const e of enemies) { e.x += dx; e.y += dy; }
  });

  // --- Difficulty ramp -------------------------------------------------------
  function progress(t) {
    return Math.min(t / CONFIG.SESSION_DURATION, 1);
  }

  function currentSpawnInterval(t) {
    const p = progress(t);
    return CONFIG.SPAWN.START_INTERVAL - p * (CONFIG.SPAWN.START_INTERVAL - CONFIG.SPAWN.MIN_INTERVAL);
  }

  function pickEnemyType(t) {
    const p = progress(t);
    const bruteChance = CONFIG.DIFFICULTY.BRUTE_CHANCE_START +
      p * (CONFIG.DIFFICULTY.BRUTE_CHANCE_END - CONFIG.DIFFICULTY.BRUTE_CHANCE_START);
    return Math.random() < bruteChance ? 'brute' : 'runner';
  }

  function scaledStats(base, t) {
    const p = progress(t);
    const mult = 1 + CONFIG.DIFFICULTY.STAT_MULT_END * p;
    return {
      hp: base.hp * mult,
      damage: base.damage * mult,
      speed: base.speed,
      radius: base.radius,
      goldValue: base.goldValue,
      color: base.color,
    };
  }

  function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const spawnRadius = Math.max(canvas.width, canvas.height) / 2 + CONFIG.SPAWN.MARGIN;
    const x = worldCenter.x + Math.cos(angle) * spawnRadius;
    const y = worldCenter.y + Math.sin(angle) * spawnRadius;
    const type = pickEnemyType(gameState.elapsed);
    const stats = scaledStats(CONFIG.ENEMY_TYPES[type], gameState.elapsed);
    enemies.push(new Enemy(x, y, type, stats));
  }

  // --- Update ---------------------------------------------------------------
  function update(dt) {
    gameState.elapsed += dt;
    player.timeSinceLastShot += dt;

    // Player movement
    const axis = Input.moveAxis();
    if (axis.x !== 0 || axis.y !== 0) {
      const dir = normalize(axis.x, axis.y);
      player.x += dir.x * player.speed * dt;
      player.y += dir.y * player.speed * dt;
    }

    // Spawning
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = currentSpawnInterval(gameState.elapsed);
    }

    // Enemies
    for (const e of enemies) e.update(dt, townCore);

    // Towers
    for (const spot of towerSpots) spot.update(dt, enemies, projectiles);

    // Projectiles
    for (const p of projectiles) p.update(dt);

    // Particles (VFX only, no gameplay effect)
    for (const particle of particles) particle.update(dt);

    // Core hit-flash decay
    if (townCore.hitFlashTimer > 0) townCore.hitFlashTimer = Math.max(0, townCore.hitFlashTimer - dt);

    // Projectile vs enemy collisions
    for (const p of projectiles) {
      if (p._dead) continue;
      for (const e of enemies) {
        if (e._dead) continue;
        const rangeSum = p.radius + e.radius;
        if (dist2(p.x, p.y, e.x, e.y) <= rangeSum * rangeSum) {
          e.hp -= p.damage;
          e.hitFlashTimer = 0.08;
          p._dead = true;
          if (e.hp <= 0) {
            e._dead = true;
            spawnBurst(e.x, e.y, e.color, 8);
            goldPickups.push(new GoldPickup(e.x, e.y, e.goldValue));
          }
          break;
        }
      }
    }

    // Gold auto-collection
    for (const g of goldPickups) {
      const rangeSum = player.radius + g.radius + CONFIG.PICKUP_RANGE;
      if (dist2(player.x, player.y, g.x, g.y) <= rangeSum * rangeSum) {
        gameState.gold += g.value;
        g._dead = true;
      }
    }

    // Cleanup dead/expired entities
    enemies = enemies.filter((e) => !e._dead && e.hp > 0);
    projectiles = projectiles.filter((p) => !p._dead && p.ttl > 0);
    goldPickups = goldPickups.filter((g) => !g._dead);
    particles = particles.filter((particle) => particle.life > 0);

    // Win/lose check
    if (townCore.hp <= 0) {
      gameState.phase = 'lost';
      gameState.paused = true;
      showOverlay(false);
    } else if (gameState.elapsed >= CONFIG.SESSION_DURATION) {
      gameState.phase = 'won';
      gameState.paused = true;
      showOverlay(true);
    }
  }

  // --- Rendering ---------------------------------------------------------------
  // Canvas drawing itself lives in renderer.js (Renderer.render) — this just
  // gathers the current world state and hands it over, then updates the HUD
  // (plain DOM text, not canvas, so it stays separate from Renderer).
  function render() {
    Renderer.render(ctx, canvas, {
      worldCenter, townCore, forge, towerSpots, goldPickups,
      enemies, projectiles, particles, player, mouse: Input.mouse,
      gold: gameState.gold,
    });

    hudGold.textContent = `Gold: ${gameState.gold}`;
    hudHp.textContent = `Core HP: ${Math.ceil(townCore.hp)}/${townCore.maxHp}`;
    const remaining = Math.max(0, CONFIG.SESSION_DURATION - gameState.elapsed);
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(Math.floor(remaining % 60)).padStart(2, '0');
    hudTimer.textContent = `${mm}:${ss}`;
    hudWeapon.textContent = `Weapon Lv.${player.weaponLevel}`;
  }

  function showOverlay(won) {
    overlayEl.innerHTML = `
      <h1>${won ? 'Village Survived!' : 'The Village Has Fallen'}</h1>
      <p>Survived ${Math.floor(gameState.elapsed)}s</p>
      <button id="restart-btn">Restart</button>
    `;
    overlayEl.style.display = 'flex';
    document.getElementById('restart-btn').addEventListener('click', resetGame);
  }

  // --- Onboarding hint ---------------------------------------------------------------
  function setupHint() {
    hintEl.style.display = 'block';
    const fadeOut = () => {
      hintEl.classList.add('fade-out');
      setTimeout(() => { hintEl.style.display = 'none'; }, 600);
    };
    setTimeout(fadeOut, 6000);
    hintEl.addEventListener('click', fadeOut, { once: true });
  }

  // --- Main loop ---------------------------------------------------------------
  let lastTime = 0;
  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    if (!gameState.paused) update(dt);
    render();
    requestAnimationFrame(loop);
  }

  resetGame();
  setupHint();
  requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(loop); });
})();
