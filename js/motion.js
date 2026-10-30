// Central animation loop (rAF) and reduced-motion detection.
// Uses browser window.requestAnimationFrame, performance.now, and matchMedia.
// Used by packet, beam, hero 3D art, and UI components.

const subscribers = new Set();
let rafId = null;
let lastTime = 0;
let isPaused = false;

/**
 * Checks whether user prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  } catch (e) {
    // Fall back to false if matchMedia is unavailable
  }
  return false;
}

function loop(currentTime) {
  if (subscribers.size === 0 || isPaused) {
    rafId = null;
    return;
  }

  if (lastTime === 0) {
    lastTime = currentTime;
  }

  // Delta time in seconds, capped at 0.05s (50ms) per Section 4
  const rawDelta = (currentTime - lastTime) / 1000;
  const dt = Math.min(Math.max(0, rawDelta), 0.05);
  lastTime = currentTime;

  for (const fn of Array.from(subscribers)) {
    try {
      fn(dt, currentTime);
    } catch (err) {
      // Prevent one subscriber error from stopping the animation loop
    }
  }

  rafId = requestAnimationFrame(loop);
}

function startLoop() {
  if (rafId === null && subscribers.size > 0 && !isPaused) {
    lastTime = 0;
    if (typeof requestAnimationFrame !== "undefined") {
      rafId = requestAnimationFrame(loop);
    }
  }
}

function stopLoop() {
  if (rafId !== null) {
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
    }
    rafId = null;
    lastTime = 0;
  }
}

/**
 * Register a callback in the single animation loop.
 * @param {(dt: number, now: number) => void} fn
 * @returns {() => void} Unsubscribe function
 */
export function subscribe(fn) {
  if (typeof fn !== "function") return () => {};
  subscribers.add(fn);
  startLoop();

  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) {
      stopLoop();
    }
  };
}

// Pause everything when the tab is hidden (Section 4)
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isPaused = true;
      stopLoop();
    } else {
      isPaused = false;
      lastTime = 0;
      startLoop();
    }
  });
}
