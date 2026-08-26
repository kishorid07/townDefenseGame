// Raw input handling for The Last Village: which keys are held, where the
// mouse is, and DOM event wiring. Deciding what a click *means* (fire a shot
// vs. interact with a world object) is game logic and stays in game.js —
// this file only reports what the player physically did.
const Input = (function () {
  const keys = {};
  const mouse = { x: 0, y: 0 };

  // Attaches listeners to `canvas`. `onLeftClick(cx, cy)` is called with
  // canvas-local coordinates whenever the player left-clicks the canvas.
  function init(canvas, { onLeftClick }) {
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // left click only
      const rect = canvas.getBoundingClientRect();
      onLeftClick(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  // Current WASD movement direction as a (possibly non-normalized) {x, y}
  // axis pair, e.g. {x: 1, y: -1} while holding D and W together.
  function moveAxis() {
    return {
      x: (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0),
      y: (keys['KeyS'] ? 1 : 0) - (keys['KeyW'] ? 1 : 0),
    };
  }

  return { init, keys, mouse, moveAxis };
})();
