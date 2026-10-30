// Content and engine check for The Exploded App. Run from the project folder:  node tools/verify-content.mjs
//
// It checks, without a browser:
//   1. every field in content/ against content/SCHEMA.md
//   2. every journey: layers, steps, placeholders, code size, timing, commit step, layer rules
//   3. every journey's demo values match what the engine builds from the demo state
//   4. all player-facing text for long dashes, emojis, banned words and real brand names
//   5. the engine (cart, bill, search, order numbers, money, templates, timing) against fixed expected values
//   6. js/copy.js, once it exists: the 4 keys the engine needs, and its text rules
// Prints PASS or FAIL lines and exits with code 1 if anything fails.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { LAYERS, APPS, APP_CONTENT, CONTENT_VERSION } from "../content/index.js";
import { CONFIG } from "../config.js";
import { placeholders, placeholdersDeep, fill, fillText } from "../js/engine/template.js";
import { prepare, hops, totalMs, travelMs, usedKeys, missingValues } from "../js/engine/journey.js";
import { formatINR } from "../js/engine/money.js";
import { emptyCart, addItem, removeItem, cartFrom, itemCount, bill } from "../js/engine/Foodzy/cart.js";
import { search } from "../js/engine/Foodzy/search.js";
import { orderId, trackingEta } from "../js/engine/Foodzy/orders.js";
import { journeyValues } from "../js/engine/Foodzy/values.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const DASHES = /[\u2012\u2013\u2014\u2015]/; // figure dash, en dash, em dash, horizontal bar
const EMOJI = /(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}/u; // the (c), (r) and TM signs are fine
const BANNED = [
  "guarantee", "placement", "salary", "lakh", "get hired", "seats left", "take your job", "replace you",
  "stupid", "dumb", "idiot", "noob", "loser", "useless"
];
// Real brands never appear in content. copy.js may say WhatsApp (the CTA button).
const BRANDS = [
  "swiggy", "zomato", "instagram", "gpay", "google pay", "phonepe", "paytm", "makemytrip", "amazon",
  "flipkart", "rapido", "uber", "ola", "dunzo", "zepto", "blinkit", "bigbasket", "claude", "vscode",
  "vs code", "whatsapp", "redbus"
];
const LAYER_IDS = ["screen", "styling", "logic", "server", "database"];
const LANGS = ["html", "css", "js", "sql", "text"];
const TRIGGERS = ["add", "search", "place-order", "track"];
const NEEDS = ["none", "results", "cart", "order"];

let failures = 0;
let passes = 0;
function fail(where, msg) {
  failures++;
  console.log(`  FAIL  ${where}: ${msg}`);
}
function ok(cond, where, msg) {
  if (cond) passes++;
  else fail(where, msg);
}
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isInt = (v) => Number.isInteger(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function brandHit(text, list) {
  const lower = text.toLowerCase();
  return list.find((b) => new RegExp(`(^|[^a-z])${b.replace(" ", "\\s")}([^a-z]|$)`).test(lower));
}
function checkText(where, label, text, { brands = BRANDS, max = 0 } = {}) {
  if (typeof text !== "string") return fail(where, `${label} is not text`);
  if (DASHES.test(text)) fail(where, `${label} has a long dash`);
  if (EMOJI.test(text)) fail(where, `${label} has an emoji`);
  const lower = text.toLowerCase();
  for (const b of BANNED) if (lower.includes(b)) fail(where, `${label} uses the banned word "${b}"`);
  const hit = brandHit(text, brands);
  if (hit) fail(where, `${label} names a real brand ("${hit}")`);
  if (max && text.length > max) fail(where, `${label} is ${text.length} characters (max ${max})`);
}
function section(name) {
  console.log(`\n${name}`);
}

// ---------------------------------------------------------------- 1. Layers and apps
section("1. Layers and app registry");
ok(isStr(CONTENT_VERSION), "content", "CONTENT_VERSION missing");
ok(same([LAYERS.length, APPS.length, APP_CONTENT.Foodzy.restaurants.length, APP_CONTENT.Foodzy.restaurants.reduce((n, r) => n + r.menu.length, 0), APP_CONTENT.Foodzy.journeys.length], [5, 4, 6, 31, 4]), "content", "counts must be 5 layers, 4 apps, 6 restaurants, 31 dishes, 4 journeys (Section 10 check a)");
ok(same(LAYERS.map((l) => l.id), LAYER_IDS), "layers", `must be exactly ${LAYER_IDS.join(", ")} in that order`);
for (const l of LAYERS) {
  for (const k of ["name", "tech", "oneLine", "more"]) {
    if (!isStr(l[k])) fail(`layer ${l.id}`, `${k} missing`);
    else checkText(`layer ${l.id}`, k, l[k], { max: k === "more" ? 110 : 40 });
  }
}
const appIds = new Set();
for (const a of APPS) {
  const w = `app ${a.id}`;
  ok(/^[a-z]{2,12}$/.test(a.id), w, "id must be 2 to 12 lowercase letters");
  ok(!appIds.has(a.id), w, "id used twice");
  appIds.add(a.id);
  ok(["live", "soon"].includes(a.status), w, "status must be live or soon");
  for (const k of ["name", "kind", "teaser"]) {
    if (!isStr(a[k])) fail(w, `${k} missing`);
    else checkText(w, k, a[k], { max: k === "teaser" ? 80 : 24 });
  }
  if (a.status === "live") ok(Boolean(APP_CONTENT[a.id]), w, "live app has no entry in APP_CONTENT");
}
ok(APPS.some((a) => a.status === "live"), "apps", "at least one app must be live");
for (const id of Object.keys(APP_CONTENT)) ok(appIds.has(id), `APP_CONTENT ${id}`, "not in the app registry");

// ---------------------------------------------------------------- 2. Foodzy app and restaurants
section("2. Foodzy app and restaurants");
const T = APP_CONTENT.Foodzy;
const { app, restaurants, journeys } = T;
ok(app.id === "Foodzy", "Foodzy", "app.id must be Foodzy");
ok(/\.example$/.test(app.domain), "Foodzy", "domain must end in .example (a reserved, made-up domain)");
for (const k of ["name", "tagline", "riderName", "offerBanner", "payment"]) {
  if (!isStr(app[k])) fail("Foodzy", `${k} missing`);
  else checkText("Foodzy", k, app[k], { max: 60 });
}
for (const k of ["firstName", "area", "address"]) {
  if (!isStr(app.user?.[k])) fail("Foodzy.user", `${k} missing`);
  else checkText("Foodzy.user", k, app.user[k], { max: 60 });
}
ok(same(placeholders(app.offerBanner), ["freeAbove"]), "Foodzy", "offerBanner must use only {freeAbove}");
for (const k of ["delivery", "freeDeliveryAbove", "platform", "gstPercent"]) ok(isInt(app.fees[k]) && app.fees[k] >= 0, "Foodzy.fees", `${k} must be a whole number`);
ok(isStr(app.orders.prefix) && isInt(app.orders.start), "Foodzy.orders", "prefix and start required");

const shopIds = new Set();
const itemIds = new Set();
ok(restaurants.length >= 4 && restaurants.length <= 12, "restaurants", "need 4 to 12");
for (const r of restaurants) {
  const w = `restaurant ${r.id}`;
  ok(/^r\d{1,2}$/.test(r.id), w, "id must look like r1");
  ok(!shopIds.has(r.id), w, "id used twice");
  shopIds.add(r.id);
  for (const k of ["name", "cuisine", "area"]) {
    if (!isStr(r[k])) fail(w, `${k} missing`);
    else checkText(w, k, r[k], { max: k === "name" ? 26 : 30 });
  }
  ok(typeof r.rating === "number" && r.rating >= 3 && r.rating <= 5 && Math.round(r.rating * 10) === r.rating * 10, w, "rating must be 3.0 to 5.0 with one decimal");
  ok(isInt(r.etaMin) && r.etaMin >= 10 && r.etaMin <= 60, w, "etaMin must be 10 to 60");
  ok(isInt(r.priceForTwo) && r.priceForTwo > 0, w, "priceForTwo must be a whole number");
  ok(typeof r.pureVeg === "boolean", w, "pureVeg must be true or false");
  ok(/^[a-z0-9-]+\.(jpg|webp|png)$/.test(r.image), w, "image must be a lowercase file name ending .jpg, .webp or .png");
  ok(r.menu.length >= 4 && r.menu.length <= 8, w, "menu needs 4 to 8 dishes");
  ok(r.menu.some((m) => m.bestseller), w, "needs at least one bestseller");
  for (const m of r.menu) {
    const wm = `dish ${m.id}`;
    ok(m.id.startsWith(r.id + "i") && /^r\d{1,2}i\d{1,2}$/.test(m.id), wm, `id must look like ${r.id}i1`);
    ok(!itemIds.has(m.id), wm, "id used twice");
    itemIds.add(m.id);
    if (!isStr(m.name)) fail(wm, "name missing");
    else checkText(wm, "name", m.name, { max: 26 });
    if (!isStr(m.desc)) fail(wm, "desc missing");
    else checkText(wm, "desc", m.desc, { max: 70 });
    ok(isInt(m.price) && m.price >= 10 && m.price <= 2000, wm, "price must be a whole number from 10 to 2000");
    ok(typeof m.veg === "boolean" && typeof m.bestseller === "boolean", wm, "veg and bestseller must be true or false");
    if (r.pureVeg) ok(m.veg === true, wm, "a pure veg restaurant can only have veg dishes");
  }
}
for (const c of app.categories) {
  checkText("Foodzy.categories", c, c, { max: 16 });
  ok(search(restaurants, c, CONFIG.limits.searchMinChars).results.length >= 1, "Foodzy.categories", `"${c}" finds no restaurant`);
}
let demoShop = null;
for (const d of app.demoCart) {
  const shop = restaurants.find((r) => r.menu.some((m) => m.id === d.itemId));
  ok(Boolean(shop), "Foodzy.demoCart", `${d.itemId} does not exist`);
  if (shop) {
    if (demoShop && demoShop !== shop.id) fail("Foodzy.demoCart", "dishes must come from one restaurant");
    demoShop = shop.id;
  }
  ok(isInt(d.qty) && d.qty >= 1, "Foodzy.demoCart", "qty must be 1 or more");
}
for (const o of app.seedOrders) {
  ok(/^[A-Z]{2}-\d{5}$/.test(o.id) && isInt(o.total) && isStr(o.shop) && isStr(o.status), "Foodzy.seedOrders", `bad row ${o.id}`);
  ok(restaurants.some((r) => r.name === o.shop), "Foodzy.seedOrders", `${o.id} names an unknown restaurant`);
}

// ---------------------------------------------------------------- 3. Journeys
section("3. Journeys");
const journeyIds = new Set();
for (const j of journeys) {
  const w = `journey ${j.id}`;
  ok(/^[a-z]{2,12}$/.test(j.id) && !journeyIds.has(j.id), w, "id must be 2 to 12 lowercase letters and unique");
  journeyIds.add(j.id);
  ok(TRIGGERS.includes(j.trigger?.on), w, `trigger.on must be one of ${TRIGGERS.join(", ")}`);
  ok(NEEDS.includes(j.trigger?.needs), w, `trigger.needs must be one of ${NEEDS.join(", ")}`);
  for (const [k, max] of [["title", 24], ["tryThis", 60], ["lesson", 100]]) {
    if (!isStr(j[k])) fail(w, `${k} missing`);
    else checkText(w, k, j[k], { max });
  }
  ok(Array.isArray(j.values) && new Set(j.values).size === j.values.length, w, "values must be a list without repeats");
  ok(same(Object.keys(j.demoValues).sort(), [...j.values].sort()), w, "demoValues must have exactly the keys in values");
  const used = usedKeys(j);
  for (const k of used) ok(j.values.includes(k), w, `uses {${k}} but it is not in values`);
  for (const k of j.values) ok(used.includes(k), w, `value ${k} is never used`);
  ok(j.steps.length >= 3 && j.steps.length <= 10, w, "needs 3 to 10 steps");

  const stepIds = new Set();
  const moves = hops(j, LAYERS);
  j.steps.forEach((s, i) => {
    const ws = `step ${s.id}`;
    ok(s.id.startsWith(j.id + "-") && !stepIds.has(s.id), ws, `id must start with "${j.id}-" and be unique`);
    stepIds.add(s.id);
    ok(LAYER_IDS.includes(s.layer), ws, "unknown layer");
    if (!isStr(s.title)) fail(ws, "title missing");
    else checkText(ws, "title", s.title, { max: 32 });
    if (!isStr(s.say)) fail(ws, "say missing");
    else checkText(ws, "say", s.say, { max: 160 });
    ok(LANGS.includes(s.code?.lang), ws, `code.lang must be one of ${LANGS.join(", ")}`);
    ok(Array.isArray(s.code?.lines) && s.code.lines.length >= 1 && s.code.lines.length <= 5, ws, "code needs 1 to 5 lines");
    for (const line of s.code.lines) {
      ok(typeof line === "string" && line.length <= 60, ws, `code line over 60 characters: ${line}`);
      ok(!/\$\{[a-zA-Z][a-zA-Z0-9]*\}/.test(line), ws, `code uses \${...}, which would be filled as a placeholder: ${line}`);
      ok(!DASHES.test(line) && !EMOJI.test(line), ws, `code line has a long dash or emoji: ${line}`);
    }
    ok(isStr(s.packet?.label) && s.packet.label.length <= 12, ws, "packet.label must be 1 to 12 characters");
    const pk = s.packet?.data && typeof s.packet.data === "object" && !Array.isArray(s.packet.data) ? Object.keys(s.packet.data) : [];
    ok(pk.length >= 1 && pk.length <= 4, ws, "packet.data must be an object with 1 to 4 keys");
    ok(isInt(s.ms) && s.ms >= 1200 && s.ms <= 4000, ws, "ms must be a whole number from 1200 to 4000");
    ok(s.ms >= travelMs(moves[i].distance) + 800, ws, "ms too short for the packet to travel and the text to be read");
    if (s.layer === "server") {
      if (!isStr(s.log)) fail(ws, "server steps need a log line");
      else checkText(ws, "log", s.log, { max: 44 });
    } else ok(s.log === undefined, ws, "only server steps have a log line");
    if (s.layer === "database") {
      const d = s.db;
      ok(d && ["restaurants", "orders"].includes(d.table), ws, "db.table must be restaurants or orders");
      ok(d && ["select", "insert", "update"].includes(d.action), ws, "db.action must be select, insert or update");
      ok(d && Array.isArray(d.columns) && Array.isArray(d.row) && d.columns.length === d.row.length && d.row.length >= 2 && d.row.length <= 4, ws, "db.columns and db.row need the same length, 2 to 4");
    } else ok(s.db === undefined, ws, "only database steps have db");
    if (s.commit !== undefined) ok(s.commit === true, ws, "commit must be true or left out");
  });
  const layersUsed = j.steps.map((s) => s.layer);
  const commits = j.steps.map((s, i) => (s.commit ? i : -1)).filter((i) => i >= 0);
  ok(commits.length === 1, w, "exactly one step must have commit: true");
  if (commits.length === 1) {
    const c = commits[0];
    ok(j.steps[c].layer === "styling", w, "the commit step must be a Styling step");
    const lastBackend = Math.max(layersUsed.lastIndexOf("server"), layersUsed.lastIndexOf("database"));
    ok(c > lastBackend, w, "the commit step must come after every Server and Database step");
  }
  ok(layersUsed[layersUsed.length - 1] === "screen", w, "the last step must be on the Screen layer");
  ok(["screen", "server"].includes(layersUsed[0]), w, "the first step must be on Screen (a tap) or Server (news from outside)");
  for (let i = 1; i < layersUsed.length; i++) {
    if (layersUsed[i] === layersUsed[i - 1] && layersUsed[i] !== "server") fail(w, `steps ${i} and ${i + 1} are both on ${layersUsed[i]}`);
  }

  // Demo values fill every step, and filled text still fits.
  try {
    const steps = prepare(j, LAYERS, j.demoValues, 1);
    for (const s of steps) {
      const all = JSON.stringify([s.say, s.code.lines, s.packet.data, s.log, s.db]);
      ok(placeholdersDeep(all).length === 0, `step ${s.id}`, "a placeholder is left after filling");
      checkText(`step ${s.id}`, "filled say", s.say, { max: 170 });
      for (const line of s.code.lines) ok(line.length <= 64, `step ${s.id}`, `filled code line over 64 characters: ${line}`);
      if (s.log) ok(s.log.length <= 48, `step ${s.id}`, `filled log over 48 characters: ${s.log}`);
    }
  } catch (e) {
    fail(w, `demo values do not fill: ${e.message}`);
  }
}
const J = Object.fromEntries(journeys.map((j) => [j.id, j]));
ok(same(Object.keys(J), ["add", "search", "order", "track"]), "journeys", "v1 needs add, search, order and track, in that order");
ok(!J.add.steps.some((s) => ["server", "database"].includes(s.layer)), "journey add", "must not reach the Server or Database (its lesson)");
ok(LAYER_IDS.every((l) => J.order.steps.some((s) => s.layer === l)), "journey order", "must use all 5 layers (the flagship)");
ok(J.track.steps.some((s) => s.layer === "server") && J.track.steps[0].layer === "server", "journey track", "must start on the Server (the push)");

// ---------------------------------------------------------------- 4. Demo values match the engine
section("4. Demo values match the engine");
const REF_COPY = {
  "cart.bar": "{n} items, {total}",
  "cart.bar.one": "{n} item, {total}",
  "search.count": "{n} restaurants",
  "search.count.one": "{n} restaurant"
};
function refT(key, values = {}) {
  const k = values.n === 1 && REF_COPY[key + ".one"] ? key + ".one" : key;
  return fillText(REF_COPY[k], values);
}
let t = refT;
const copyPath = join(ROOT, "js", "copy.js");
if (existsSync(copyPath)) {
  try {
    const copy = await import(pathToFileURL(copyPath).href);
    ok(typeof copy.t === "function" && copy.COPY && typeof copy.COPY === "object", "js/copy.js", "must export t() and COPY");
    for (const [k, v] of Object.entries(REF_COPY)) ok(copy.COPY[k] === v, "js/copy.js", `${k} must be exactly "${v}"`);
    for (const [k, v] of Object.entries(copy.COPY)) {
      if (typeof v !== "string") fail("js/copy.js", `${k} is not text`);
      else checkText("js/copy.js", k, v, { brands: BRANDS.filter((b) => b !== "whatsapp"), max: 220 });
    }
    t = copy.t;
    console.log("  (js/copy.js found and checked)");
  } catch (e) {
    fail("js/copy.js", `could not load: ${e.message}`);
  }
} else {
  console.log("  (js/copy.js not built yet, using the reference words)");
}
const data = { app, restaurants };
const demoAddCart = cartFrom(restaurants, [{ itemId: "r1i1", qty: 1 }]);
const ctx = {
  add: { cart: demoAddCart, itemId: "r1i1" },
  search: { query: "biryani", result: search(restaurants, "biryani", CONFIG.limits.searchMinChars) },
  order: { cart: cartFrom(restaurants, app.demoCart), orderNumber: 1 },
  track: { orderId: orderId(1, app.orders), shopId: demoShop }
};
for (const j of journeys) {
  const built = journeyValues(j.id, ctx[j.id], data, t);
  ok(same(built, j.demoValues), `journey ${j.id}`, `demoValues ${JSON.stringify(j.demoValues)} but the engine builds ${JSON.stringify(built)}`);
  ok(missingValues(j, built).length === 0, `journey ${j.id}`, "engine values are missing keys");
}

// ---------------------------------------------------------------- 5. Text in config
section("5. Settings text");
checkText("config", "whatsAppText", CONFIG.whatsAppText, { brands: [] });
ok(same(placeholders(CONFIG.whatsAppText).sort(), ["flows", "program"]), "config", "whatsAppText must use exactly {flows} and {program}");
checkText("config", "program.name", CONFIG.program.name, { brands: [] });
ok(CONFIG.speeds.includes(CONFIG.defaultSpeed), "config", "defaultSpeed must be one of speeds");
ok(CONFIG.salesWhatsApp === "" || /^\d{11,15}$/.test(CONFIG.salesWhatsApp), "config", "salesWhatsApp must be empty or 11 to 15 digits");

// ---------------------------------------------------------------- 6. Engine: fixed expected values
section("6. Engine against fixed expected values (PROJECT_BRIEF.md Section 10)");
function expect(label, actual, expected) {
  ok(same(actual, expected), label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
const F = app.fees;
const billOf = (list) => {
  const b = bill(cartFrom(restaurants, list), restaurants, F);
  return [b.itemTotal, b.delivery, b.platform, b.gst, b.total];
};
expect("bill demo cart [item, delivery, platform, gst, total]", billOf(app.demoCart), [328, 39, 5, 16, 388]);
expect("bill free delivery (r1i1 + r1i2)", billOf([{ itemId: "r1i1", qty: 1 }, { itemId: "r1i2", qty: 1 }]), [678, 0, 5, 34, 717]);
expect("bill GST rounds half up (r2i5 x2)", billOf([{ itemId: "r2i5", qty: 2 }]), [90, 39, 5, 5, 139]);
expect("bill empty cart", billOf([]), [0, 0, 0, 0, 0]);
expect("item count demo cart", itemCount(cartFrom(restaurants, app.demoCart)), 2);
expect("add from another restaurant", addItem(demoAddCart, restaurants, "r2i1").reason, "other-shop");
let tenCart = cartFrom(restaurants, [{ itemId: "r1i1", qty: 10 }]);
expect("add an 11th of one dish", addItem(tenCart, restaurants, "r1i1", CONFIG.limits.maxQtyPerItem).reason, "max-qty");
expect("remove the last dish empties the shop", removeItem(demoAddCart, "r1i1"), emptyCart());
const ids = (q) => search(restaurants, q, CONFIG.limits.searchMinChars).results.map((r) => r.id);
expect('search "biryani"', ids("biryani"), ["r1"]);
expect('search "  BIRYANI " (spaces and capitals)', ids("  BIRYANI "), ["r1"]);
expect('search "biry" (start of a word)', ids("biry"), ["r1"]);
expect('search "ani" (middle of a word)', ids("ani"), []);
expect('search "coffee"', ids("coffee"), ["r3", "r2"]);
expect('search "chicken"', ids("chicken"), ["r1", "r4", "r5"]);
expect('search "pepper chicken"', ids("pepper chicken"), ["r4"]);
expect('search "filter"', ids("filter"), ["r3", "r2"]);
expect('search "mylapore" (area)', ids("mylapore"), ["r3"]);
expect('search "South Indian" (category)', ids("South Indian"), ["r2", "r4"]);
expect('search "xyz"', ids("xyz"), []);
expect('search "b" is not active', search(restaurants, "b", CONFIG.limits.searchMinChars).active, false);
expect('search "coffee" dishes', search(restaurants, "coffee").results.map((r) => r.dishes), [["r3i4"], ["r2i5"]]);
expect("order number 1", orderId(1, app.orders), "TH-52001");
expect("order number 12", orderId(12, app.orders), "TH-52012");
expect("tracking minutes for 32", trackingEta(32), 19);
expect("tracking minutes for 18", trackingEta(18), 11);
expect("tracking minutes for 5", trackingEta(5), 4);
expect("money 0", formatINR(0), "₹0");
expect("money 388", formatINR(388), "₹388");
expect("money 1000", formatINR(1000), "₹1,000");
expect("money 100000", formatINR(100000), "₹1,00,000");
expect("money 1234567", formatINR(1234567), "₹12,34,567");
expect('fill "{total}" keeps the number', fill("{total}", { total: 388 }), 388);
expect('fill "Total {total}"', fill("Total {total}", { total: 388 }), "Total 388");
let threw = false;
try { fill("{nope}", {}); } catch { threw = true; }
expect("fill throws on a missing value", threw, true);
expect("journey ms at 1x [add, search, order, track]", journeys.map((j) => totalMs(j, 1)), [8000, 17600, 21000, 14000]);
expect("journey ms at 2x", journeys.map((j) => totalMs(j, 2)), [4000, 8800, 10500, 7000]);
expect("journey ms at 0.5x", journeys.map((j) => totalMs(j, 0.5)), [16000, 35200, 42000, 28000]);
expect("order hops (layer index per step)", hops(J.order, LAYERS).map((h) => h.to), [0, 2, 3, 3, 4, 3, 2, 1, 0]);
expect("order travel ms at 1x", hops(J.order, LAYERS).map((h) => travelMs(h.distance, 1)), [0, 460, 340, 0, 340, 340, 340, 340, 340]);
const orderSteps = prepare(J.order, LAYERS, J.order.demoValues, 1);
expect("order step 9 text", orderSteps[8].say, "Order TH-52001 is placed. Marina Biryani Co. is cooking, and it should reach you in about 32 minutes.");
expect("order step 5 database row", orderSteps[4].db.row, ["TH-52001", "Marina Biryani Co.", 388, "PLACED"]);
expect("order step 3 packet", orderSteps[2].packet.data, { loggedIn: true, shopOpen: true, total: 388 });

// ---------------------------------------------------------------- Result
console.log(`\n${passes} checks passed, ${failures} failed.`);
console.log(failures ? `RESULT: ${failures} FAIL` : "RESULT: ALL PASS");
process.exit(failures ? 1 : 0);
