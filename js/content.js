// Imports and provides access to all content data (layers, apps, restaurants, journeys).
// Uses content/index.js and config.js.
// Used by screens, stage, apps, player, links, and selftest.

import { LAYERS, APPS, APP_CONTENT, CONTENT_VERSION } from "../content/index.js";
import { CONFIG } from "../config.js";

export { LAYERS, APPS, APP_CONTENT, CONTENT_VERSION, CONFIG };

/**
 * Returns all 5 layers in stack order.
 * @returns {Array<{ id: string, name: string, tech: string, oneLine: string, more: string }>}
 */
export function getLayers() {
  return LAYERS;
}

/**
 * Returns all registered apps.
 * @returns {Array<{ id: string, name: string, kind: string, status: string, teaser: string }>}
 */
export function getApps() {
  return APPS;
}

/**
 * Returns an app entry from the registry.
 * @param {string} appId
 */
export function getApp(appId) {
  return APPS.find((a) => a.id === appId) || null;
}

/**
 * Returns full content data for an app.
 * @param {string} appId
 * @returns {{ app: object, restaurants: Array, journeys: Array } | null}
 */
export function getAppContent(appId = "foodzy") {
  const id = typeof appId === "string" ? appId.toLowerCase() : "foodzy";
  return APP_CONTENT[id] || APP_CONTENT[appId] || null;
}

/**
 * Returns journeys for an app.
 * @param {string} appId
 * @returns {Array}
 */
export function getJourneys(appId = "foodzy") {
  const content = getAppContent(appId);
  return content ? content.journeys : [];
}

/**
 * Returns a specific journey for an app.
 * @param {string} appId
 * @param {string} journeyId
 * @returns {object | null}
 */
export function getJourney(appId = "foodzy", journeyId) {
  const journeys = getJourneys(appId);
  return journeys.find((j) => j.id === journeyId) || null;
}

/**
 * Returns restaurants for an app.
 * @param {string} appId
 * @returns {Array}
 */
export function getRestaurants(appId = "foodzy") {
  const content = getAppContent(appId);
  return content ? content.restaurants : [];
}
