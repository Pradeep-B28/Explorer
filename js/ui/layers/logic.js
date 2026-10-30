// Renders the Logic layer with Event-State-Render nodes and formatted stateSnapshot JSON.
// UPGRADE_BRIEF.md Section 7: Logic card.
// Uses stateSnapshot from the app module and standard DOM APIs.
// Used by ui/split.js.

import { stateSnapshot } from "../../apps/foodzy/index.js";

/**
 * Creates and mounts the Logic layer component.
 * @param {HTMLElement} container
 * @returns {{ pulseNodes: (callback?: () => void) => void, updateState: () => void }}
 */
export function createLogicLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-logic-content";

  // Nodes Row Container (Event -> State -> Render)
  const nodesWrapper = document.createElement("div");
  nodesWrapper.className = "logic-nodes-wrapper";

  const NODES = [
    { id: "event", name: "Event" },
    { id: "state", name: "State" },
    { id: "render", name: "Render" }
  ];

  const nodeElements = [];

  NODES.forEach((n, idx) => {
    const nodeEl = document.createElement("div");
    nodeEl.className = `logic-node node-${n.id}`;

    const dot = document.createElement("span");
    dot.className = "logic-node-dot";

    const label = document.createElement("strong");
    label.className = "logic-node-name";
    label.textContent = n.name;

    nodeEl.appendChild(dot);
    nodeEl.appendChild(label);
    nodesWrapper.appendChild(nodeEl);
    nodeElements.push(nodeEl);

    if (idx < NODES.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "logic-arrow";
      arrow.textContent = "→";
      arrow.setAttribute("aria-hidden", "true");
      nodesWrapper.appendChild(arrow);
    }
  });

  root.appendChild(nodesWrapper);

  // State Readout Box (Indented JSON)
  const stateCard = document.createElement("div");
  stateCard.className = "logic-state-card";

  const stateHeader = document.createElement("div");
  stateHeader.className = "logic-state-header";
  const statusDot = document.createElement("span");
  statusDot.className = "logic-status-dot";
  const statusLabel = document.createElement("span");
  statusLabel.className = "logic-status-label";
  statusLabel.textContent = "State Snapshot";
  stateHeader.appendChild(statusDot);
  stateHeader.appendChild(statusLabel);
  stateCard.appendChild(stateHeader);

  const jsonPre = document.createElement("pre");
  jsonPre.className = "logic-state-json";
  stateCard.appendChild(jsonPre);

  root.appendChild(stateCard);
  container.replaceChildren(root);

  let prevSnapshot = null;

  /**
   * Renders the current state snapshot with highlighting for changed keys.
   */
  function updateState() {
    let current;
    try {
      current = stateSnapshot();
    } catch (e) {
      current = {};
    }

    // Determine changed top-level or second-level keys
    const changedKeys = new Set();
    if (prevSnapshot) {
      for (const [k, v] of Object.entries(current)) {
        if (typeof v === "object" && v !== null && typeof prevSnapshot[k] === "object" && prevSnapshot[k] !== null) {
          for (const [subK, subV] of Object.entries(v)) {
            if (subV !== prevSnapshot[k][subK]) {
              changedKeys.add(subK);
              changedKeys.add(k);
            }
          }
        } else if (v !== prevSnapshot[k]) {
          changedKeys.add(k);
        }
      }
    }
    prevSnapshot = JSON.parse(JSON.stringify(current));

    // Render formatted JSON lines
    jsonPre.replaceChildren();
    const raw = JSON.stringify(current, null, 2);
    const lines = raw.split("\n");

    lines.forEach((line) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "logic-json-line";

      // Check if line contains a changed key
      let isChanged = false;
      for (const k of changedKeys) {
        if (line.includes(`"${k}":`)) {
          isChanged = true;
          break;
        }
      }

      lineDiv.textContent = line;
      if (isChanged) {
        lineDiv.classList.add("flash-key");
        setTimeout(() => lineDiv.classList.remove("flash-key"), 600);
      }
      jsonPre.appendChild(lineDiv);
    });
  }

  /**
   * Pulses the three nodes sequentially (150 ms apart), updates snapshot, and flashes changed keys.
   * @param {() => void} [callback]
   */
  function pulseNodes(callback) {
    nodeElements.forEach((el) => el.classList.remove("active"));

    // Node 0: Event
    nodeElements[0].classList.add("active");

    // Node 1: State (150 ms)
    setTimeout(() => {
      nodeElements[0].classList.remove("active");
      nodeElements[1].classList.add("active");
      updateState();
    }, 150);

    // Node 2: Render (300 ms)
    setTimeout(() => {
      nodeElements[1].classList.remove("active");
      nodeElements[2].classList.add("active");
    }, 300);

    setTimeout(() => {
      nodeElements[2].classList.remove("active");
      if (typeof callback === "function") callback();
    }, 450);
  }

  // Initial render
  updateState();

  return {
    element: root,
    pulseNodes,
    updateState
  };
}
