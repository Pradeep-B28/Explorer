// Hash router handling navigation between #/ and #/app/<id>.
// Uses window.location.hash and window.addEventListener.
// Used by main.js.

const listeners = new Set();

/**
 * Parses the current hash into a route and parameter object.
 * @returns {{ route: string, params: Record<string, string> }}
 */
export function getRoute() {
  if (typeof window === "undefined") {
    return { route: "home", params: {} };
  }

  const hash = window.location.hash || "#/";
  const clean = hash.replace(/^#\/?/, "");

  if (!clean || clean === "/") {
    return { route: "home", params: {} };
  }

  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "app" && parts[1]) {
    return { route: "app", params: { id: parts[1] } };
  }

  return { route: "home", params: {} };
}

/**
 * Navigates to a specific hash route.
 * @param {string} hash Target hash, e.g. "#/app/Foodzy"
 */
export function navigateTo(hash) {
  if (typeof window !== "undefined") {
    window.location.hash = hash;
  }
}

/**
 * Registers a route change listener.
 * @param {(routeInfo: { route: string, params: Record<string, string> }) => void} fn
 * @returns {() => void} Unsubscribe function
 */
export function onRoute(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function handleHashChange() {
  const current = getRoute();
  for (const fn of Array.from(listeners)) {
    try {
      fn(current);
    } catch (e) {
      // Ignore listener errors
    }
  }
}

/**
 * Initializes hash routing listener.
 */
export function initRouter() {
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", handleHashChange);
    // Fire initially
    handleHashChange();
  }
}
