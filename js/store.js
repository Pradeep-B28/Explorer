// Safe storage wrapper for localStorage and sessionStorage with fallback.
// Uses browser window.localStorage and window.sessionStorage.
// Used by progress.js, index.html, loader.js, and selftest.js.

// Hard Rule 5: Allowed keys only
const ALLOWED_LOCAL_KEYS = new Set(["tea-theme", "tea-progress"]);
const ALLOWED_SESSION_KEYS = new Set(["tea-intro-seen"]);

// In-memory fallback when browser storage is blocked or throws
const memoryStore = new Map();

// Test hook to allow simulating blocked storage for Check l
let storageOverride = null;

export function setStorageOverride(mock) {
  storageOverride = mock;
}

function getBackend(type) {
  if (storageOverride) {
    return storageOverride[type] || storageOverride;
  }
  try {
    if (typeof window !== "undefined") {
      return type === "session" ? window.sessionStorage : window.localStorage;
    }
  } catch (e) {
    // Storage access denied
  }
  return null;
}

function isAllowed(key, type) {
  return type === "session" ? ALLOWED_SESSION_KEYS.has(key) : ALLOWED_LOCAL_KEYS.has(key);
}

/**
 * Safely retrieve a value from storage.
 * @param {string} key
 * @param {"local" | "session"} [type="local"]
 * @returns {string | null}
 */
export function getItem(key, type = "local") {
  if (!isAllowed(key, type)) return null;
  const backend = getBackend(type);
  try {
    if (backend && typeof backend.getItem === "function") {
      const val = backend.getItem(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch (e) {
    // Storage access blocked; fall back to in-memory store
  }
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

/**
 * Safely store a value.
 * @param {string} key
 * @param {string} value
 * @param {"local" | "session"} [type="local"]
 * @returns {boolean} Whether writing succeeded (either in backend or memory)
 */
export function setItem(key, value, type = "local") {
  if (!isAllowed(key, type)) return false;
  const strVal = String(value);
  memoryStore.set(key, strVal);
  const backend = getBackend(type);
  try {
    if (backend && typeof backend.setItem === "function") {
      backend.setItem(key, strVal);
      return true;
    }
  } catch (e) {
    // Storage access blocked; memoryStore retains the value
  }
  return true;
}

/**
 * Safely remove a value from storage.
 * @param {string} key
 * @param {"local" | "session"} [type="local"]
 */
export function removeItem(key, type = "local") {
  memoryStore.delete(key);
  const backend = getBackend(type);
  try {
    if (backend && typeof backend.removeItem === "function") {
      backend.removeItem(key);
    }
  } catch (e) {
    // Storage access blocked
  }
}
