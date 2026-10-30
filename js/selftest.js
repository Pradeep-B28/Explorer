// Runs self-test checks a to q and displays results table for ?test=1.
// Uses content.js, copy.js, links.js, store.js, progress.js, player.js, and engine.
// Used by main.js, index.html (?test=1), and test verification.

import { LAYERS, APPS, APP_CONTENT, getAppContent, getLayers, getJourneys } from "./content.js";
import { COPY, t } from "./copy.js";
import { bill, cartFrom, itemCount, addItem, removeItem, emptyCart } from "./engine/foodzy/cart.js";
import { search } from "./engine/foodzy/search.js";
import { orderId, trackingEta } from "./engine/foodzy/orders.js";
import { formatINR } from "./engine/money.js";
import { journeyValues, cartBarLabel } from "./engine/foodzy/values.js";
import { hops, totalMs, travelMs, prepare, latestCodeByLayer } from "./engine/journey.js";
import { layoutFor, rowGeometry } from "./engine/layout.js";
import { mount as mountFoodzy } from "./apps/foodzy/index.js";
import { addCartItem, clearCart as clearFoodzyCart } from "./apps/foodzy/state.js";
import { Player } from "./player.js";
import { getWhatsAppLink, getProgramLink } from "./links.js";
import { setStorageOverride } from "./store.js";
import { markFlowWatched, isFlowWatched, clearProgress } from "./progress.js";

const DASHES = /[\u2012\u2013\u2014\u2015]/;
const EMOJI = /(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}/u;
const BANNED = [
  "guarantee", "placement", "salary", "lakh", "get hired", "seats left",
  "take your job", "replace you", "stupid", "dumb", "idiot", "noob", "loser", "useless"
];

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export class FakeClock {
  constructor() {
    this.time = 0;
    this.timerId = 1;
    this.timers = new Map();
  }
  now() {
    return this.time;
  }
  setTimeout(fn, delay) {
    const id = this.timerId++;
    this.timers.set(id, { due: this.time + delay, fn });
    return id;
  }
  clearTimeout(id) {
    this.timers.delete(id);
  }
  advance(ms) {
    const target = this.time + ms;
    while (this.time < target) {
      let nextTimer = null;
      let nextId = null;
      for (const [id, t] of this.timers) {
        if (t.due <= target && (!nextTimer || t.due < nextTimer.due)) {
          nextTimer = t;
          nextId = id;
        }
      }
      if (!nextTimer) {
        this.time = target;
        break;
      }
      this.time = nextTimer.due;
      this.timers.delete(nextId);
      nextTimer.fn();
    }
  }
}

export function runSelfTest() {
  const results = [];
  function check(id, name, pass, expected, actual) {
    results.push({ id, name, pass: Boolean(pass), expected, actual });
  }

  const { app, restaurants, journeys } = getAppContent("foodzy");

  // Check a: Content
  const totalDishes = restaurants.reduce((n, r) => n + r.menu.length, 0);
  const liveApps = APPS.filter((a) => a.status === "live");
  const journeyIds = journeys.map((j) => j.id);
  const actualA = {
    liveApp: liveApps.length === 1 ? liveApps[0].id : null,
    layers: LAYERS.length,
    apps: APPS.length,
    liveApps: liveApps.length,
    restaurants: restaurants.length,
    dishes: totalDishes,
    journeys: journeyIds
  };
  const expectedA = {
    liveApp: "foodzy",
    layers: 5,
    apps: 4,
    liveApps: 1,
    restaurants: 6,
    dishes: 31,
    journeys: ["add", "search", "order", "track"]
  };
  check("a", "Content", same(actualA, expectedA), expectedA, actualA);

  // Check b: Words
  const b1 = t("cart.bar", { n: 1, total: "₹289" });
  const b2 = t("cart.bar", { n: 3, total: "₹520" });
  const b3 = t("search.count", { n: 1 });
  const b4 = t("search.count", { n: 3 });
  const actualB = [b1, b2, b3, b4];
  const expectedB = ["1 item, ₹289", "3 items, ₹520", "1 restaurant", "3 restaurants"];
  check("b", "Words", same(actualB, expectedB), expectedB, actualB);

  // Check c: Bills
  const F = app.fees;
  const billOf = (list) => {
    const b = bill(cartFrom(restaurants, list), restaurants, F);
    return [b.itemTotal, b.delivery, b.platform, b.gst, b.total];
  };
  const c1 = billOf(app.demoCart);
  const c2 = billOf([{ itemId: "r1i1", qty: 1 }, { itemId: "r1i2", qty: 1 }]);
  const c3 = billOf([{ itemId: "r2i5", qty: 2 }]);
  const c4 = billOf([]);
  const actualC = [c1, c2, c3, c4];
  const expectedC = [
    [328, 39, 5, 16, 388],
    [678, 0, 5, 34, 717],
    [90, 39, 5, 5, 139],
    [0, 0, 0, 0, 0]
  ];
  check("c", "Bills", same(actualC, expectedC), expectedC, actualC);

  // Check d: Cart rules
  const demoAddCart = cartFrom(restaurants, [{ itemId: "r1i1", qty: 1 }]);
  const d1 = addItem(demoAddCart, restaurants, "r2i1").reason;
  const tenCart = cartFrom(restaurants, [{ itemId: "r1i1", qty: 10 }]);
  const d2 = addItem(tenCart, restaurants, "r1i1", 10).reason;
  const d3 = removeItem(demoAddCart, "r1i1").shopId;
  const actualD = [d1, d2, d3];
  const expectedD = ["other-shop", "max-qty", null];
  check("d", "Cart rules", same(actualD, expectedD), expectedD, actualD);

  // Check e: Search
  const ids = (q) => search(restaurants, q, 2).results.map((r) => r.id);
  const e1 = ids("biryani");
  const e2 = ids("  BIRYANI ");
  const e3 = ids("biry");
  const e4 = ids("ani");
  const e5 = ids("coffee");
  const e6 = ids("chicken");
  const e7 = ids("pepper chicken");
  const e8 = ids("filter");
  const e9 = ids("mylapore");
  const e10 = ids("South Indian");
  const e11 = ids("xyz");
  const e12Active = search(restaurants, "b", 2).active;
  const actualE = [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12Active];
  const expectedE = [
    ["r1"], ["r1"], ["r1"], [], ["r3", "r2"],
    ["r1", "r4", "r5"], ["r4"], ["r3", "r2"], ["r3"], ["r2", "r4"], [], false
  ];
  check("e", "Search", same(actualE, expectedE), expectedE, actualE);

  // Check f: Numbers
  const f1 = orderId(1, app.orders);
  const f2 = orderId(12, app.orders);
  const f3 = trackingEta(32);
  const f4 = trackingEta(18);
  const f5 = trackingEta(5);
  const f6 = formatINR(0);
  const f7 = formatINR(388);
  const f8 = formatINR(1000);
  const f9 = formatINR(100000);
  const f10 = formatINR(1234567);
  const actualF = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10];
  const expectedF = ["FZ-52001", "FZ-52012", 19, 11, 4, "₹0", "₹388", "₹1,000", "₹1,00,000", "₹12,34,567"];
  check("f", "Numbers", same(actualF, expectedF), expectedF, actualF);

  // Check g: Journey values
  const demoShop = restaurants[0].id;
  const ctx = {
    add: { cart: demoAddCart, itemId: "r1i1" },
    search: { query: "biryani", result: search(restaurants, "biryani", 2) },
    order: { cart: cartFrom(restaurants, app.demoCart), orderNumber: 1 },
    track: { orderId: orderId(1, app.orders), shopId: demoShop }
  };
  const addValues = journeyValues("add", ctx.add, { app, restaurants }, t);
  const gMatches = journeys.map((j) => {
    const built = journeyValues(j.id, ctx[j.id], { app, restaurants }, t);
    return same(built, j.demoValues);
  });
  const actualG = [...gMatches, addValues.priceLabel];
  const expectedG = [true, true, true, true, "₹289"];
  check("g", "Journey values", same(actualG, expectedG), expectedG, actualG);

  // Check h: Journey timing
  const J = Object.fromEntries(journeys.map((j) => [j.id, j]));
  const h1 = journeys.map((j) => totalMs(j, 1));
  const h2 = journeys.map((j) => totalMs(j, 2));
  const h3 = hops(J.order, LAYERS).map((h) => h.to);
  const h4 = hops(J.order, LAYERS).map((h) => travelMs(h.distance, 1));
  const actualH = [h1, h2, h3, h4];
  const expectedH = [
    [8000, 17600, 21000, 14000],
    [4000, 8800, 10500, 7000],
    [0, 2, 3, 3, 4, 3, 2, 1, 0],
    [0, 460, 340, 0, 340, 340, 340, 340, 340]
  ];
  check("h", "Journey timing", same(actualH, expectedH), expectedH, actualH);

  // Check i: Step text
  const orderSteps = prepare(J.order, LAYERS, J.order.demoValues, 1);
  const i1 = orderSteps[8].say;
  const i2 = orderSteps[4].db.row;
  const actualI = [i1, i2];
  const expectedI = [
    "Order FZ-52001 is placed. Marina Biryani Co. is cooking, and it should reach you in about 32 minutes.",
    ["FZ-52001", "Marina Biryani Co.", 388, "PLACED"]
  ];
  check("i", "Step text", same(actualI, expectedI), expectedI, actualI);

  // Check j: Player (with fake clock)
  const clockA = new FakeClock();
  const commitTimesA = [];
  const playerA = new Player({
    journey: J.order,
    layers: LAYERS,
    values: J.order.demoValues,
    speed: 2,
    clock: clockA,
    commit: () => commitTimesA.push(clockA.now())
  });
  playerA.start();
  clockA.advance(10500);

  const j1CommitCount = commitTimesA.length;
  const j1CommitTime = commitTimesA[0];
  const j1Ended = playerA.isEnded;
  const j1Step = playerA.currentStepIndex + 1;

  const clockB = new FakeClock();
  const commitTimesB = [];
  const playerB = new Player({
    journey: J.order,
    layers: LAYERS,
    values: J.order.demoValues,
    speed: 2,
    clock: clockB,
    commit: () => commitTimesB.push(clockB.now())
  });
  playerB.start();
  clockB.advance(3000);
  playerB.pause();
  const j2StepAtPause = playerB.currentStepIndex + 1;
  clockB.advance(5000);
  const j2StepAfterWait = playerB.currentStepIndex + 1;

  const actualJ = [j1CommitCount, j1CommitTime, j1Ended, j1Step, j2StepAtPause, j2StepAfterWait];
  const expectedJ = [1, 8400, true, 9, 3, 3];
  check("j", "Player", same(actualJ, expectedJ), expectedJ, actualJ);

  // Check k: Links
  const waUrl = getWhatsAppLink(["Place an order"], "919876543210");
  const waPrefix = "https://wa.me/919876543210?text=";
  const waPrefixMatch = waUrl && waUrl.startsWith(waPrefix);
  const waDecoded = waUrl ? decodeURIComponent(waUrl.substring(waPrefix.length)) : "";
  const waEmpty = getWhatsAppLink(["Place an order"], "");
  const progLink = getProgramLink("cta");
  const actualK = [
    waPrefixMatch,
    waDecoded,
    waEmpty,
    progLink
  ];
  const expectedK = [
    true,
    "Hi, I tried Explorer and watched: Place an order. I want to know more about the Certification Program in AI-Powered Full Stack Development.",
    null,
    "https://wrench-wise.com/?utm_source=exploded-app&utm_medium=web-project&utm_campaign=exploded-app&utm_content=cta"
  ];
  check("k", "Links", same(actualK, expectedK), expectedK, actualK);

  // Check l: Storage blocked
  const throwingStorage = {
    getItem() { throw new Error("Blocked"); },
    setItem() { throw new Error("Blocked"); },
    removeItem() { throw new Error("Blocked"); }
  };
  setStorageOverride(throwingStorage);
  clearProgress();
  markFlowWatched("order");
  const lWatched = isFlowWatched("order");
  setStorageOverride(null);
  check("l", "Storage blocked", lWatched === true, true, lWatched);

  // Check m: Text
  let textViolations = 0;
  for (const [key, str] of Object.entries(COPY)) {
    if (typeof str !== "string") { textViolations++; continue; }
    if (DASHES.test(str)) textViolations++;
    if (EMOJI.test(str)) textViolations++;
    const lower = str.toLowerCase();
    for (const b of BANNED) {
      if (lower.includes(b)) textViolations++;
    }
  }
  check("m", "Text", textViolations === 0, 0, textViolations);

  // Check n: Cart bar (UPGRADE_BRIEF.md Section 15 check n)
  const n1 = cartBarLabel(demoAddCart, { app, restaurants }, t);
  const n2 = cartBarLabel(cartFrom(restaurants, app.demoCart), { app, restaurants }, t);
  let n3Contains = false;
  if (typeof document !== "undefined") {
    const testContainer = document.createElement("div");
    testContainer.id = "phone-screen";
    testContainer.style.display = "none";
    document.body.appendChild(testContainer);
    clearFoodzyCart();
    const inst = mountFoodzy(testContainer);
    addCartItem("r1i1");
    const barTextEl = testContainer.querySelector(".cart-bar-text");
    const barText = barTextEl ? barTextEl.textContent : "";
    n3Contains = barText.includes("1 item, ₹289");
    clearFoodzyCart();
    if (inst && typeof inst.unmount === "function") inst.unmount();
    testContainer.remove();
  } else {
    n3Contains = true;
  }
  const actualN = [n1, n2, n3Contains];
  const expectedN = ["1 item, ₹289", "2 items, ₹328", true];
  check("n", "Cart bar", same(actualN, expectedN), expectedN, actualN);

  // Check o: Code per layer (UPGRADE_BRIEF.md Section 15 check o)
  const latestFull = latestCodeByLayer(orderSteps, LAYERS, orderSteps.length - 1);
  const o1 = LAYERS.map((l) => latestFull[l.id] && latestFull[l.id].code.file);
  const latest4 = latestCodeByLayer(orderSteps, LAYERS, 3);
  const o2 = LAYERS.map((l) => latest4[l.id] ? latest4[l.id].id : null);
  const o3 = journeys.map((j) => j.steps.reduce((n, st) => n + st.code.lines.length, 0));
  const actualO = [o1, o2, o3];
  const expectedO = [
    ["public/order.html", "public/styles/order.css", "public/js/checkout.js", "server/routes/orders.js", "db/orders.sql"],
    ["order-1", null, "order-2", "order-4", null],
    [40, 87, 102, 68]
  ];
  check("o", "Code per layer", same(actualO, expectedO), expectedO, actualO);

  // Check p: Layout (UPGRADE_BRIEF.md Section 15 check p)
  const geo = (w, h) => {
    const g = rowGeometry(w, h);
    return [layoutFor(w, h), g.compact, g.rowHeight, g.phoneScale, g.screenWidth, g.cardWidth];
  };
  const actualP = [
    geo(1920, 1080),
    geo(1536, 864),
    geo(1440, 900),
    geo(1366, 768),
    layoutFor(1024, 768),
    layoutFor(1100, 660),
    layoutFor(390, 844)
  ];
  const expectedP = [
    ["laptop", false, 620, 0.768, 276, 301],
    ["laptop", false, 420, 0.505, 182, 288],
    ["laptop", false, 456, 0.553, 199, 260],
    ["laptop", true, 384, 0.458, 165, 250],
    "phone",
    "phone",
    "phone"
  ];
  check("p", "Layout", same(actualP, expectedP), expectedP, actualP);

  // Check q: No sideways scroll (UPGRADE_BRIEF.md Section 15 check q)
  const noScroll = typeof document !== "undefined"
    ? document.documentElement.scrollWidth <= window.innerWidth
    : true;
  check("q", "No sideways scroll", noScroll, true, noScroll);

  const passes = results.filter((r) => r.pass).length;
  const failures = results.filter((r) => !r.pass).length;
  return { passes, failures, results };
}

/**
 * Renders the self-test table into the DOM container.
 * @param {HTMLElement} container
 */
export function renderSelfTestDOM(container) {
  const { passes, failures, results } = runSelfTest();

  // Create table safely using DOM nodes (Hard Rule 11: no innerHTML with changing values)
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "max-width: 1200px; width: 100%; margin: 2rem auto; padding: 1.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-card); font-family: var(--font-sans); box-shadow: var(--shadow-lg);";

  const title = document.createElement("h1");
  title.textContent = "Explorer Self-Test Results";
  title.style.cssText = "font-size: 1.5rem; margin-bottom: 1rem; text-align: left;";
  wrapper.appendChild(title);

  const tableWrapper = document.createElement("div");
  tableWrapper.style.cssText = "overflow-x: auto; width: 100%;";

  const table = document.createElement("table");
  table.style.cssText = "width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem; table-layout: fixed;";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.style.borderBottom = "2px solid var(--border)";
  [
    { text: "Check", width: "16%" },
    { text: "Expected", width: "37%" },
    { text: "Actual", width: "37%" },
    { text: "Status", width: "10%" }
  ].forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.text;
    th.style.padding = "0.75rem 0.5rem";
    th.style.width = col.width;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  results.forEach((r) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid var(--border)";

    const tdName = document.createElement("td");
    tdName.style.padding = "0.6rem 0.5rem";
    tdName.style.fontWeight = "600";
    tdName.style.wordBreak = "break-word";
    tdName.textContent = `${r.id}. ${r.name}`;

    const tdExpected = document.createElement("td");
    tdExpected.style.padding = "0.6rem 0.5rem";
    tdExpected.style.fontFamily = "var(--font-mono)";
    tdExpected.style.fontSize = "0.75rem";
    tdExpected.style.wordBreak = "break-word";
    tdExpected.textContent = typeof r.expected === "object" ? JSON.stringify(r.expected) : String(r.expected);

    const tdActual = document.createElement("td");
    tdActual.style.padding = "0.6rem 0.5rem";
    tdActual.style.fontFamily = "var(--font-mono)";
    tdActual.style.fontSize = "0.75rem";
    tdActual.style.wordBreak = "break-word";
    tdActual.textContent = typeof r.actual === "object" ? JSON.stringify(r.actual) : String(r.actual);

    const tdStatus = document.createElement("td");
    tdStatus.style.padding = "0.6rem 0.5rem";
    tdStatus.style.fontWeight = "700";
    tdStatus.style.color = r.pass ? "var(--brand)" : "var(--warn)";
    tdStatus.textContent = r.pass ? "PASS" : "FAIL";

    row.appendChild(tdName);
    row.appendChild(tdExpected);
    row.appendChild(tdActual);
    row.appendChild(tdStatus);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  wrapper.appendChild(tableWrapper);

  const summary = document.createElement("div");
  summary.style.cssText = "margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius-card); font-weight: 700; font-size: 1.1rem; text-align: center;";
  if (failures === 0) {
    summary.style.background = "var(--brand-soft)";
    summary.style.color = "var(--brand-strong)";
    summary.textContent = `RESULT: ALL PASS (${passes} checks passed)`;
  } else {
    summary.style.background = "#FEE2E2";
    summary.style.color = "#991B1B";
    summary.textContent = `RESULT: ${failures} FAIL (${passes} passed)`;
  }
  wrapper.appendChild(summary);

  container.replaceChildren(wrapper);
}
