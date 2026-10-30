// Renders the Styling layer with live wireframe outlines, color swatches, and type samples.
// Uses DOM measurements against phone-screen and wireframeTargets.
// Used by ui/exploded.js.

import { wireframeTargets } from "../../apps/Foodzy/index.js";

/**
 * Creates and mounts the Styling layer visual content.
 * @param {HTMLElement} container
 * @returns {{ redraw: () => void, highlight: (codeLine?: string) => void }}
 */
export function createStylingLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-styling-content";

  // Header / Title strip inside card
  const header = document.createElement("div");
  header.className = "styling-header";
  const title = document.createElement("span");
  title.className = "styling-title";
  title.textContent = "Live UI Wireframe";
  header.appendChild(title);
  root.appendChild(header);

  // Floating code chip during styling steps
  const codeChip = document.createElement("div");
  codeChip.className = "styling-code-chip";
  codeChip.hidden = true;
  root.appendChild(codeChip);

  // Wireframe canvas viewport
  const wireframeViewport = document.createElement("div");
  wireframeViewport.className = "styling-wireframe-viewport";
  root.appendChild(wireframeViewport);

  // Bottom info strip: Swatches & Typography sample
  const footer = document.createElement("div");
  footer.className = "styling-footer";

  const swatchesTitle = document.createElement("div");
  swatchesTitle.className = "styling-swatches-title";
  swatchesTitle.textContent = "Theme Palette";
  footer.appendChild(swatchesTitle);

  const swatchesRow = document.createElement("div");
  swatchesRow.className = "styling-swatches-row";

  const PALETTE = [
    { name: "Brand", var: "--Foodzy" },
    { name: "Strong", var: "--Foodzy-strong" },
    { name: "Soft", var: "--Foodzy-soft" },
    { name: "Rating", var: "--rating" },
    { name: "Veg", var: "--veg" },
    { name: "Non-Veg", var: "--nonveg" }
  ];

  PALETTE.forEach(p => {
    const item = document.createElement("div");
    item.className = "styling-swatch-item";

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
   * Re-measures wireframe targets and redraws bounding boxes.
   */
  function redraw() {
    wireframeViewport.replaceChildren();
    const screen = document.getElementById("phone-screen");
    if (!screen) return;

    const screenRect = screen.getBoundingClientRect();
    if (!screenRect.width || !screenRect.height) return;

    const scaleX = 360 / screenRect.width;
    const scaleY = 760 / screenRect.height;

    const targets = wireframeTargets();
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const top = (rect.top - screenRect.top) * scaleY;
      const left = (rect.left - screenRect.left) * scaleX;
      const width = rect.width * scaleX;
      const height = rect.height * scaleY;

      if (width <= 0 || height <= 0 || top > 760 || left > 360) return;

      const box = document.createElement("div");
      box.className = "styling-wireframe-box";
      box.style.top = `${Math.max(0, Math.round(top))}px`;
      box.style.left = `${Math.max(0, Math.round(left))}px`;
      box.style.width = `${Math.min(360, Math.round(width))}px`;
      box.style.height = `${Math.round(height)}px`;

      wireframeViewport.appendChild(box);
    });
  }

  /**
   * Flashes boxes and displays code chip during a styling step.
   * @param {string} [codeLine]
   */
  function highlight(codeLine) {
    redraw();
    const boxes = wireframeViewport.querySelectorAll(".styling-wireframe-box");
    boxes.forEach(b => {
      b.classList.remove("flash");
      void b.offsetWidth;
      b.classList.add("flash");
    });

    if (codeLine) {
      codeChip.textContent = codeLine;
      codeChip.hidden = false;
      setTimeout(() => {
        codeChip.hidden = true;
      }, 2500);
    }
  }

  // Initial draw
  requestAnimationFrame(() => {
    redraw();
  });

  return {
    redraw,
    highlight
  };
}
