// Tracks watched flows in tea-progress using safe storage.
// Uses js/store.js.
// Used by panel, cta, links, and selftest.

import { getItem, setItem } from "./store.js";

const PROGRESS_KEY = "tea-progress";

/**
 * Returns the list of watched journey IDs.
 * @returns {string[]}
 */
export function getWatchedFlows() {
  const raw = getItem(PROGRESS_KEY, "local");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Checks whether a specific journey has been watched.
 * @param {string} flowId
 * @returns {boolean}
 */
export function isFlowWatched(flowId) {
  return getWatchedFlows().includes(flowId);
}

/**
 * Marks a journey as watched and saves it to storage.
 * @param {string} flowId
 * @returns {string[]} Updated list of watched flows
 */
export function markFlowWatched(flowId) {
  if (!flowId) return getWatchedFlows();
  const current = getWatchedFlows();
  if (!current.includes(flowId)) {
    const updated = [...current, flowId];
    setItem(PROGRESS_KEY, JSON.stringify(updated), "local");
    return updated;
  }
  return current;
}

/**
 * Returns how many flows have been watched.
 * @returns {number}
 */
export function getWatchedCount() {
  return getWatchedFlows().length;
}

/**
 * Clears watched flow progress.
 */
export function clearProgress() {
  setItem(PROGRESS_KEY, JSON.stringify([]), "local");
}
