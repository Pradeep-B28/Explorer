// Renders the Logic layer with Event-State-Render nodes and a live state readout.
// Uses stateLine from the app module and standard DOM APIs.
// Used by ui/exploded.js.

import { stateLine } from "../../apps/Foodzy/index.js";

/**
 * Creates and mounts the Logic layer component.
 * @param {HTMLElement} container
 * @returns {{ pulseNodes: (callback?: () => void) => void, updateReadout: (text?: string) => void }}
 */
export function createLogicLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-logic-content";

  // Header
  const header = document.createElement("div");
  header.className = "logic-header";
  const title = document.createElement("span");
  title.className = "logic-title";
  title.textContent = "Application Runtime";
  header.appendChild(title);
  root.appendChild(header);

  // Nodes Row Container
  const nodesWrapper = document.createElement("div");
  nodesWrapper.className = "logic-nodes-wrapper";

  const NODES = [
    { id: "event", name: "Event", sub: "User Action" },
    { id: "state", name: "State", sub: "Data Store" },
    { id: "render", name: "Render", sub: "DOM Refresh" }
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

    const sub = document.createElement("span");
    sub.className = "logic-node-sub";
    sub.textContent = n.sub;

    nodeEl.appendChild(dot);
    nodeEl.appendChild(label);
    nodeEl.appendChild(sub);
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

  // State Readout Box
  const readoutCard = document.createElement("div");
  readoutCard.className = "logic-readout-card";

  const readoutHeader = document.createElement("div");
  readoutHeader.className = "logic-readout-header";
  const statusDot = document.createElement("span");
  statusDot.className = "logic-status-dot";
  const statusLabel = document.createElement("span");
  statusLabel.className = "logic-status-label";
  statusLabel.textContent = "Current State Snapshot";
  readoutHeader.appendChild(statusDot);
  readoutHeader.appendChild(statusLabel);
  readoutCard.appendChild(readoutHeader);

  const readoutText = document.createElement("div");
  readoutText.className = "logic-readout-text";
  readoutText.textContent = stateLine();
  readoutCard.appendChild(readoutText);

  root.appendChild(readoutCard);

  // Architecture Callout
  const notesCard = document.createElement("div");
  notesCard.className = "logic-notes-card";

  const noteHeading = document.createElement("h4");
  noteHeading.className = "logic-notes-heading";
  noteHeading.textContent = "Unidirectional Flow";

  const noteP = document.createElement("p");
  noteP.className = "logic-notes-p";
  noteP.textContent = "UI actions trigger events, handlers update local state, and reactive subscribers re-render the screen without page reloads.";

  notesCard.appendChild(noteHeading);
  notesCard.appendChild(noteP);
  root.appendChild(notesCard);

  container.replaceChildren(root);

  /**
   * Updates the state readout line.
   * @param {string} [customText]
   */
  function updateReadout(customText) {
    readoutText.textContent = customText || stateLine();
  }

  /**
   * Pulses the three nodes sequentially (150 ms apart) and updates state readout.
   * @param {() => void} [callback]
   */
  function pulseNodes(callback) {
    nodeElements.forEach(el => el.classList.remove("active"));

    // Node 0: Event
    nodeElements[0].classList.add("active");

    // Node 1: State
    setTimeout(() => {
      nodeElements[0].classList.remove("active");
      nodeElements[1].classList.add("active");
      updateReadout();
    }, 150);

    // Node 2: Render
    setTimeout(() => {
      nodeElements[1].classList.remove("active");
      nodeElements[2].classList.add("active");
    }, 300);

    setTimeout(() => {
      nodeElements[2].classList.remove("active");
      if (typeof callback === "function") callback();
    }, 450);
  }

  return {
    pulseNodes,
    updateReadout
  };
}
