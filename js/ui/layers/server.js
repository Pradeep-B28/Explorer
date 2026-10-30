// Renders the Server layer with API routes list and typed request log.
// UPGRADE_BRIEF.md Section 7: Server card.
// Uses app.api from content and copy.js.
// Used by ui/split.js.

import { getAppContent } from "../../content.js";
import { t } from "../../copy.js";
import { prefersReducedMotion } from "../../motion.js";

/**
 * Creates and mounts the Server layer component.
 * @param {HTMLElement} container
 * @returns {{ addLog: (line: string) => Promise<void>, highlightRoute: (routeId: string) => void, reset: () => void }}
 */
export function createServerLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-server-content";

  const { app } = getAppContent("foodzy") || {};
  const routes = app?.api || [
    { id: "search", method: "GET", path: "/api/restaurants" },
    { id: "orders", method: "POST", path: "/api/orders" },
    { id: "location", method: "POST", path: "/api/riders/location" },
    { id: "updates", method: "WS", path: "order:update" }
  ];

  // 1. Routes List Section
  const routesSection = document.createElement("div");
  routesSection.className = "server-routes-section";

  const routesHeader = document.createElement("div");
  routesHeader.className = "server-routes-header";
  routesHeader.textContent = "Routes";
  routesSection.appendChild(routesHeader);

  const routesList = document.createElement("div");
  routesList.className = "server-routes-list";

  const routeElements = {};

  routes.forEach((r) => {
    const item = document.createElement("div");
    item.className = "server-route-item";
    item.setAttribute("data-route-id", r.id);

    const chip = document.createElement("span");
    chip.className = `server-method-chip method-${r.method.toLowerCase()}`;
    chip.textContent = r.method;

    const pathEl = document.createElement("span");
    pathEl.className = "server-route-path";
    pathEl.textContent = r.path;

    item.appendChild(chip);
    item.appendChild(pathEl);
    routesList.appendChild(item);
    routeElements[r.id] = item;
  });

  routesSection.appendChild(routesList);
  root.appendChild(routesSection);

  // 2. Terminal Window Chrome & Request Log
  const terminal = document.createElement("div");
  terminal.className = "server-terminal";

  const windowBar = document.createElement("div");
  windowBar.className = "server-window-bar";

  const dots = document.createElement("div");
  dots.className = "server-window-dots";
  ["red", "yellow", "green"].forEach((color) => {
    const dot = document.createElement("span");
    dot.className = `server-dot dot-${color}`;
    dots.appendChild(dot);
  });

  const title = document.createElement("span");
  title.className = "server-window-title";
  title.textContent = "Request Log";

  windowBar.appendChild(dots);
  windowBar.appendChild(title);
  terminal.appendChild(windowBar);

  const termBody = document.createElement("div");
  termBody.className = "server-terminal-body";
  terminal.appendChild(termBody);
  root.appendChild(terminal);

  const lines = [];

  function getTimestamp() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `[${h}:${m}:${s}]`;
  }

  function renderLines() {
    termBody.replaceChildren();
    // Keep last 5 lines (Section 7)
    lines.slice(-5).forEach((item) => {
      const lineEl = document.createElement("div");
      lineEl.className = "server-log-line";

      const timeEl = document.createElement("span");
      timeEl.className = "server-log-time";
      timeEl.textContent = item.time;

      const msgEl = document.createElement("span");
      msgEl.className = "server-log-msg";
      msgEl.textContent = " " + item.text;

      lineEl.appendChild(timeEl);
      lineEl.appendChild(msgEl);
      termBody.appendChild(lineEl);
    });
  }

  function reset() {
    lines.length = 0;
    lines.push(
      { time: "[10:42:00]", text: t("foodzy.serverReady") },
      { time: "[10:42:01]", text: t("foodzy.serverWaiting") }
    );
    renderLines();
    // Clear active route highlight
    Object.values(routeElements).forEach((el) => el.classList.remove("active"));
  }

  /**
   * Highlights the active route.
   * @param {string} routeId
   */
  function highlightRoute(routeId) {
    Object.entries(routeElements).forEach(([id, el]) => {
      if (id === routeId) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  /**
   * Types in a new log line.
   * @param {string} text
   * @returns {Promise<void>}
   */
  async function addLog(text) {
    if (!text) return;
    const time = getTimestamp();
    const entry = { time, text: "" };
    lines.push(entry);
    renderLines();

    if (prefersReducedMotion()) {
      entry.text = text;
      renderLines();
      return;
    }

    // Type in text at 12ms per char
    const chars = text.split("");
    for (let i = 0; i < chars.length; i++) {
      entry.text += chars[i];
      renderLines();
      await new Promise((r) => setTimeout(r, 12));
    }
  }

  reset();
  container.replaceChildren(root);

  return {
    addLog,
    highlightRoute,
    reset
  };
}
