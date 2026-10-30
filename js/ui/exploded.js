// Manages the 3D exploded view, 5 layer cards, camera tilt, screen hover easing, and layer activations.
// Uses ui/packet.js, ui/layers/*, content.js, and copy.js.
// Used by screens/stage.js.

import { getLayers } from "../content.js";
import { createStylingLayer } from "./layers/styling.js";
import { createLogicLayer } from "./layers/logic.js";
import { createServerLayer } from "./layers/server.js";
import { createDatabaseLayer } from "./layers/database.js";
import { createPacket } from "./packet.js";

/**
 * Creates the complete Exploded Stack controller.
 * @param {HTMLElement} phoneFrameObj
 * @param {HTMLElement} phoneScreenEl
 * @returns {object}
 */
export function createExplodedStack(phoneFrameObj, phoneScreenEl) {
  const viewport = document.createElement("div");
  viewport.className = "exploded-viewport";

  const stack = document.createElement("div");
  stack.className = "exploded-stack";

  // Central 3D Beam
  const beam = document.createElement("div");
  beam.className = "exploded-beam-3d";
  stack.appendChild(beam);

  const layersData = getLayers();
  const cardElements = [];

  // Layer 0: Screen layer card wrapping phone frame
  const screenCard = document.createElement("div");
  screenCard.className = "layer-card";
  screenCard.setAttribute("data-layer", "screen");
  screenCard.style.setProperty("--layer-idx", "0");
  screenCard.appendChild(phoneFrameObj.element);
  stack.appendChild(screenCard);
  cardElements.push(screenCard);

  // Layer 1: Styling layer card
  const stylingCard = document.createElement("div");
  stylingCard.className = "layer-card";
  stylingCard.setAttribute("data-layer", "styling");
  stylingCard.style.setProperty("--layer-idx", "1");
  const stylingArt = createStylingLayer(stylingCard);
  stack.appendChild(stylingCard);
  cardElements.push(stylingCard);

  // Layer 2: Logic layer card
  const logicCard = document.createElement("div");
  logicCard.className = "layer-card";
  logicCard.setAttribute("data-layer", "logic");
  logicCard.style.setProperty("--layer-idx", "2");
  const logicArt = createLogicLayer(logicCard);
  stack.appendChild(logicCard);
  cardElements.push(logicCard);

  // Layer 3: Server layer card
  const serverCard = document.createElement("div");
  serverCard.className = "layer-card";
  serverCard.setAttribute("data-layer", "server");
  serverCard.style.setProperty("--layer-idx", "3");
  const serverArt = createServerLayer(serverCard);
  stack.appendChild(serverCard);
  cardElements.push(serverCard);

  // Layer 4: Database layer card
  const databaseCard = document.createElement("div");
  databaseCard.className = "layer-card";
  databaseCard.setAttribute("data-layer", "database");
  databaseCard.style.setProperty("--layer-idx", "4");
  const databaseArt = createDatabaseLayer(databaseCard);
  stack.appendChild(databaseCard);
  cardElements.push(databaseCard);

  // Attach counter-rotated chips and tooltips to cards
  layersData.forEach((layer, idx) => {
    const card = cardElements[idx];
    const anchor = document.createElement("div");
    anchor.className = "layer-chip-anchor";

    const chipBtn = document.createElement("button");
    chipBtn.type = "button";
    chipBtn.className = "layer-chip-btn";
    chipBtn.setAttribute("data-layer-id", layer.id);

    const dot = document.createElement("span");
    dot.className = "layer-chip-dot";
    dot.style.backgroundColor = `var(--layer-${layer.id})`;

    const nameText = document.createElement("span");
    nameText.textContent = layer.name;

    const techText = document.createElement("span");
    techText.className = "layer-chip-tech";
    techText.textContent = `(${layer.tech})`;

    chipBtn.appendChild(dot);
    chipBtn.appendChild(nameText);
    chipBtn.appendChild(techText);

    // Tooltip with layer.more text
    const tooltip = document.createElement("div");
    tooltip.className = "layer-tooltip";
    tooltip.textContent = layer.more;

    anchor.appendChild(chipBtn);
    anchor.appendChild(tooltip);
    card.appendChild(anchor);
  });

  // Packet Controller
  const packet = createPacket(stack, cardElements);

  // Pointer hover on Screen layer on laptop: 400ms rest eases tilt
  let screenHoverTimer = null;
  screenCard.addEventListener("mouseenter", () => {
    if (!stack.classList.contains("exploded")) return;
    screenHoverTimer = setTimeout(() => {
      stack.classList.add("soft-tilt");
    }, 400);
  });

  screenCard.addEventListener("mouseleave", () => {
    if (screenHoverTimer) {
      clearTimeout(screenHoverTimer);
      screenHoverTimer = null;
    }
    stack.classList.remove("soft-tilt");
  });

  viewport.appendChild(stack);

  let isExploded = false;

  /**
   * Sets active layer highlighting.
   * @param {number} idx 0-4 or -1 to clear
   */
  function setActiveLayer(idx) {
    if (idx < 0 || idx > 4) {
      stack.classList.remove("has-active");
      cardElements.forEach(c => c.classList.remove("active-layer"));
      return;
    }

    stack.classList.add("has-active");
    cardElements.forEach((c, i) => {
      c.classList.toggle("active-layer", i === idx);
    });

    // On mobile under 900px, scroll card into view
    if (window.innerWidth < 900 && cardElements[idx]) {
      cardElements[idx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /**
   * Explodes the stack into 5 floating 3D layers.
   */
  function explode() {
    isExploded = true;
    if (typeof window !== "undefined") window.__isExplaining = true;
    stack.classList.add("explaining");
    stack.classList.add("exploded");

    // Fade out phone outer shell frame if needed
    if (phoneFrameObj.frameElement) {
      phoneFrameObj.frameElement.classList.add("exploded-mode");
    }

    // Refresh styling layer wireframe outlines
    stylingArt.redraw();

    // Intro pulse: pulse chips in turn from Screen to Database (250ms apart)
    const chips = stack.querySelectorAll(".layer-chip-btn");
    chips.forEach((ch, i) => {
      setTimeout(() => {
        ch.style.transform = "scale(1.2)";
        ch.style.boxShadow = "0 0 16px var(--accent)";
        setTimeout(() => {
          ch.style.transform = "";
          ch.style.boxShadow = "";
        }, 220);
      }, i * 250);
    });
  }

  /**
   * Collapses the stack back to the flat phone view.
   */
  function collapse() {
    isExploded = false;
    if (typeof window !== "undefined") window.__isExplaining = false;
    stack.classList.remove("soft-tilt");
    stack.classList.remove("exploded");
    setActiveLayer(-1);
    packet.hide();

    if (phoneFrameObj.frameElement) {
      phoneFrameObj.frameElement.classList.remove("exploded-mode");
    }

    setTimeout(() => {
      if (!isExploded) {
        stack.classList.remove("explaining");
      }
    }, 750);
  }

  /**
   * Scales stack as one block to fit available space without horizontal scrolling.
   * @param {number} availW
   * @param {number} availH
   */
  function updateScale(availW, availH) {
    if (window.innerWidth < 900) {
      viewport.style.transform = "";
      return 1;
    }

    // In 3D rotation, the stack bounding box spans roughly 560px wide by 820px tall
    const stackBoundingW = 560;
    const stackBoundingH = 820;

    const scaleX = (availW - 48) / stackBoundingW;
    const scaleY = (availH - 48) / stackBoundingH;
    const scale = Math.min(Math.max(scaleX, 0.45), Math.max(scaleY, 0.45), 1);

    viewport.style.transform = `scale(${scale})`;
    return scale;
  }

  /**
   * Test helper: sends packet from Screen to Database and back.
   * @param {() => void} [onComplete]
   */
  function runTestPacketTrip(onComplete) {
    packet.show(0, "trip-start", "screen");
    setTimeout(() => {
      packet.travel(0, 4, 600, "payload-down", "database", () => {
        setActiveLayer(4);
        setTimeout(() => {
          packet.travel(4, 0, 600, "payload-up", "screen", () => {
            setActiveLayer(0);
            setTimeout(() => {
              setActiveLayer(-1);
              if (typeof onComplete === "function") onComplete();
            }, 300);
          });
        }, 400);
      });
    }, 200);
  }

  return {
    element: viewport,
    stackElement: stack,
    stylingArt,
    logicArt,
    serverArt,
    databaseArt,
    packet,
    explode,
    collapse,
    setActiveLayer,
    updateScale,
    runTestPacketTrip,
    get isExploded() { return isExploded; }
  };
}
