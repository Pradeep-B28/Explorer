// Turns a journey from content into ready-to-play steps: filled text, packet hops and timing.
// Uses js/engine/template.js. Pure functions, no DOM, no timers.
// Used by the journey player (js/player.js), the self-test and tools/verify-content.mjs.

import { fill, placeholdersDeep } from "./template.js";

// Keys a journey needs that are missing from values. Empty array means ready to play.
export function missingValues(journey, values) {
  return journey.values.filter((k) => !(k in values) || values[k] === undefined || values[k] === null);
}

// Index of a layer in the stack (0 is the top layer, Screen).
export function layerIndex(layers, layerId) {
  const i = layers.findIndex((l) => l.id === layerId);
  if (i < 0) throw new Error(`Unknown layer "${layerId}"`);
  return i;
}

// How long the packet takes to travel between two layers, in ms.
// distance is how many layers it moves (0 means it stays, as on the first step).
export function travelMs(distance, speed = 1) {
  if (distance <= 0) return 0;
  return Math.round((220 + 120 * distance) / speed);
}

// How long a whole step lasts at a speed (travel time is inside this, not added).
export function stepMs(step, speed = 1) {
  return Math.round(step.ms / speed);
}

// Total length of a journey at a speed, in ms.
export function totalMs(journey, speed = 1) {
  return journey.steps.reduce((sum, s) => sum + stepMs(s, speed), 0);
}

// Every packet move: [{ step, from, to, distance }]. The first step has from = null.
export function hops(journey, layers) {
  let prev = null;
  return journey.steps.map((s) => {
    const to = layerIndex(layers, s.layer);
    const distance = prev === null ? 0 : Math.abs(to - prev);
    const hop = { step: s.id, from: prev, to, distance };
    prev = to;
    return hop;
  });
}

// The steps, filled with values and ready for the player.
// Each step gets: from, to, distance, travel (ms at this speed), duration (ms at this speed),
// plus code (lang, file, lines), packet, log and route (Server steps), db (Database steps) and commit.
export function prepare(journey, layers, values, speed = 1) {
  const missing = missingValues(journey, values);
  if (missing.length) throw new Error(`Journey "${journey.id}" is missing values: ${missing.join(", ")}`);
  const moves = hops(journey, layers);
  return journey.steps.map((s, i) => ({
    id: s.id,
    index: i,
    count: journey.steps.length,
    layer: s.layer,
    title: s.title,
    say: fill(s.say, values),
    code: { lang: s.code.lang, file: s.code.file, lines: fill(s.code.lines, values) },
    packet: { label: s.packet.label, data: fill(s.packet.data, values) },
    log: s.log ? fill(s.log, values) : null,
    route: s.route || null,
    db: s.db ? fill(s.db, values) : null,
    commit: s.commit === true,
    from: moves[i].from,
    to: moves[i].to,
    distance: moves[i].distance,
    travel: travelMs(moves[i].distance, speed),
    duration: stepMs(s, speed)
  }));
}

// Placeholder keys used anywhere in a journey's steps (for the content check).
export function usedKeys(journey) {
  return placeholdersDeep(journey.steps.map((s) => [s.say, s.code.lines, s.packet.data, s.log || "", s.db || {}]));
}

// The code each layer ran most recently, up to and including step index upto.
// Returns { screen: step | null, styling: ..., logic: ..., server: ..., database: ... } using prepared steps.
// The dock's code tabs and the "full stack code" sheet use this.
export function latestCodeByLayer(steps, layers, upto) {
  const out = {};
  for (const l of layers) out[l.id] = null;
  steps.forEach((s, i) => {
    if (i <= upto) out[s.layer] = s;
  });
  return out;
}
