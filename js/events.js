// Event bus for app-wide decoupled communication.
// Uses standard JavaScript Map and Set.
// Used by player.js, analytics.js, apps, screens, and UI components.

const listeners = new Map();

/**
 * Register an event listener.
 * @param {string} event
 * @param {Function} handler
 */
export function on(event, handler) {
  if (typeof handler !== "function") return;
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(handler);
}

/**
 * Remove an event listener.
 * @param {string} event
 * @param {Function} handler
 */
export function off(event, handler) {
  if (!listeners.has(event)) return;
  listeners.get(event).delete(handler);
  if (listeners.get(event).size === 0) {
    listeners.delete(event);
  }
}

/**
 * Emit an event to all registered listeners.
 * @param {string} event
 * @param {*} payload
 */
export function emit(event, payload) {
  if (!listeners.has(event)) return;
  for (const handler of Array.from(listeners.get(event))) {
    try {
      handler(payload);
    } catch (err) {
      // Prevent one handler error from breaking others
    }
  }
}

/**
 * Clear all listeners (useful for testing).
 */
export function clearEvents() {
  listeners.clear();
}
