// Difficulty ramp for The Last Village: pure functions of elapsed session
// time `t` (seconds), reading only CONFIG. No DOM, no game state — every
// function here can be called and checked in isolation.
const Difficulty = (function () {
  // 0 at session start, 1 at CONFIG.SESSION_DURATION and beyond.
  function progress(t) {
    return Math.min(t / CONFIG.SESSION_DURATION, 1);
  }

  // Seconds between enemy spawns: starts at SPAWN.START_INTERVAL, linearly
  // shrinks to SPAWN.MIN_INTERVAL by the end of the session.
  function spawnInterval(t) {
    const p = progress(t);
    return CONFIG.SPAWN.START_INTERVAL - p * (CONFIG.SPAWN.START_INTERVAL - CONFIG.SPAWN.MIN_INTERVAL);
  }

  // Which enemy type a new spawn should be, with brute chance ramping up over the session.
  function pickEnemyType(t) {
    const p = progress(t);
    const bruteChance = CONFIG.DIFFICULTY.BRUTE_CHANCE_START +
      p * (CONFIG.DIFFICULTY.BRUTE_CHANCE_END - CONFIG.DIFFICULTY.BRUTE_CHANCE_START);
    return Math.random() < bruteChance ? 'brute' : 'runner';
  }

  // Applies the session's hp/damage scaling to a base CONFIG.ENEMY_TYPES entry.
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

  return { progress, spawnInterval, pickEnemyType, scaledStats };
})();
