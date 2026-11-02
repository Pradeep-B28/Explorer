// Hash router handling navigation between #/ and #/app/<id>.
// Uses window.location.hash and window.addEventListener.
// Used by main.js and stage.js.

const listeners = new Set();
let currentRouteKey = null;

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
    const rawId = parts[1].toLowerCase();
    if (rawId === "thattu") {
      window.location.replace("#/app/foodzy");
      return { route: "app", params: { id: "foodzy" } };
    }
    return { route: "app", params: { id: rawId } };
  }

  return { route: "home", params: {} };
}

/**
 * Dispatches the current route to all registered listeners if the route changed.
 */
function handleHashChange() {
  const current = getRoute();
  const routeKey = `${current.route}:${JSON.stringify(current.params)}`;
  if (routeKey === currentRouteKey) return;
  currentRouteKey = routeKey;

  for (const fn of Array.from(listeners)) {
    try {
      fn(current);
    } catch (e) {
      // Ignore listener errors
    }
  }
}

/**
 * Navigates to a specific hash route and triggers route listeners.
 * @param {string} hash Target hash, e.g. "#/" or "#/app/foodzy"
 */
export function navigateTo(hash) {
  if (typeof window !== "undefined") {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    handleHashChange();
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
