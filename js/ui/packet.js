// Renders the 3D travelling packet, manages beam transit on Z-axis, and triggers arrival pulse rings.
// Uses motion.js animation loop, tokens.css, and standard DOM APIs.
// Used by ui/exploded.js and player.js.

import { prefersReducedMotion } from "../motion.js";

const LAYER_IDS = ["screen", "styling", "logic", "server", "database"];
const GAP_Z = 96;

/**
 * Calculates Z position in pixels for a layer index (0=Screen to 4=Database).
 * @param {number} idx
 * @returns {number}
 */
export function getLayerZ(idx) {
  return (2 - idx) * GAP_Z;
}

/**
 * Creates the travelling packet controller.
 * @param {HTMLElement} stackElement
 * @param {HTMLElement[]} layerCardElements
 * @returns {{ element: HTMLElement, show: (idx: number, label: string, targetId?: string) => void, travel: (fromIdx: number, toIdx: number, travelMs: number, label: string, targetId: string, onArrived?: () => void) => void, pulseLayer: (idx: number) => void, hide: () => void }}
 */
export function createPacket(stackElement, layerCardElements) {
  const packetEl = document.createElement("div");
  packetEl.className = "packet-3d";
  packetEl.hidden = true;

  const dot = document.createElement("span");
  dot.className = "packet-dot";

  const labelEl = document.createElement("span");
  labelEl.className = "packet-label";
  labelEl.textContent = "data";

  packetEl.appendChild(dot);
  packetEl.appendChild(labelEl);
  stackElement.appendChild(packetEl);

  let currentAnim = null;

  /**
   * Spawns an expanding arrival ring on the specified layer.
   * @param {number} idx
   */
  function pulseLayer(idx) {
    const card = layerCardElements[idx];
    if (!card) return;

    const ring = document.createElement("div");
    ring.className = "layer-arrival-ring pulsing";
    const layerId = LAYER_IDS[idx] || "screen";
    ring.style.borderColor = `var(--layer-${layerId})`;
    card.appendChild(ring);

    setTimeout(() => {
      ring.remove();
    }, 450);
  }

  /**
   * Instantly positions the packet at a layer without animation.
   * @param {number} idx
   * @param {string} label
   * @param {string} [targetId]
   */
  function show(idx, label, targetId) {
    if (currentAnim) {
      cancelAnimationFrame(currentAnim);
      currentAnim = null;
    }

    const tid = targetId || LAYER_IDS[idx] || "screen";
    labelEl.textContent = label;
    packetEl.style.borderColor = `var(--layer-${tid})`;
    packetEl.style.setProperty("--packet-z", `${getLayerZ(idx)}px`);
    packetEl.hidden = false;
    packetEl.style.opacity = "1";
  }

  /**
   * Travels from fromIdx to toIdx over travelMs.
   * @param {number} fromIdx
   * @param {number} toIdx
   * @param {number} travelMs
   * @param {string} label
   * @param {string} targetId
   * @param {() => void} [onArrived]
   */
  function travel(fromIdx, toIdx, travelMs, label, targetId, onArrived) {
    if (currentAnim) {
      cancelAnimationFrame(currentAnim);
      currentAnim = null;
    }

    labelEl.textContent = label;
    packetEl.style.borderColor = `var(--layer-${targetId})`;
    packetEl.hidden = false;
    packetEl.style.opacity = "1";

    // If same layer (distance = 0)
    if (fromIdx === toIdx || travelMs <= 0) {
      packetEl.style.setProperty("--packet-z", `${getLayerZ(toIdx)}px`);
      pulseLayer(toIdx);
      if (typeof onArrived === "function") onArrived();
      return;
    }

    // Reduced motion: fade between layers
    if (prefersReducedMotion()) {
      packetEl.style.opacity = "0";
      setTimeout(() => {
        packetEl.style.setProperty("--packet-z", `${getLayerZ(toIdx)}px`);
        packetEl.style.opacity = "1";
        pulseLayer(toIdx);
        if (typeof onArrived === "function") onArrived();
      }, 150);
      return;
    }

    const startZ = getLayerZ(fromIdx);
    const endZ = getLayerZ(toIdx);
    const startTime = performance.now();

    function cubicEase(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / travelMs, 1);
      const eased = cubicEase(progress);
      const currentZ = startZ + (endZ - startZ) * eased;

      packetEl.style.setProperty("--packet-z", `${Math.round(currentZ)}px`);

      if (progress < 1) {
        currentAnim = requestAnimationFrame(step);
      } else {
        currentAnim = null;
        packetEl.style.setProperty("--packet-z", `${endZ}px`);
        pulseLayer(toIdx);
        if (typeof onArrived === "function") onArrived();
      }
    }

    currentAnim = requestAnimationFrame(step);
  }

  function hide() {
    if (currentAnim) {
      cancelAnimationFrame(currentAnim);
      currentAnim = null;
    }
    packetEl.hidden = true;
  }

  return {
    element: packetEl,
    show,
    travel,
    pulseLayer,
    hide
  };
}
