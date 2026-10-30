// App registry mapping app IDs to their plug-in modules.
// Uses dynamic or static imports for available apps.
// Used by screens/stage.js and app loader.

import * as Foodzy from "./Foodzy/index.js";

const REGISTRY = {
  Foodzy
};

/**
 * Returns the app module for a given app ID.
 * @param {string} appId
 * @returns {object | null}
 */
export function getAppModule(appId) {
  return REGISTRY[appId] || null;
}

/**
 * Lists all registered app IDs.
 * @returns {string[]}
 */
export function getRegisteredAppIds() {
  return Object.keys(REGISTRY);
}
