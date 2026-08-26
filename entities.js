// Entity classes for The Last Village.
// Plain objects, no ECS/physics engine — proximity checks use squared distance.
// Generic math/color helpers (dist2, normalize, hexToRgb, ...) live in utils.js.

// Shared by TowerSpot and Forge: both are "spend gold to raise `.level` by one"
// objects that expose a `.cost` getter (null when maxed out). Pulling the
// spend-and-level-up step into one place keeps that rule defined exactly once.
function trySpendGoldToLevelUp(entity, gameState) {
  const cost = entity.cost;
  if (cost === null) return false; // maxed out
  if (gameState.gold < cost) return false; // can't afford
  gameState.gold -= cost;
  entity.level += 1;
  return true;
}

// --- Player ---------------------------------------------------------------
// The player is immortal by design: it is purely a mobile shooter avatar with
// no HP. Enemies ignore the player entirely and path toward the town core —
// the core's HP is the only fail condition in this MVP.
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.PLAYER.RADIUS;
    this.speed = CONFIG.PLAYER.SPEED;
    this.damage = CONFIG.PLAYER.BASE_DAMAGE;
    this.fireRate = CONFIG.PLAYER.BASE_FIRE_RATE;
    this.weaponLevel = 1;
    this.timeSinceLastShot = 999;
  }

  canFire() {
    return this.timeSinceLastShot >= 1 / this.fireRate;
  }
}

// --- Enemy ------------------------------------------------------------------
class Enemy {
  constructor(x, y, type, stats) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.radius = stats.radius;
    this.goldValue = stats.goldValue;
    this.color = stats.color;
    this.attackCooldown = 0;
    this.hitFlashTimer = 0; // >0 while flashing white from a recent hit
  }

  update(dt, core) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);

    const rangeSum = this.radius + core.radius + 4;
    if (dist2(this.x, this.y, core.x, core.y) > rangeSum * rangeSum) {
      const dir = normalize(core.x - this.x, core.y - this.y);
      this.x += dir.x * this.speed * dt;
      this.y += dir.y * this.speed * dt;
    } else {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0) {
        core.hp = Math.max(0, core.hp - this.damage * CONFIG.CORE.ATTACK_INTERVAL);
        this.attackCooldown = CONFIG.CORE.ATTACK_INTERVAL;
        core.hitFlashTimer = 0.15;
      }
    }
  }
}

// --- Projectile ---------------------------------------------------------------
class Projectile {
  constructor(x, y, dx, dy, speed, damage, ttl, radius, owner) {
    const dir = normalize(dx, dy);
    this.x = x;
    this.y = y;
    this.vx = dir.x * speed;
    this.vy = dir.y * speed;
    this.damage = damage;
    this.radius = radius;
    this.ttl = ttl;
    this.owner = owner; // 'player' | 'tower' — unused for now, kept for clarity
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
  }
}

// --- Gold pickup ---------------------------------------------------------------
class GoldPickup {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.radius = 6;
  }
}

// --- Tower spot / tower (single class, level 0 = empty spot) ---------------
class TowerSpot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.TOWER.RADIUS;
    this.level = 0; // 0 = empty, 1..MAX_LEVEL = built/upgraded
    this.timeSinceLastShot = 999;
  }

  get isBuilt() {
    return this.level >= 1;
  }

  get isMax() {
    return this.level >= CONFIG.TOWER.MAX_LEVEL;
  }

  get cost() {
    if (this.level === 0) return CONFIG.TOWER.BUILD_COST;
    if (this.isMax) return null;
    return CONFIG.TOWER.UPGRADE_COSTS[this.level - 1];
  }

  get damage() {
    return CONFIG.TOWER.DAMAGE_BY_LEVEL[this.level - 1];
  }

  get range() {
    return CONFIG.TOWER.RANGE_BY_LEVEL[this.level - 1];
  }

  get fireRate() {
    return CONFIG.TOWER.FIRE_RATE_BY_LEVEL[this.level - 1];
  }

  // Attempts to build/upgrade using gameState.gold; returns true if it spent gold.
  // Takes the same {gameState, player} context as every other world object's
  // tryInteract, even though it doesn't need `player`, so callers can dispatch
  // clicks polymorphically without knowing which object type they hit.
  tryInteract({ gameState }) {
    return trySpendGoldToLevelUp(this, gameState);
  }

  update(dt, enemies, projectiles) {
    if (!this.isBuilt) return;
    this.timeSinceLastShot += dt;
    if (this.timeSinceLastShot < 1 / this.fireRate) return;

    let nearest = null;
    let nearestD2 = this.range * this.range;
    for (const e of enemies) {
      const d2 = dist2(this.x, this.y, e.x, e.y);
      if (d2 <= nearestD2) {
        nearest = e;
        nearestD2 = d2;
      }
    }
    if (nearest) {
      projectiles.push(new Projectile(
        this.x, this.y,
        nearest.x - this.x, nearest.y - this.y,
        CONFIG.TOWER.PROJECTILE_SPEED, this.damage, 1.5, 4, 'tower'
      ));
      this.timeSinceLastShot = 0;
    }
  }
}

// --- Town core ---------------------------------------------------------------
class TownCore {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.CORE.RADIUS;
    this.hp = CONFIG.CORE.MAX_HP;
    this.maxHp = CONFIG.CORE.MAX_HP;
    this.hitFlashTimer = 0; // >0 briefly when the core takes damage
  }

  get canRepair() {
    return this.hp < this.maxHp;
  }

  // Same {gameState, player} context shape as every other world object's
  // tryInteract (see TowerSpot) — `player` is unused here.
  tryInteract({ gameState }) {
    if (!this.canRepair) return false;
    if (gameState.gold < CONFIG.CORE.REPAIR_COST) return false;
    gameState.gold -= CONFIG.CORE.REPAIR_COST;
    this.hp = Math.min(this.maxHp, this.hp + CONFIG.CORE.REPAIR_AMOUNT);
    return true;
  }
}

// --- Forge ---------------------------------------------------------------
class Forge {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.FORGE.RADIUS;
    this.level = 1;
  }

  get isMax() {
    return this.level >= CONFIG.FORGE.MAX_LEVEL;
  }

  get cost() {
    if (this.isMax) return null;
    return CONFIG.FORGE.UPGRADE_COSTS[this.level - 1];
  }

  tryInteract({ gameState, player }) {
    const spent = trySpendGoldToLevelUp(this, gameState);
    if (spent) {
      player.damage = CONFIG.FORGE.DAMAGE_BY_LEVEL[this.level - 1];
      player.fireRate = CONFIG.FORGE.FIRE_RATE_BY_LEVEL[this.level - 1];
      player.weaponLevel = this.level;
    }
    return spent;
  }
}

// --- Particle ---------------------------------------------------------------
// Generic lightweight VFX particle: a small colored dot that flies outward,
// decelerates, and fades over its lifetime. Used for death bursts, muzzle
// flashes, upgrade sparkles, etc. — spawn helpers live in game.js.
class Particle {
  constructor(x, y, vx, vy, color, radius, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.radius = radius;
    this.life = life;
    this.maxLife = life;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.9; // friction, so bursts settle rather than fly forever
    this.vy *= 0.9;
    this.life -= dt;
  }

  get alpha() {
    return Math.max(0, this.life / this.maxLife);
  }
}
