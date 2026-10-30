// Formats rupee amounts the Indian way: ₹12,34,567.
// Uses nothing. Pure function, no DOM.
// Used by the Foodzy screens, the journey values and tools/verify-content.mjs.

// Whole rupees only. Groups the last 3 digits, then pairs: 1234567 becomes ₹12,34,567.
export function formatINR(amount) {
  const n = Math.round(Number(amount) || 0);
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.abs(n));
  if (digits.length <= 3) return `${sign}₹${digits}`;
  const last3 = digits.slice(-3);
  let rest = digits.slice(0, -3);
  const pairs = [];
  while (rest.length > 2) {
    pairs.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) pairs.unshift(rest);
  return `${sign}₹${pairs.join(",")},${last3}`;
}
