// Procedurally-generated pixel-art sprites for The Last Village.
// Each sprite is a 24x24 top-down icon built from simple circle/ring/rect
// primitives (not hand-authored pixel maps) so silhouettes stay clean and
// symmetric, then baked once into an offscreen canvas at load time. Colors
// are the same hues CONFIG/renderer already use, extended with a
// shadow/highlight tone per hue for the pixel-art shading.
//
// renderer.js consumes the baked canvases via ctx.drawImage — this file
// has no knowledge of the game loop, DOM, or input.
const Sprites = (function () {
  const SIZE = 24;

  const PALETTE = {
    outline: '#120f0a',

    // Player (village defender)
    hood: '#1e8449',
    hoodShade: '#166638',
    cloak: '#27ae60',
    cloakShade: '#1c8c4c',
    skin: '#e3a873',
    leather: '#6b4423',
    metal: '#d7dee3',

    // Runner (goblin)
    runnerSkin: '#e74c3c',
    runnerSkinShade: '#b93a2d',
    runnerDark: '#7a2418',
    eyeGlow: '#ffe97a',

    // Brute (war-troll)
    bruteSkin: '#d35400',
    bruteSkinShade: '#a34400',
    bruteHorn: '#e8dcc8',
    woodShade: '#5a3a20',

    // Stone / structures
    stone: '#888d92',
    stoneShade: '#696d71',
    stoneDark: '#4a4d50',
    wood: '#8a5a34',

    // Town core (crystal keep)
    coreBlue: '#3498db',
    coreBlueShade: '#256a9e',
    coreBlueLight: '#a9def2',

    // Forge
    forgePurple: '#9b59b6',
    fireOrange: '#f39c12',
    fireYellow: '#ffe08a',

    // Gold
    gold: '#f1c40f',
    goldShade: '#c89a0d',
    goldLight: '#fff3b0',

    // Projectile
    boltMetal: '#ecf0f1',
    boltMetalShade: '#b9c2c4',
    feather: '#e74c3c',
  };

  // --- tiny pixel-grid rasterizer -------------------------------------------
  function makeGrid(size) {
    return Array.from({ length: size }, () => new Array(size).fill(null));
  }
  function inGrid(g, x, y) {
    const s = g.length;
    return x >= 0 && y >= 0 && x < s && y < s;
  }
  function setPx(g, x, y, c) {
    if (inGrid(g, x, y)) g[y][x] = c;
  }
  function fillCircle(g, cx, cy, r, color, predicate) {
    const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r);
    const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        if (dx * dx + dy * dy <= r * r && (!predicate || predicate(x, y))) setPx(g, x, y, color);
      }
    }
  }
  function fillAnnulus(g, cx, cy, rOuter, rInner, color, predicate) {
    const x0 = Math.floor(cx - rOuter), x1 = Math.ceil(cx + rOuter);
    const y0 = Math.floor(cy - rOuter), y1 = Math.ceil(cy + rOuter);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 <= rOuter * rOuter && d2 >= rInner * rInner && (!predicate || predicate(x, y))) setPx(g, x, y, color);
      }
    }
  }
  function fillRect(g, x0, y0, x1, y1, color) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setPx(g, x, y, color);
  }
  function addOutline(g, color) {
    const s = g.length;
    const adds = [];
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        if (g[y][x]) continue;
        const ns = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
        for (const [nx, ny] of ns) {
          if (inGrid(g, nx, ny) && g[ny][nx]) { adds.push([x, y]); break; }
        }
      }
    }
    for (const [x, y] of adds) g[y][x] = color;
  }
  function ringDots(g, cx, cy, r, count, color) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      setPx(g, Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a)), color);
    }
  }
  function bake(grid) {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const key = grid[y][x];
        if (!key) continue;
        ctx.fillStyle = PALETTE[key];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return canvas;
  }

  // --- sprite builders -------------------------------------------------------
  function buildPlayer() {
    const g = makeGrid(SIZE);
    fillCircle(g, 12, 14.5, 7, 'cloak');
    fillCircle(g, 12, 14.5, 7, 'cloakShade', (x, y) => y > 14.5);
    fillCircle(g, 5.5, 15, 2.6, 'cloak');
    fillCircle(g, 18.5, 15, 2.6, 'cloak');
    fillCircle(g, 12, 8, 6, 'hood');
    fillCircle(g, 12, 8, 6, 'hoodShade', (x, y) => y > 9);
    fillCircle(g, 12, 11.5, 3, 'skin');
    fillRect(g, 7, 18, 16, 19, 'metal');
    fillRect(g, 10, 18, 13, 22, 'leather');
    fillRect(g, 9, 21, 10, 23, 'stoneShade');
    fillRect(g, 13, 21, 14, 23, 'stoneShade');
    addOutline(g, 'outline');
    return g;
  }

  function buildRunner() {
    const g = makeGrid(SIZE);
    fillCircle(g, 12, 14, 5, 'runnerSkin');
    fillCircle(g, 12, 14, 5, 'runnerSkinShade', (x, y) => y > 14);
    fillCircle(g, 12, 9, 4.5, 'runnerSkin');
    fillCircle(g, 12, 9, 4.5, 'runnerSkinShade', (x, y) => y > 10);
    fillCircle(g, 6, 8, 2, 'runnerSkin');
    fillCircle(g, 18, 8, 2, 'runnerSkin');
    setPx(g, 4, 6, 'runnerDark');
    setPx(g, 20, 6, 'runnerDark');
    setPx(g, 10, 9, 'eyeGlow');
    setPx(g, 14, 9, 'eyeGlow');
    fillRect(g, 17, 15, 18, 18, 'metal');
    fillRect(g, 9, 19, 10, 20, 'runnerDark');
    fillRect(g, 14, 19, 15, 20, 'runnerDark');
    addOutline(g, 'outline');
    return g;
  }

  function buildBrute() {
    const g = makeGrid(SIZE);
    fillCircle(g, 12, 15, 8, 'bruteSkin');
    fillCircle(g, 12, 15, 8, 'bruteSkinShade', (x, y) => y > 15);
    fillCircle(g, 4.5, 13, 3, 'bruteSkin');
    fillCircle(g, 19.5, 13, 3, 'bruteSkin');
    fillCircle(g, 12, 8, 5, 'bruteSkin');
    fillCircle(g, 12, 8, 5, 'bruteSkinShade', (x, y) => y > 9);
    fillRect(g, 10, 9, 11, 11, 'bruteHorn');
    fillRect(g, 13, 9, 14, 11, 'bruteHorn');
    setPx(g, 9, 7, 'outline');
    setPx(g, 15, 7, 'outline');
    fillRect(g, 17, 17, 21, 21, 'woodShade');
    fillRect(g, 8, 21, 10, 23, 'bruteSkinShade');
    fillRect(g, 14, 21, 16, 23, 'bruteSkinShade');
    addOutline(g, 'outline');
    return g;
  }

  // Shared "building" scaffold: stone base ring + optional roof disc +
  // per-structure accents — every structure is a circle seen from above,
  // so they're differentiated by size, color and accent, not shape.
  function buildStructure({ baseOuter, baseInner = 0, roofR, roofColor, roofShade, accents }) {
    const g = makeGrid(SIZE);
    const cx = 12, cy = 13;
    if (baseOuter) {
      fillAnnulus(g, cx, cy, baseOuter, baseInner, 'stone');
      fillAnnulus(g, cx, cy, baseOuter, baseInner, 'stoneShade', (x, y) => y > cy);
    }
    if (roofR) {
      fillCircle(g, cx, cy - 1, roofR, roofColor);
      fillCircle(g, cx, cy - 1, roofR, roofShade, (x, y) => y > cy - 1);
    }
    if (accents) accents(g, cx, cy);
    addOutline(g, 'outline');
    return g;
  }

  function buildEmptySpot() {
    return buildStructure({
      baseOuter: 9,
      accents: (g, cx, cy) => {
        fillCircle(g, cx, cy, 5.2, 'stoneDark');
        setPx(g, cx - 2, cy - 1, 'stoneShade');
        setPx(g, cx + 3, cy + 2, 'stoneShade');
        setPx(g, cx, cy + 3, 'stoneShade');
      },
    });
  }

  function buildTower1() {
    return buildStructure({
      baseOuter: 9, baseInner: 6.5,
      roofR: 6.5, roofColor: 'wood', roofShade: 'woodShade',
      accents: (g, cx, cy) => {
        fillRect(g, cx - 1, cy - 8, cx, cy - 6, 'cloak');
        setPx(g, cx - 4, cy - 2, 'outline');
        setPx(g, cx - 4, cy - 1, 'outline');
      },
    });
  }

  function buildTower2() {
    return buildStructure({
      baseOuter: 10, baseInner: 7.5,
      roofR: 7.5, roofColor: 'stoneDark', roofShade: 'stoneShade',
      accents: (g, cx, cy) => {
        ringDots(g, cx, cy, 9.5, 8, 'stoneDark');
        fillRect(g, cx - 1, cy - 10, cx, cy - 7, 'cloak');
        setPx(g, cx - 4, cy - 2, 'outline');
        setPx(g, cx - 4, cy - 1, 'outline');
      },
    });
  }

  function buildTower3() {
    return buildStructure({
      baseOuter: 11, baseInner: 8.5,
      roofR: 8.5, roofColor: 'stoneDark', roofShade: 'stoneShade',
      accents: (g, cx, cy) => {
        ringDots(g, cx, cy, 10.5, 10, 'stoneDark');
        fillCircle(g, cx, cy, 3, 'coreBlue');
        fillCircle(g, cx, cy, 1.4, 'coreBlueLight');
        fillRect(g, cx - 1, cy - 12, cx, cy - 9, 'cloak');
      },
    });
  }

  function buildCore() {
    return buildStructure({
      baseOuter: 11.5, baseInner: 8,
      accents: (g, cx, cy) => {
        ringDots(g, cx, cy, 11, 14, 'stoneDark');
        fillCircle(g, cx, cy, 8, 'coreBlueShade');
        fillCircle(g, cx, cy, 6, 'coreBlue');
        fillCircle(g, cx, cy, 3, 'coreBlueLight');
      },
    });
  }

  function buildForge() {
    return buildStructure({
      baseOuter: 9, baseInner: 6.5,
      roofR: 6.5, roofColor: 'wood', roofShade: 'woodShade',
      accents: (g, cx, cy) => {
        fillAnnulus(g, cx, cy - 1, 6.7, 6.1, 'forgePurple');
        fillRect(g, cx + 3, cy - 10, cx + 5, cy - 4, 'stoneDark');
        fillCircle(g, cx + 4, cy - 10, 1.5, 'fireOrange');
        fillCircle(g, cx, cy, 2.2, 'fireOrange');
        fillCircle(g, cx, cy, 1, 'fireYellow');
        fillRect(g, cx - 9, cy + 5, cx - 5, cy + 6, 'stoneShade');
        fillRect(g, cx - 8, cy + 6, cx - 6, cy + 8, 'stoneDark');
      },
    });
  }

  function buildGold() {
    const g = makeGrid(SIZE);
    fillCircle(g, 12, 12, 6, 'gold');
    fillCircle(g, 12, 12, 6, 'goldShade', (x, y) => x > 12 && y > 12);
    fillCircle(g, 12, 12, 3.6, 'goldShade');
    fillCircle(g, 12, 12, 2.3, 'gold');
    fillCircle(g, 9.5, 9.5, 1.8, 'goldLight');
    addOutline(g, 'outline');
    return g;
  }

  // Points "up" (toward -y) at rest; renderer.js rotates it to match travel direction.
  function buildBolt() {
    const g = makeGrid(SIZE);
    fillRect(g, 11, 5, 12, 19, 'boltMetalShade');
    fillRect(g, 11, 5, 12, 9, 'boltMetal');
    for (let i = 0; i < 4; i++) fillRect(g, 11 - i, 2 + i, 12 + i, 2 + i, 'boltMetal');
    fillRect(g, 8, 17, 10, 20, 'feather');
    fillRect(g, 13, 17, 15, 20, 'feather');
    addOutline(g, 'outline');
    return g;
  }

  return {
    SIZE,
    player: bake(buildPlayer()),
    runner: bake(buildRunner()),
    brute: bake(buildBrute()),
    emptySpot: bake(buildEmptySpot()),
    // Indexed by tower level - 1, so `tower[spot.level - 1]` picks the right tier.
    tower: [bake(buildTower1()), bake(buildTower2()), bake(buildTower3())],
    core: bake(buildCore()),
    forge: bake(buildForge()),
    gold: bake(buildGold()),
    bolt: bake(buildBolt()),
  };
})();
