// App registry mapping app IDs to their plug-in modules.
// Uses dynamic or static imports for available apps.
// Used by screens/stage.js and app loader.

import * as Foodzy from "./foodzy/index.js";

const REGISTRY = {
  foodzy: Foodzy,
  Foodzy
};

/**
 * Returns the app module for a given app ID.
 * @param {string} appId
 * @returns {object | null}
 */
export function getAppModule(appId) {
  const id = typeof appId === "string" ? appId.toLowerCase() : "";
  return REGISTRY[id] || REGISTRY[appId] || null;
}

/**
 * Lists all registered app IDs.
 * @returns {string[]}
 */
export function getRegisteredAppIds() {
  return Object.keys(REGISTRY);
}
