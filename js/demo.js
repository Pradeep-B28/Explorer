// Manages Demo mode (?demo=1) and Presenter mode (?present=1).
// Uses config.js, events.js, and content.js.
// Used by main.js.

import { CONFIG } from "../config.js";
import { getJourneys } from "./content.js";
import { on } from "./events.js";

/**
 * Checks if demo mode is enabled in URL and config.
 * @returns {boolean}
 */
export function isDemoMode() {
  if (typeof window === "undefined") return false;
  const p = new URLSearchParams(window.location.search);
  return p.get("demo") === "1" && Boolean(CONFIG.features.demoMode);
}

/**
 * Checks if presenter mode is enabled in URL and config.
 * @returns {boolean}
 */
export function isPresenterMode() {
  if (typeof window === "undefined") return false;
  const p = new URLSearchParams(window.location.search);
  return p.get("present") === "1" && Boolean(CONFIG.features.presenterMode);
}

/**
 * Initializes Demo Mode runner with deterministic state and timing.
 */
export function initDemoMode() {
  window.__demoMode = true;
  document.body.classList.add("mode-demo");

  // Add small Wrench Wise logo in top-left corner
  const logo = document.createElement("div");
  logo.className = "demo-corner-logo";
  const img = document.createElement("img");
  img.src = "assets/logo.png";
  img.alt = "Wrench Wise";
  logo.appendChild(img);
  document.body.appendChild(logo);

  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get("theme");
  if (themeParam === "dark" || themeParam === "light") {
    document.documentElement.setAttribute("data-theme", themeParam);
  }

  // Parse flows
  const flowParam = params.get("flow") || "order";
  const allJourneys = getJourneys("Foodzy");
  let flowsToRun = [];

  if (flowParam === "all") {
    flowsToRun = allJourneys.map((j) => j.id);
  } else {
    flowsToRun = flowParam.split(",").map((s) => s.trim()).filter(Boolean);
  }

  // Deterministic state setup
  if (window.__foodzyState) {
    window.__foodzyState.resetOrderState();
    if (flowsToRun[0] === "order") {
      window.__foodzyState.loadDemoCart();
      window.__foodzyState.navigate("cart");
    }
  }

  // Sequence runner:
  // 1. Flat app for 1.5s
  // 2. Visible press on "Show me how it works" button (200ms)
  // 3. Explode and intro hold
  // 4. Run each flow via Do it for me with 1s gap between flows
  // 5. Flow lesson for 2s
  // 6. Final CTA card stays
  setTimeout(() => {
    const explodeBtn = document.querySelector(".stage-explode-btn");
    if (explodeBtn) {
      explodeBtn.classList.add("btn-pressed");
      setTimeout(() => {
        explodeBtn.classList.remove("btn-pressed");
        explodeBtn.click();

        // Wait for explode & intro (approx 1.5s total)
        setTimeout(() => {
          runFlowSequence(flowsToRun, 0);
        }, 1500);
      }, 200);
    }
  }, 1500);
}

function runFlowSequence(flows, index) {
  if (index >= flows.length) return;

  const flowId = flows[index];
  const allJourneys = getJourneys("Foodzy");
  const journey = allJourneys.find((j) => j.id === flowId);
  if (!journey) return;

  // Trigger Do It For Me
  const doitBtns = document.querySelectorAll(".panel-doit-btn");
  const flowIndex = allJourneys.findIndex((j) => j.id === flowId);
  if (doitBtns[flowIndex]) {
    doitBtns[flowIndex].click();
  }

  // Listen for flow complete
  const handleComplete = (payload) => {
    if (payload.flow !== flowId) return;

    // Lesson shows for 2s
    setTimeout(() => {
      if (index + 1 < flows.length) {
        // More flows to run: wait 1s between flows
        const tryAnotherBtn = document.querySelector(".panel-try-another-btn");
        if (tryAnotherBtn) tryAnotherBtn.click();
        setTimeout(() => {
          runFlowSequence(flows, index + 1);
        }, 1000);
      }
    }, 2000);
  };

  on("flow_complete", handleComplete);
}

/**
 * Initializes Presenter Mode and keyboard shortcuts.
 */
export function initPresenterMode() {
  window.__presenterMode = true;
  document.body.classList.add("mode-presenter");

  // Keys 1 to 4 start flows with "Do it for me"
  window.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      return;
    }

    const key = e.key;
    const allJourneys = getJourneys("Foodzy");
    const doitBtns = document.querySelectorAll(".panel-doit-btn");

    if (["1", "2", "3", "4"].includes(key)) {
      const idx = parseInt(key, 10) - 1;
      if (doitBtns[idx]) {
        e.preventDefault();
        doitBtns[idx].click();
      }
    } else if (key === "?") {
      e.preventDefault();
      toggleKeyboardMap();
    }
  });
}

/**
 * Toggles a help dialog showing keyboard shortcuts.
 */
export function toggleKeyboardMap() {
  let modal = document.getElementById("keyboard-map-modal");
  if (modal) {
    modal.remove();
    return;
  }

  modal = document.createElement("div");
  modal.id = "keyboard-map-modal";
  modal.className = "keyboard-map-modal";

  const card = document.createElement("div");
  card.className = "keyboard-map-card";

  const title = document.createElement("h3");
  title.className = "keyboard-map-title";
  title.textContent = "Keyboard Shortcuts";

  const list = document.createElement("ul");
  list.className = "keyboard-map-list";

  const shortcuts = [
    { key: "Space", desc: "Play / Pause active flow" },
    { key: "→ / ←", desc: "Next / Previous step" },
    { key: "Esc", desc: "Close active flow" },
    { key: "1 - 4", desc: "Start flow (Presenter mode)" },
    { key: "?", desc: "Show / hide shortcuts" }
  ];

  shortcuts.forEach((sc) => {
    const li = document.createElement("li");
    li.className = "keyboard-map-item";
    li.innerHTML = `<kbd class="keyboard-key">${sc.key}</kbd><span>${sc.desc}</span>`;
    list.appendChild(li);
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "keyboard-map-close";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => modal.remove());

  card.appendChild(title);
  card.appendChild(list);
  card.appendChild(closeBtn);
  modal.appendChild(card);
  document.body.appendChild(modal);
}
