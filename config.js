// All tunable numbers for The Last Village live here.
// Change balance by editing this file only — no logic changes needed.
const CONFIG = {
  START_GOLD: 20,
  PICKUP_RANGE: 24,

  PLAYER: {
    SPEED: 180,            // px/s
    RADIUS: 14,
    BASE_DAMAGE: 8,
    BASE_FIRE_RATE: 3,     // shots/sec
    PROJECTILE_SPEED: 520, // px/s
    PROJECTILE_RADIUS: 4,
    PROJECTILE_TTL: 1.2,   // seconds
  },

  ENEMY_TYPES: {
    runner: { hp: 15, speed: 90, damage: 3, radius: 10, goldValue: 2, color: '#e74c3c' },
    brute:  { hp: 60, speed: 35, damage: 9, radius: 16, goldValue: 6, color: '#d35400' },
  },

  SPAWN: {
    START_INTERVAL: 3.2,   // seconds between spawns at t=0
    MIN_INTERVAL: 0.7,     // seconds between spawns at t=SESSION_DURATION
    MARGIN: 60,            // px beyond screen edge enemies spawn at
  },

  CORE: {
    RADIUS: 30,
    MAX_HP: 260,
    REPAIR_COST: 15,
    REPAIR_AMOUNT: 30,
    ATTACK_INTERVAL: 0.5,  // enemies deal damage to core every N seconds while in range
  },

  TOWER: {
    RADIUS: 18,
    BUILD_COST: 20,
    UPGRADE_COSTS: [40, 70],            // cost for level 1->2, 2->3
    DAMAGE_BY_LEVEL: [10, 18, 30],       // index 0 = level 1
    RANGE_BY_LEVEL: [140, 170, 200],
    FIRE_RATE_BY_LEVEL: [1.0, 1.5, 2.0], // shots/sec
    PROJECTILE_SPEED: 400,
    MAX_LEVEL: 3,
  },

  FORGE: {
    RADIUS: 18,
    UPGRADE_COSTS: [30, 60, 100],          // cost for level 1->2, 2->3, 3->4
    DAMAGE_BY_LEVEL: [8, 12, 18, 26],       // index 0 = level 1
    FIRE_RATE_BY_LEVEL: [3, 3.5, 4.2, 5],
    MAX_LEVEL: 4,
  },

  SESSION_DURATION: 600, // 10 minutes, seconds

  DIFFICULTY: {
    BRUTE_CHANCE_START: 0.15,
    BRUTE_CHANCE_END: 0.5,
    STAT_MULT_END: 0.35, // up to +35% hp/damage by end of session
  },
};
