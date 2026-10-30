// Renders the Styling layer with live wireframe outlines, color swatches, and type samples.
// UPGRADE_BRIEF.md Section 7: Styling card.
// Uses DOM measurements against phone-screen and wireframeTargets.
// Used by ui/split.js.

import { wireframeTargets } from "../../apps/foodzy/index.js";

/**
 * Creates and mounts the Styling layer visual content.
 * @param {HTMLElement} container
 * @returns {{ redraw: () => void, highlight: (codeLine?: string) => void }}
 */
export function createStylingLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-styling-content";

  // Header strip inside card
  const header = document.createElement("div");
  header.className = "styling-header";
  const title = document.createElement("span");
  title.className = "styling-title";
  title.textContent = "Live UI Wireframe";
  header.appendChild(title);

  // Floating selector chip during styling steps
  const codeChip = document.createElement("div");
  codeChip.className = "styling-code-chip";
  codeChip.hidden = true;
  header.appendChild(codeChip);

  root.appendChild(header);

  // Wireframe canvas viewport
  const wireframeViewport = document.createElement("div");
  wireframeViewport.className = "styling-wireframe-viewport";
  root.appendChild(wireframeViewport);

  // Bottom info strip: Swatches & Typography sample
  const footer = document.createElement("div");
  footer.className = "styling-footer";

  const swatchesRow = document.createElement("div");
  swatchesRow.className = "styling-swatches-row";

  // 5 Foodzy colour swatches (UPGRADE_BRIEF.md Section 7)
  const PALETTE = [
    { name: "Brand", var: "--foodzy" },
    { name: "Strong", var: "--foodzy-strong" },
    { name: "Soft", var: "--foodzy-soft" },
    { name: "Rating", var: "--rating" },
    { name: "Veg", var: "--veg" }
  ];

  PALETTE.forEach((p) => {
    const item = document.createElement("div");
    item.className = "styling-swatch-item";
    item.title = p.name;

    const circle = document.createElement("span");
    circle.className = "styling-swatch-circle";
    circle.style.backgroundColor = `var(${p.var})`;

    const label = document.createElement("span");
    label.className = "styling-swatch-label";
    label.textContent = p.name;

    item.appendChild(circle);
    item.appendChild(label);
    swatchesRow.appendChild(item);
  });
  footer.appendChild(swatchesRow);

  const typographySample = document.createElement("div");
  typographySample.className = "styling-type-sample";

  const tHeading = document.createElement("span");
  tHeading.className = "type-sample-heading";
  tHeading.textContent = "Aa 20";

  const tBody = document.createElement("span");
  tBody.className = "type-sample-body";
  tBody.textContent = " / 15";

  const tCaption = document.createElement("span");
  tCaption.className = "type-sample-caption";
  tCaption.textContent = " / 13";

  typographySample.appendChild(tHeading);
  typographySample.appendChild(tBody);
  typographySample.appendChild(tCaption);
  footer.appendChild(typographySample);

  root.appendChild(footer);
  container.replaceChildren(root);

  /**
   * Re-measures wireframe targets and redraws bounding boxes scaled to viewport.
   */
  function redraw() {
    wireframeViewport.replaceChildren();
    const screen = document.getElementById("phone-screen");
    if (!screen) return;

    const screenRect = screen.getBoundingClientRect();
    if (!screenRect.width || !screenRect.height) return;

    const viewRect = wireframeViewport.getBoundingClientRect();
    const availW = viewRect.width || 200;
    const availH = viewRect.height || 180;

    const scale = Math.min(availW / 360, availH / 760);
    const offsetX = (availW - 360 * scale) / 2;
    const offsetY = (availH - 760 * scale) / 2;

    const targets = wireframeTargets();
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const top = (rect.top - screenRect.top) / (screenRect.height / 760);
      const left = (rect.left - screenRect.left) / (screenRect.width / 360);
      const width = rect.width / (screenRect.width / 360);
      const height = rect.height / (screenRect.height / 760);

      if (width <= 0 || height <= 0 || top > 760 || left > 360) return;

      const box = document.createElement("div");
      box.className = "styling-wireframe-box";
      box.style.top = `${Math.round(offsetY + top * scale)}px`;
      box.style.left = `${Math.round(offsetX + left * scale)}px`;
      box.style.width = `${Math.round(width * scale)}px`;
      box.style.height = `${Math.round(height * scale)}px`;

      wireframeViewport.appendChild(box);
    });
  }

  /**
   * Flashes boxes and displays code chip during a styling step.
   * @param {string} [codeLine] First code line up to '{'
   */
  function highlight(codeLine) {
    redraw();
    const boxes = wireframeViewport.querySelectorAll(".styling-wireframe-box");
    boxes.forEach((b) => {
      b.classList.remove("flash");
      void b.offsetWidth;
      b.classList.add("flash");
    });

    if (codeLine) {
      // First CSS selector: first code line, up to the '{'
      const selector = codeLine.split("{")[0].trim();
      codeChip.textContent = selector;
      codeChip.hidden = false;
      setTimeout(() => {
        codeChip.hidden = true;
      }, 2500);
    }
  }

  // Initial draw
  requestAnimationFrame(() => redraw());

  return {
    element: root,
    redraw,
    highlight
  };
}
