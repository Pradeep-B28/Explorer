// Foodzy's order numbers and tracking time.
// Uses nothing (settings are passed in from content/apps/Foodzy/app.js). Pure functions.
// Used by the Foodzy screens, the journey values, the self-test and tools/verify-content.mjs.

// The nth order placed in this visit, starting at 1: prefix "TH", start 52000 gives "TH-52001".
export function orderId(n, orders) {
  if (!Number.isInteger(n) || n < 1) throw new Error("Order number must be a whole number from 1");
  return `${orders.prefix}-${orders.start + n}`;
}

// Minutes left when the rider is on the way: 60% of the restaurant's time, at least 4.
export function trackingEta(etaMin) {
  return Math.max(4, Math.round(etaMin * 0.6));
}
