// Fills {placeholders} in journey text, code and packets with live values.
// Uses nothing. Pure functions, no DOM.
// Used by js/engine/journey.js and tools/verify-content.mjs.

// A placeholder is a letter followed by letters or digits, inside braces, with no spaces.
// "{orderId}" is a placeholder. "{ orderId }" and "${x}" in code are not filled ("$" is checked by the content check).
const PLACEHOLDER = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;
const WHOLE = /^\{([a-zA-Z][a-zA-Z0-9]*)\}$/;

// Every placeholder key in a string, in order, without repeats.
export function placeholders(text) {
  const keys = [];
  if (typeof text !== "string") return keys;
  for (const m of text.matchAll(PLACEHOLDER)) if (!keys.includes(m[1])) keys.push(m[1]);
  return keys;
}

// Every placeholder key anywhere inside a value (string, array or plain object).
export function placeholdersDeep(value, keys = []) {
  if (typeof value === "string") {
    for (const k of placeholders(value)) if (!keys.includes(k)) keys.push(k);
  } else if (Array.isArray(value)) {
    for (const v of value) placeholdersDeep(v, keys);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) placeholdersDeep(v, keys);
  }
  return keys;
}

// Fills one string. Throws if a key has no value, so a missing value is never shown as "{key}".
export function fillText(text, values) {
  return text.replace(PLACEHOLDER, (_, key) => {
    if (!(key in values)) throw new Error(`Missing value for {${key}}`);
    return String(values[key]);
  });
}

// Fills a whole value. A string that is exactly "{key}" keeps the value's own type,
// so packets show numbers as numbers: "{total}" becomes 388, not "388".
export function fill(value, values) {
  if (typeof value === "string") {
    const whole = value.match(WHOLE);
    if (whole) {
      if (!(whole[1] in values)) throw new Error(`Missing value for {${whole[1]}}`);
      return values[whole[1]];
    }
    return fillText(value, values);
  }
  if (Array.isArray(value)) return value.map((v) => fill(v, values));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = fill(v, values);
    return out;
  }
  return value;
}
