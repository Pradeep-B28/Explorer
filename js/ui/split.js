// Manages the split view on laptop, card shells, layer arts, FLIP split/assembly, bus wire, packet, and dock with 3 modes.
// UPGRADE_BRIEF.md Sections 6, 7, 8, 12, 14.
// Used by screens/stage.js.

import { LAYERS, getAppContent } from "../content.js";
import { t } from "../copy.js";
import { rowGeometry, flatPhoneScale } from "../engine/layout.js";
import { prefersReducedMotion } from "../motion.js";
import { ICONS, getIconSvg } from "./icons.js";
import { createStylingLayer } from "./layers/styling.js";
import { createLogicLayer } from "./layers/logic.js";
import { createServerLayer } from "./layers/server.js";
import { createDatabaseLayer } from "./layers/database.js";
import { createPlayer } from "../player.js";
import { latestCodeByLayer, layerIndex } from "../engine/journey.js";
import { isFlowWatched, markFlowWatched, getWatchedFlows } from "../progress.js";
import { getWhatsAppLink, getProgramLink } from "../links.js";
import { createShareButton } from "./share.js";
import { openAllCodeSheet } from "./allcode.js";
import { tokenizeLine } from "./codeview.js";
import { on, emit } from "../events.js";
import { CONFIG } from "../../config.js";

const LAYER_COLORS = {
  screen: "var(--layer-screen)",
  styling: "var(--layer-styling)",
  logic: "var(--layer-logic)",
  server: "var(--layer-server)",
  database: "var(--layer-database)"
};

const LAYER_GLOWS = {
  screen: "rgba(52, 211, 153, 0.35)",
  styling: "rgba(167, 139, 250, 0.35)",
  logic: "rgba(250, 204, 21, 0.35)",
  server: "rgba(34, 211, 238, 0.35)",
  database: "rgba(129, 140, 248, 0.35)"
};

/**
 * Creates the complete Split View controller for laptop.
 * @param {object} options
 * @param {object} options.phoneObj Phone frame object from createPhoneFrame
 * @param {HTMLElement} options.phoneScreenEl Screen element inside phone
 * @param {string} [options.appId="foodzy"]
 * @param {(journeyId: string) => void} [options.onDoItForMe]
 * @returns {object}
 */
export function createSplitView(options) {
  const { phoneObj, phoneScreenEl, appId = "foodzy", onDoItForMe } = options;
  const { app, journeys } = getAppContent(appId) || {};

  const root = document.createElement("div");
  root.className = "split-layout-root";

  let isSplit = false;
  let activeCardIndex = -1;
  let currentGeo = rowGeometry(window.innerWidth, window.innerHeight);

  // Player & Dock State
  let activePlayer = null;
  let currentJourney = null;
  let currentStepIndex = 0;
  let currentSpeed = CONFIG.defaultSpeed || 1;
  let selectedLayerTab = "screen";
  let dockMode = "flowList"; // "flowList" | "playing" | "flowEnd"
  let isTryingYourself = false;
  let tryBanner = null;
  let activeTypingCancel = null;

  // ---------------------------------------------------------------- 1. Flat Mode DOM
  const flatContainer = document.createElement("div");
  flatContainer.className = "stage-flat-container";

  const flatPhoneWrap = document.createElement("div");
  flatPhoneWrap.className = "flat-phone-wrap";
  flatPhoneWrap.appendChild(phoneObj.frameElement);
  flatContainer.appendChild(flatPhoneWrap);

  const flatIntroPanel = document.createElement("aside");
  flatIntroPanel.className = "flat-intro-panel";

  const introTitle = document.createElement("h2");
  introTitle.className = "flat-intro-title";
  introTitle.textContent = t("panel.intro.title");
  flatIntroPanel.appendChild(introTitle);

  const introBody = document.createElement("p");
  introBody.className = "flat-intro-body";
  introBody.textContent = t("panel.intro.body");
  flatIntroPanel.appendChild(introBody);

  const layersList = document.createElement("div");
  layersList.className = "flat-layers-list";

  LAYERS.forEach((l) => {
    const item = document.createElement("div");
    item.className = "flat-layer-item";

    const icon = document.createElement("div");
    icon.className = "flat-layer-icon";
    icon.style.color = LAYER_COLORS[l.id];
    icon.innerHTML = getIconSvg(l.id, 20);

    const info = document.createElement("div");
    info.className = "flat-layer-info";

    const nameRow = document.createElement("div");
    nameRow.className = "flat-layer-name-row";

    const name = document.createElement("strong");
    name.className = "flat-layer-name";
    name.textContent = l.name;

    const tech = document.createElement("span");
    tech.className = "flat-layer-tech";
    tech.textContent = l.tech;

    nameRow.appendChild(name);
    nameRow.appendChild(tech);

    const oneLine = document.createElement("span");
    oneLine.className = "flat-layer-oneline";
    oneLine.textContent = l.oneLine;

    info.appendChild(nameRow);
    info.appendChild(oneLine);

    item.appendChild(icon);
    item.appendChild(info);
    layersList.appendChild(item);
  });

  flatIntroPanel.appendChild(layersList);

  const splitTriggerBtn = document.createElement("button");
  splitTriggerBtn.type = "button";
  splitTriggerBtn.className = "flat-split-btn";
  splitTriggerBtn.textContent = t("stage.explode");
  splitTriggerBtn.addEventListener("click", () => split());
  flatIntroPanel.appendChild(splitTriggerBtn);

  flatContainer.appendChild(flatIntroPanel);
  root.appendChild(flatContainer);

  // ---------------------------------------------------------------- 2. Split Mode DOM
  const splitContainer = document.createElement("div");
  splitContainer.className = "stage-split-container hidden";

  // Group Labels Row
  const groupsRow = document.createElement("div");
  groupsRow.className = "split-groups-row";

  const frontendBracket = document.createElement("div");
  frontendBracket.className = "group-bracket-frontend";
  frontendBracket.textContent = t("stage.frontend");

  const fullstackPill = document.createElement("div");
  fullstackPill.className = "group-pill-fullstack";
  fullstackPill.textContent = t("stage.fullstack");

  const backendBracket = document.createElement("div");
  backendBracket.className = "group-bracket-backend";
  backendBracket.textContent = t("stage.backend");

  groupsRow.appendChild(frontendBracket);
  groupsRow.appendChild(fullstackPill);
  groupsRow.appendChild(backendBracket);
  splitContainer.appendChild(groupsRow);

  // 5 Cards Row
  const cardRow = document.createElement("div");
  cardRow.className = "split-card-row";

  const cards = [];
  const cardPorts = [];
  const cardFooters = [];
  const layerArts = {};

  LAYERS.forEach((layer, idx) => {
    // If between logic and server, insert the 80px internet gap
    if (idx === 3) {
      const internetGap = document.createElement("div");
      internetGap.className = "split-internet-gap";
      internetGap.style.width = "80px";

      const dashedLine = document.createElement("div");
      dashedLine.className = "internet-gap-line";
      internetGap.appendChild(dashedLine);

      const cloudIcon = document.createElement("div");
      cloudIcon.className = "internet-cloud-icon";
      cloudIcon.innerHTML = getIconSvg("cloud", 24);
      internetGap.appendChild(cloudIcon);

      const internetLabel = document.createElement("span");
      internetLabel.className = "internet-label";
      internetLabel.textContent = t("stage.internet");
      internetGap.appendChild(internetLabel);

      cardRow.appendChild(internetGap);
    }

    const card = document.createElement("div");
    card.className = `split-card card-${layer.id}`;
    card.style.setProperty("--layer-color", LAYER_COLORS[layer.id]);
    card.style.setProperty("--layer-glow", LAYER_GLOWS[layer.id]);

    // Header
    const cardHeader = document.createElement("header");
    cardHeader.className = "card-header";

    const headerIcon = document.createElement("div");
    headerIcon.className = "card-header-icon";
    headerIcon.innerHTML = getIconSvg(layer.id, 20);
    cardHeader.appendChild(headerIcon);

    const headerName = document.createElement("h3");
    headerName.className = "card-header-name";
    headerName.textContent = layer.name;
    cardHeader.appendChild(headerName);

    const headerTech = document.createElement("span");
    headerTech.className = "card-header-tech";
    headerTech.textContent = layer.tech;
    cardHeader.appendChild(headerTech);

    const headerOneLine = document.createElement("span");
    headerOneLine.className = "card-header-oneline";
    headerOneLine.textContent = layer.oneLine;
    cardHeader.appendChild(headerOneLine);

    card.appendChild(cardHeader);

    // Body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    if (layer.id === "screen") {
      const screenContainer = document.createElement("div");
      screenContainer.className = "screen-phone-container";

      const liveChip = document.createElement("div");
      liveChip.className = "card-live-chip";
      liveChip.textContent = t("card.live");
      screenContainer.appendChild(liveChip);

      cardBody.appendChild(screenContainer);
    } else if (layer.id === "styling") {
      layerArts.styling = createStylingLayer(cardBody);
    } else if (layer.id === "logic") {
      layerArts.logic = createLogicLayer(cardBody);
    } else if (layer.id === "server") {
      layerArts.server = createServerLayer(cardBody);
    } else if (layer.id === "database") {
      layerArts.database = createDatabaseLayer(cardBody);
    }

    card.appendChild(cardBody);

    // Footer
    const cardFooter = document.createElement("footer");
    cardFooter.className = "card-footer";

    const lastStep = document.createElement("span");
    lastStep.className = "card-last-step";
    lastStep.textContent = t("card.last", { title: "Ready" });
    cardFooter.appendChild(lastStep);
    cardFooters.push(lastStep);

    const viewCodeLink = document.createElement("button");
    viewCodeLink.type = "button";
    viewCodeLink.className = "card-view-code-link";
    viewCodeLink.textContent = t("card.viewCode");
    viewCodeLink.addEventListener("click", () => {
      selectLayerTab(layer.id);
    });
    cardFooter.appendChild(viewCodeLink);

    card.appendChild(cardFooter);

    // Port circle at bottom edge
    const port = document.createElement("div");
    port.className = "card-port";
    card.appendChild(port);
    cardPorts.push(port);

    cardRow.appendChild(card);
    cards.push(card);
  });

  splitContainer.appendChild(cardRow);

  // Bus Wire & Packet Area
  const busArea = document.createElement("div");
  busArea.className = "split-bus-area";

  const busSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  busSvg.setAttribute("class", "split-bus-svg");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const linearGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  linearGrad.setAttribute("id", "beamGrad");
  linearGrad.setAttribute("x1", "0%");
  linearGrad.setAttribute("y1", "0%");
  linearGrad.setAttribute("x2", "100%");
  linearGrad.setAttribute("y2", "0%");
  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#22D3EE");
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#10B981");
  linearGrad.appendChild(stop1);
  linearGrad.appendChild(stop2);
  defs.appendChild(linearGrad);
  busSvg.appendChild(defs);

  // Background Bus Line
  const busLineBg = document.createElementNS("http://www.w3.org/2000/svg", "line");
  busLineBg.setAttribute("class", "split-bus-line-bg");
  busSvg.appendChild(busLineBg);

  // Active Stretch Bus Line (brightens on packet transit)
  const busLineActive = document.createElementNS("http://www.w3.org/2000/svg", "line");
  busLineActive.setAttribute("class", "split-bus-line-active");
  busLineActive.setAttribute("style", "opacity: 0;");
  busSvg.appendChild(busLineActive);

  // Stubs from cards down to bus
  const stubs = [];
  for (let i = 0; i < 5; i++) {
    const stub = document.createElementNS("http://www.w3.org/2000/svg", "line");
    stub.setAttribute("class", "split-bus-stub");
    busSvg.appendChild(stub);
    stubs.push(stub);
  }

  busArea.appendChild(busSvg);

  // Packet pill
  const packetEl = document.createElement("div");
  packetEl.className = "split-packet";
  packetEl.style.display = "none";

  const packetDot = document.createElement("span");
  packetDot.className = "split-packet-dot";

  const packetIcon = document.createElement("span");
  packetIcon.className = "split-packet-icon";

  const packetLabel = document.createElement("span");
  packetLabel.className = "split-packet-label";
  packetLabel.textContent = "request";

  const packetTooltip = document.createElement("div");
  packetTooltip.className = "split-packet-tooltip";
  packetTooltip.textContent = "{}";

  packetEl.appendChild(packetDot);
  packetEl.appendChild(packetIcon);
  packetEl.appendChild(packetLabel);
  packetEl.appendChild(packetTooltip);
  busArea.appendChild(packetEl);

  splitContainer.appendChild(busArea);

  // ---------------------------------------------------------------- THE DOCK (LAPTOP)
  const dock = document.createElement("aside");
  dock.className = "split-dock";

  splitContainer.appendChild(dock);
  root.appendChild(splitContainer);

  // ---------------------------------------------------------------- 3. Geometry & Layout
  function applyGeometry(geo) {
    currentGeo = geo;

    if (geo.compact) {
      groupsRow.classList.add("compact");
      dock.classList.add("compact");
    } else {
      groupsRow.classList.remove("compact");
      dock.classList.remove("compact");
    }

    cardRow.style.width = `${geo.rowWidth}px`;
    cardRow.style.height = `${geo.rowHeight}px`;

    // Screen card width
    cards[0].style.width = `${geo.screenWidth}px`;
    cards[0].style.marginRight = "24px";

    // Cards 1 & 2
    cards[1].style.width = `${geo.cardWidth}px`;
    cards[1].style.marginRight = "24px";

    cards[2].style.width = `${geo.cardWidth}px`;
    cards[2].style.marginRight = "0px";

    // Cards 3 & 4
    cards[3].style.width = `${geo.cardWidth}px`;
    cards[3].style.marginRight = "24px";

    cards[4].style.width = `${geo.cardWidth}px`;
    cards[4].style.marginRight = "0px";

    // Groups row widths
    const frontendWidth = geo.screenWidth + 24 + geo.cardWidth + 24 + geo.cardWidth;
    const backendWidth = geo.cardWidth + 24 + geo.cardWidth;
    groupsRow.style.width = `${geo.rowWidth}px`;
    frontendBracket.style.width = `${frontendWidth}px`;
    fullstackPill.style.width = "80px";
    backendBracket.style.width = `${backendWidth}px`;

    dock.style.height = `${geo.dockHeight}px`;

    // Scale phone inside Screen card or flat wrap
    if (!isSplit) {
      const flatScale = flatPhoneScale(window.innerWidth, window.innerHeight, "laptop");
      phoneObj.setScale(flatScale);
    } else {
      phoneObj.setScale(geo.phoneScale);
    }

    // Update bus line and stubs
    updateBusGeometry();

    // Redraw styling wireframe targets if needed
    if (layerArts.styling) layerArts.styling.redraw();
  }

  function getPortPositions() {
    const busRect = busArea.getBoundingClientRect();
    return cards.map((c) => {
      const rect = c.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - busRect.left;
      const y = rect.bottom - busRect.top;
      return { x, y };
    });
  }

  function updateBusGeometry() {
    const ports = getPortPositions();
    if (!ports.length || ports[0].x === 0) return;

    const busY = 24; // 24px below card bottoms
    const firstX = ports[0].x;
    const lastX = ports[4].x;

    busLineBg.setAttribute("x1", firstX);
    busLineBg.setAttribute("y1", busY);
    busLineBg.setAttribute("x2", lastX);
    busLineBg.setAttribute("y2", busY);

    ports.forEach((p, i) => {
      if (stubs[i]) {
        stubs[i].setAttribute("x1", p.x);
        stubs[i].setAttribute("y1", p.y);
        stubs[i].setAttribute("x2", p.x);
        stubs[i].setAttribute("y2", busY);
      }
    });
  }

  // ---------------------------------------------------------------- 4. FLIP Split Animation
  function split() {
    if (isSplit) return;
    isSplit = true;
    if (typeof window !== "undefined") window.__isExplaining = true;

    const reduced = prefersReducedMotion();

    if (reduced) {
      flatContainer.style.display = "none";
      splitContainer.classList.remove("hidden");
      const screenContainer = cards[0].querySelector(".screen-phone-container");
      screenContainer.appendChild(phoneObj.frameElement);
      applyGeometry(currentGeo);
      setDockMode("flowList");
      return;
    }

    // Step 1: Fade out intro panel (200 ms)
    flatIntroPanel.style.opacity = "0";

    // Step 2 & 3: Measure flat phone & prepare FLIP
    const flatRect = phoneObj.frameElement.getBoundingClientRect();

    setTimeout(() => {
      flatContainer.style.display = "none";
      splitContainer.classList.remove("hidden");

      const screenContainer = cards[0].querySelector(".screen-phone-container");
      screenContainer.appendChild(phoneObj.frameElement);
      applyGeometry(currentGeo);

      const targetScreenRect = cards[0].getBoundingClientRect();

      // Invert phone
      const phoneDx = flatRect.left + flatRect.width / 2 - (targetScreenRect.left + targetScreenRect.width / 2);
      const phoneDy = flatRect.top + flatRect.height / 2 - (targetScreenRect.top + targetScreenRect.height / 2);
      const initialFlatScale = flatPhoneScale(window.innerWidth, window.innerHeight, "laptop");
      const scaleRatio = initialFlatScale / currentGeo.phoneScale;

      phoneObj.frameElement.style.transform = `translate3d(${phoneDx}px, ${phoneDy}px, 0) scale(${scaleRatio})`;
      phoneObj.frameElement.style.transformOrigin = "center center";

      // Invert other 4 cards: batch read rects first, then write transforms
      const otherRects = [];
      for (let i = 1; i < cards.length; i++) {
        otherRects.push(cards[i].getBoundingClientRect());
      }
      for (let i = 1; i < cards.length; i++) {
        const cardRect = otherRects[i - 1];
        const cardDx = flatRect.left + flatRect.width / 2 - (cardRect.left + cardRect.width / 2);
        const cardDy = flatRect.top + flatRect.height / 2 - (cardRect.top + cardRect.height / 2);
        cards[i].style.transform = `translate3d(${cardDx}px, ${cardDy}px, 0) scale(0.2)`;
        cards[i].style.opacity = "0";
      }

      // Hide dock, wire and labels initially
      dock.style.transform = "translateY(100%)";
      groupsRow.style.opacity = "0";
      busSvg.style.opacity = "0";

      // Force reflow
      cards[0].getBoundingClientRect();

      // Play phone flight into Screen card place (700 ms, --ease-out)
      phoneObj.frameElement.style.transition = "transform 700ms var(--ease-out)";
      phoneObj.frameElement.style.transform = "none";

      // Play other 4 cards slide out (70 ms apart via CSS transition-delay)
      for (let i = 1; i < cards.length; i++) {
        const delay = 70 * i;
        cards[i].style.transition = `transform 600ms var(--ease-out) ${delay}ms, opacity 350ms ease ${delay}ms`;
        cards[i].style.transform = "none";
        cards[i].style.opacity = "1";
      }

      // Step 4: Draw wire (500 ms) and fade in labels
      busSvg.style.transition = "opacity 500ms ease 400ms";
      busSvg.style.opacity = "1";
      groupsRow.style.transition = "opacity 400ms ease 400ms";
      groupsRow.style.opacity = "1";
      updateBusGeometry();

      // Step 5: Dock rises from bottom (300 ms)
      dock.style.transition = "transform 300ms var(--ease-out) 550ms";
      dock.style.transform = "none";
      setDockMode("flowList");

      // Step 6: Intro glow: each card's header glows in turn, Screen to Database, 250 ms apart
      setTimeout(() => {
        cards.forEach((c, idx) => {
          setTimeout(() => {
            const h = c.querySelector(".card-header");
            if (h) {
              h.style.transition = "box-shadow 300ms ease, background 300ms ease";
              h.style.boxShadow = `0 0 16px ${LAYER_COLORS[LAYERS[idx].id]}`;
              setTimeout(() => {
                h.style.boxShadow = "none";
              }, 400);
            }
          }, 250 * idx);
        });
      }, 800);
    }, 200);
  }

  // ---------------------------------------------------------------- 5. Assembly Animation
  function assemble() {
    if (!isSplit) return;
    if (activePlayer) activePlayer.close();
    cancelTryItYourself();

    isSplit = false;
    if (typeof window !== "undefined") window.__isExplaining = false;
    setActiveCard(-1);

    const reduced = prefersReducedMotion();
    if (reduced) {
      splitContainer.classList.add("hidden");
      flatContainer.style.display = "flex";
      flatPhoneWrap.appendChild(phoneObj.frameElement);
      flatIntroPanel.style.opacity = "1";
      applyGeometry(currentGeo);
      return;
    }

    // Play in reverse in 700 ms
    dock.style.transition = "transform 300ms var(--ease)";
    dock.style.transform = "translateY(100%)";
    groupsRow.style.transition = "opacity 200ms ease";
    groupsRow.style.opacity = "0";
    busSvg.style.transition = "opacity 200ms ease";
    busSvg.style.opacity = "0";

    const flatRect = flatPhoneWrap.getBoundingClientRect();
    const targetScreenRect = cards[0].getBoundingClientRect();
    const phoneDx = flatRect.left + flatRect.width / 2 - (targetScreenRect.left + targetScreenRect.width / 2);
    const phoneDy = flatRect.top + flatRect.height / 2 - (targetScreenRect.top + targetScreenRect.height / 2);

    phoneObj.frameElement.style.transition = "transform 600ms var(--ease-out)";
    phoneObj.frameElement.style.transform = `translate3d(${phoneDx}px, ${phoneDy}px, 0)`;

    for (let i = 1; i < cards.length; i++) {
      cards[i].style.transition = "transform 500ms var(--ease), opacity 400ms ease";
      cards[i].style.transform = `translate3d(${phoneDx}px, ${phoneDy}px, 0) scale(0.2)`;
      cards[i].style.opacity = "0";
    }

    setTimeout(() => {
      splitContainer.classList.add("hidden");
      flatContainer.style.display = "flex";
      flatPhoneWrap.appendChild(phoneObj.frameElement);
      phoneObj.frameElement.style.transform = "none";
      phoneObj.frameElement.style.transition = "";

      for (let i = 1; i < cards.length; i++) {
        cards[i].style.transform = "none";
        cards[i].style.opacity = "1";
        cards[i].style.transition = "";
      }

      flatIntroPanel.style.opacity = "1";
      applyGeometry(currentGeo);
    }, 700);
  }

  // ---------------------------------------------------------------- 6. Active Card & Packet
  function setActiveCard(index) {
    activeCardIndex = index;

    if (index < 0 || index >= cards.length) {
      cardRow.classList.remove("has-active");
      cards.forEach((c) => {
        c.classList.remove("active");
      });
      return;
    }

    cardRow.classList.add("has-active");
    cards.forEach((c, i) => {
      if (i === index) c.classList.add("active");
      else c.classList.remove("active");
    });
  }

  /**
   * Animates packet travel along the bus wire.
   * Path: from port down to bus (20%), along bus (60%), up to destination port (20%).
   */
  function travelPacket(fromIndex, toIndex, label = "request", data = {}, durationMs = 1200, onArrival) {
    if (!isSplit) {
      if (typeof onArrival === "function") onArrival();
      return;
    }

    const ports = getPortPositions();
    if (!ports.length) {
      if (typeof onArrival === "function") onArrival();
      return;
    }

    const fromPort = ports[fromIndex] || ports[0];
    const toPort = ports[toIndex] || ports[0];
    const busY = 24;

    const destLayerId = LAYERS[toIndex]?.id || "screen";
    const destColor = LAYER_COLORS[destLayerId];

    packetEl.style.setProperty("--dest-color", destColor);
    packetLabel.textContent = label;
    packetTooltip.textContent = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);

    // If crossing the internet gap (between <=2 and >=3) show lock icon
    const isCrossingInternet = (fromIndex <= 2 && toIndex >= 3) || (fromIndex >= 3 && toIndex <= 2);
    if (isCrossingInternet) {
      packetIcon.innerHTML = getIconSvg("lock", 14);
      packetIcon.style.display = "flex";
    } else {
      packetIcon.innerHTML = "";
      packetIcon.style.display = "none";
    }

    packetEl.style.display = "flex";
    packetEl.style.opacity = "1";

    // When distance is 0, pulse in place at port
    if (fromIndex === toIndex) {
      packetEl.style.left = `${fromPort.x}px`;
      packetEl.style.top = `${fromPort.y}px`;
      cardPorts[toIndex]?.classList.add("pulse");
      setTimeout(() => {
        cardPorts[toIndex]?.classList.remove("pulse");
        setActiveCard(toIndex);
        if (typeof onArrival === "function") onArrival();
      }, durationMs);
      return;
    }

    // Brighten active stretch on bus
    busLineActive.setAttribute("x1", fromPort.x);
    busLineActive.setAttribute("y1", busY);
    busLineActive.setAttribute("x2", toPort.x);
    busLineActive.setAttribute("y2", busY);
    busLineActive.style.opacity = "1";

    const reduced = prefersReducedMotion();
    if (reduced) {
      packetEl.style.left = `${toPort.x}px`;
      packetEl.style.top = `${toPort.y}px`;
      setTimeout(() => {
        busLineActive.style.opacity = "0";
        cardPorts[toIndex]?.classList.add("pulse");
        setActiveCard(toIndex);
        if (typeof onArrival === "function") onArrival();
      }, 150);
      return;
    }

    const downMs = durationMs * 0.2;
    const alongMs = durationMs * 0.6;
    const upMs = durationMs * 0.2;

    // Start at origin port
    packetEl.style.left = `${fromPort.x}px`;
    packetEl.style.top = `${fromPort.y}px`;

    // 1. Down to bus
    setTimeout(() => {
      packetEl.style.transition = `top ${downMs}ms ease`;
      packetEl.style.top = `${busY}px`;
    }, 20);

    // 2. Along bus
    setTimeout(() => {
      packetEl.style.transition = `left ${alongMs}ms linear`;
      packetEl.style.left = `${toPort.x}px`;
    }, downMs + 20);

    // 3. Up to dest port
    setTimeout(() => {
      packetEl.style.transition = `top ${upMs}ms ease`;
      packetEl.style.top = `${toPort.y}px`;
    }, downMs + alongMs + 20);

    // 4. Arrival
    setTimeout(() => {
      packetEl.style.transition = "";
      busLineActive.style.opacity = "0";

      // Port pulse ring (400 ms)
      if (cardPorts[toIndex]) {
        cardPorts[toIndex].classList.add("pulse");
        setTimeout(() => cardPorts[toIndex]?.classList.remove("pulse"), 400);
      }

      setActiveCard(toIndex);
      if (typeof onArrival === "function") onArrival();
    }, durationMs);
  }

  // ---------------------------------------------------------------- 7. DOCK MODES (SECTION 8)
  function setDockMode(mode) {
    dockMode = mode;
    dock.replaceChildren();

    if (mode === "flowList") {
      renderFlowListMode();
    } else if (mode === "playing") {
      renderPlayingMode();
    } else if (mode === "flowEnd") {
      renderFlowEndMode();
    }
  }

  // 7A. Flow List Mode
  function renderFlowListMode() {
    const listWrap = document.createElement("div");
    listWrap.className = "dock-flow-list-mode";

    const flowsContainer = document.createElement("div");
    flowsContainer.className = "dock-flows-container";

    (journeys || []).forEach((j) => {
      const flowCard = document.createElement("div");
      flowCard.className = "dock-flow-card";

      const top = document.createElement("div");
      top.className = "dock-flow-card-top";

      const titleRow = document.createElement("div");
      titleRow.className = "dock-flow-title-row";

      const title = document.createElement("h4");
      title.className = "dock-flow-title";
      title.textContent = j.title;
      titleRow.appendChild(title);

      if (isFlowWatched(j.id)) {
        const watchedBadge = document.createElement("span");
        watchedBadge.className = "dock-flow-watched-badge";
        watchedBadge.textContent = "✓ Watched";
        titleRow.appendChild(watchedBadge);
      }

      top.appendChild(titleRow);

      const hint = document.createElement("p");
      hint.className = "dock-flow-hint";
      hint.textContent = j.tryThis;
      top.appendChild(hint);

      flowCard.appendChild(top);

      const btnGroup = document.createElement("div");
      btnGroup.className = "dock-flow-btn-group";

      const tryBtn = document.createElement("button");
      tryBtn.type = "button";
      tryBtn.className = "dock-flow-btn-try";
      tryBtn.textContent = t("panel.tryIt");
      tryBtn.addEventListener("click", () => startTryItYourself(j.id));

      const doitBtn = document.createElement("button");
      doitBtn.type = "button";
      doitBtn.className = "dock-flow-btn-doit";
      doitBtn.textContent = t("panel.doIt");
      doitBtn.addEventListener("click", () => {
        if (!isSplit) split();
        if (typeof onDoItForMe === "function") onDoItForMe(j.id);
      });

      btnGroup.appendChild(tryBtn);
      btnGroup.appendChild(doitBtn);
      flowCard.appendChild(btnGroup);

      flowsContainer.appendChild(flowCard);
    });

    listWrap.appendChild(flowsContainer);

    const togetherBtn = document.createElement("button");
    togetherBtn.type = "button";
    togetherBtn.className = "dock-together-btn";
    togetherBtn.textContent = t("stage.together");
    togetherBtn.addEventListener("click", () => assemble());
    listWrap.appendChild(togetherBtn);

    dock.appendChild(listWrap);
  }

  // 7B. Playing Mode (Three Columns)
  function renderPlayingMode() {
    if (!activePlayer || !currentJourney) return;
    const step = activePlayer.currentStep;
    if (!step) return;

    dock.replaceChildren();

    const playingWrap = document.createElement("div");
    playingWrap.className = "dock-playing-mode";

    // ---------------- COLUMN 1: STEP INFO (280px)
    const colStep = document.createElement("div");
    colStep.className = "dock-col-step";

    const stepTop = document.createElement("div");
    stepTop.className = "dock-step-top";

    // Progress bar
    const progressBar = document.createElement("div");
    progressBar.className = "dock-progress-bar";
    activePlayer.steps.forEach((st, idx) => {
      const seg = document.createElement("div");
      seg.className = `dock-progress-seg ${idx === currentStepIndex ? "active" : ""} ${idx < currentStepIndex ? "done" : ""}`;
      seg.style.backgroundColor = `var(--layer-${st.layer})`;
      progressBar.appendChild(seg);
    });
    stepTop.appendChild(progressBar);

    // Step meta
    const stepMeta = document.createElement("div");
    stepMeta.className = "dock-step-meta";

    const layerChip = document.createElement("span");
    layerChip.className = "dock-layer-chip";
    layerChip.style.backgroundColor = `var(--layer-${step.layer})`;
    layerChip.textContent = step.layer;
    stepMeta.appendChild(layerChip);

    const stepCount = document.createElement("span");
    stepCount.className = "dock-step-count";
    stepCount.textContent = t("panel.step", { n: currentStepIndex + 1, total: activePlayer.steps.length });
    stepMeta.appendChild(stepCount);

    stepTop.appendChild(stepMeta);

    const stepTitle = document.createElement("h3");
    stepTitle.className = "dock-step-title";
    stepTitle.textContent = step.title;
    stepTop.appendChild(stepTitle);

    colStep.appendChild(stepTop);

    const stepSay = document.createElement("p");
    stepSay.className = "dock-step-say";
    stepSay.textContent = step.say;
    colStep.appendChild(stepSay);

    playingWrap.appendChild(colStep);

    // ---------------- COLUMN 2: CODE TABS & VIEWER (flex 1)
    const colCode = document.createElement("div");
    colCode.className = "dock-col-code";

    // Layer Tabs
    const tabsRow = document.createElement("div");
    tabsRow.className = "dock-code-tabs";

    // Calculate latest steps per layer
    const codeMap = latestCodeByLayer(activePlayer.steps, LAYERS, currentStepIndex);

    LAYERS.forEach((l) => {
      const hasCode = codeMap[l.id] !== null;
      const tabBtn = document.createElement("button");
      tabBtn.type = "button";
      tabBtn.className = `dock-code-tab ${l.id === selectedLayerTab ? "active" : ""} ${!hasCode ? "disabled" : ""}`;
      tabBtn.style.setProperty("--tab-color", `var(--layer-${l.id})`);
      tabBtn.title = !hasCode ? t("panel.notReached") : l.name;

      const dot = document.createElement("span");
      dot.className = "dock-tab-dot";
      dot.style.backgroundColor = `var(--layer-${l.id})`;
      tabBtn.appendChild(dot);

      const tabLabel = document.createElement("span");
      tabLabel.textContent = l.name;
      tabBtn.appendChild(tabLabel);

      tabBtn.addEventListener("click", () => {
        if (hasCode) {
          selectLayerTab(l.id);
        }
      });

      tabsRow.appendChild(tabBtn);
    });

    colCode.appendChild(tabsRow);

    // Active layer's code display
    const activeCodeStep = codeMap[selectedLayerTab] || step;

    const editorHeader = document.createElement("div");
    editorHeader.className = "dock-code-editor-header";

    const fileInfo = document.createElement("div");
    fileInfo.className = "dock-code-file-info";

    const filePath = document.createElement("span");
    filePath.className = "dock-code-filepath";
    filePath.textContent = activeCodeStep?.code?.file || "public/index.html";
    fileInfo.appendChild(filePath);

    const langChip = document.createElement("span");
    langChip.className = "dock-code-lang";
    langChip.textContent = activeCodeStep?.code?.lang || "text";
    fileInfo.appendChild(langChip);

    editorHeader.appendChild(fileInfo);

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "dock-code-copy-btn";
    copyBtn.innerHTML = `${getIconSvg("copy", 14)} <span>${t("panel.copy")}</span>`;
    copyBtn.addEventListener("click", () => {
      const fullCode = (activeCodeStep?.code?.lines || []).join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullCode).catch(() => {});
      }
      copyBtn.querySelector("span").textContent = t("panel.copied");
      setTimeout(() => {
        copyBtn.querySelector("span").textContent = t("panel.copy");
      }, 1500);
    });

    editorHeader.appendChild(copyBtn);
    colCode.appendChild(editorHeader);

    // Code lines content area
    const codeArea = document.createElement("div");
    codeArea.className = "dock-code-content-area";

    renderAnimatedCode(codeArea, activeCodeStep?.code);
    colCode.appendChild(codeArea);

    playingWrap.appendChild(colCode);

    // ---------------- COLUMN 3: PACKET DATA & CONTROLS (260px)
    const colControls = document.createElement("div");
    colControls.className = "dock-col-controls";

    const packetBox = document.createElement("div");
    packetBox.className = "dock-packet-box";

    const packetHead = document.createElement("div");
    packetHead.className = "dock-packet-header";

    const packetTitle = document.createElement("span");
    packetTitle.className = "dock-packet-title";
    packetTitle.textContent = t("panel.packet");

    const packetTag = document.createElement("span");
    packetTag.className = "dock-packet-tag";
    packetTag.textContent = step.packet?.label || "data";

    packetHead.appendChild(packetTitle);
    packetHead.appendChild(packetTag);
    packetBox.appendChild(packetHead);

    const jsonPre = document.createElement("pre");
    jsonPre.className = "dock-packet-json";
    jsonPre.textContent = JSON.stringify(step.packet?.data || {}, null, 2);
    packetBox.appendChild(jsonPre);

    colControls.appendChild(packetBox);

    // Controls group
    const controlsGroup = document.createElement("div");
    controlsGroup.className = "dock-controls-group";

    const row1 = document.createElement("div");
    row1.className = "dock-controls-row";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "dock-ctrl-btn";
    backBtn.disabled = currentStepIndex === 0;
    backBtn.innerHTML = `${getIconSvg("back", 16)} <span>Back</span>`;
    backBtn.addEventListener("click", () => activePlayer.prev());

    const playPauseBtn = document.createElement("button");
    playPauseBtn.type = "button";
    playPauseBtn.className = "dock-ctrl-btn dock-play-btn";
    const isPlaying = activePlayer.isPlaying;
    playPauseBtn.innerHTML = `${getIconSvg(isPlaying ? "pause" : "play", 16)} <span>${isPlaying ? t("panel.pause") : t("panel.play")}</span>`;
    playPauseBtn.addEventListener("click", () => {
      if (activePlayer.isPlaying) activePlayer.pause();
      else activePlayer.play();
      updatePlayPauseButton(playPauseBtn);
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "dock-ctrl-btn";
    nextBtn.disabled = currentStepIndex === activePlayer.steps.length - 1;
    nextBtn.innerHTML = `<span>Next</span> ${getIconSvg("next", 16)}`;
    nextBtn.addEventListener("click", () => activePlayer.next());

    row1.appendChild(backBtn);
    row1.appendChild(playPauseBtn);
    row1.appendChild(nextBtn);
    controlsGroup.appendChild(row1);

    const row2 = document.createElement("div");
    row2.className = "dock-controls-row";

    // Speed segmented control
    const speedSegmented = document.createElement("div");
    speedSegmented.className = "dock-speed-segmented";
    [0.5, 1, 2].forEach((sp) => {
      const spBtn = document.createElement("button");
      spBtn.type = "button";
      spBtn.className = `dock-speed-btn ${sp === currentSpeed ? "active" : ""}`;
      spBtn.textContent = `${sp}x`;
      spBtn.addEventListener("click", () => {
        currentSpeed = sp;
        activePlayer.setSpeed(sp);
        speedSegmented.querySelectorAll(".dock-speed-btn").forEach((b) => b.classList.remove("active"));
        spBtn.classList.add("active");
      });
      speedSegmented.appendChild(spBtn);
    });
    row2.appendChild(speedSegmented);

    const replayBtn = document.createElement("button");
    replayBtn.type = "button";
    replayBtn.className = "dock-ctrl-btn";
    replayBtn.innerHTML = `${getIconSvg("replay", 16)} <span>Replay</span>`;
    replayBtn.addEventListener("click", () => activePlayer.replay());
    row2.appendChild(replayBtn);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "dock-ctrl-btn";
    closeBtn.innerHTML = `${getIconSvg("close", 16)} <span>Close</span>`;
    closeBtn.addEventListener("click", () => {
      activePlayer.close();
      setDockMode("flowList");
    });
    row2.appendChild(closeBtn);

    controlsGroup.appendChild(row2);
    colControls.appendChild(controlsGroup);

    playingWrap.appendChild(colControls);
    dock.appendChild(playingWrap);
  }

  function updatePlayPauseButton(btn) {
    if (!btn || !activePlayer) return;
    const isPlaying = activePlayer.isPlaying;
    btn.innerHTML = `${getIconSvg(isPlaying ? "pause" : "play", 16)} <span>${isPlaying ? t("panel.pause") : t("panel.play")}</span>`;
  }

  function selectLayerTab(layerId) {
    selectedLayerTab = layerId;
    if (dockMode === "playing") {
      renderPlayingMode();
    }
  }

  /**
   * Renders code with typing animation capped at 900 ms, or immediately if reduced motion.
   */
  function renderAnimatedCode(container, codeData) {
    if (activeTypingCancel) {
      activeTypingCancel();
      activeTypingCancel = null;
    }
    container.replaceChildren();

    const { lang = "text", lines = [] } = codeData || {};
    const pre = document.createElement("pre");

    const totalChars = lines.join("\n").length;
    const isReduced = prefersReducedMotion();

    if (isReduced || totalChars === 0) {
      lines.forEach((lineText, idx) => {
        const lineEl = document.createElement("div");
        lineEl.className = "dock-code-line";

        const numEl = document.createElement("span");
        numEl.className = "dock-code-linenum";
        numEl.textContent = String(idx + 1);

        const textEl = document.createElement("span");
        textEl.className = "dock-code-linetext";

        const tokens = tokenizeLine(lineText, lang);
        tokens.forEach((tok) => {
          const span = document.createElement("span");
          if (tok.type !== "plain") span.className = `tok-${tok.type}`;
          span.textContent = tok.text;
          textEl.appendChild(span);
        });

        lineEl.appendChild(numEl);
        lineEl.appendChild(textEl);
        pre.appendChild(lineEl);
      });
      container.appendChild(pre);
      return;
    }

    // Typing animation at ~12ms per char, never more than 900ms per step (Section 8B)
    const typingDuration = Math.min(900, totalChars * 12);
    const delayPerChar = totalChars > 0 ? typingDuration / totalChars : 0;

    const tokenSpans = [];

    lines.forEach((lineText, idx) => {
      const lineEl = document.createElement("div");
      lineEl.className = "dock-code-line";

      const numEl = document.createElement("span");
      numEl.className = "dock-code-linenum";
      numEl.textContent = String(idx + 1);

      const textEl = document.createElement("span");
      textEl.className = "dock-code-linetext";

      const tokens = tokenizeLine(lineText, lang);
      tokens.forEach((tok) => {
        const span = document.createElement("span");
        if (tok.type !== "plain") span.className = `tok-${tok.type}`;
        textEl.appendChild(span);
        tokenSpans.push({ element: span, text: tok.text, offset: 0 });
      });

      lineEl.appendChild(numEl);
      lineEl.appendChild(textEl);
      pre.appendChild(lineEl);
    });

    container.appendChild(pre);

    let cancelled = false;
    let spanIdx = 0;
    let timerId = null;

    function typeNext() {
      if (cancelled) return;
      if (spanIdx >= tokenSpans.length) return;

      const cur = tokenSpans[spanIdx];
      cur.offset++;
      cur.element.textContent = cur.text.slice(0, cur.offset);

      if (cur.offset >= cur.text.length) {
        spanIdx++;
      }
      timerId = setTimeout(typeNext, delayPerChar);
    }

    typeNext();

    activeTypingCancel = () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      tokenSpans.forEach((s) => {
        s.element.textContent = s.text;
      });
    };
  }

  // 7C. Flow End Mode
  function renderFlowEndMode() {
    if (!currentJourney) return;

    dock.replaceChildren();

    const endWrap = document.createElement("div");
    endWrap.className = "dock-flow-end-mode";

    // Column 1: Lesson
    const colLesson = document.createElement("div");
    colLesson.className = "dock-end-col-lesson";

    const lessonTitle = document.createElement("h4");
    lessonTitle.className = "dock-lesson-title";
    lessonTitle.textContent = t("flow.end.title");
    colLesson.appendChild(lessonTitle);

    const lessonBody = document.createElement("p");
    lessonBody.className = "dock-lesson-body";
    lessonBody.textContent = currentJourney.lesson;
    colLesson.appendChild(lessonBody);

    endWrap.appendChild(colLesson);

    // Column 2: CTA
    const colCta = document.createElement("div");
    colCta.className = "dock-end-col-cta";

    const ctaTitle = document.createElement("h3");
    ctaTitle.className = "dock-cta-title";
    ctaTitle.textContent = t("cta.title");
    colCta.appendChild(ctaTitle);

    const ctaBody = document.createElement("p");
    ctaBody.className = "dock-cta-body";
    ctaBody.textContent = t("cta.body", { program: CONFIG.program.name });
    colCta.appendChild(ctaBody);

    const ctaBtns = document.createElement("div");
    ctaBtns.className = "dock-cta-buttons";

    const watched = getWatchedFlows();
    const waLink = getWhatsAppLink(watched);

    if (waLink) {
      const waBtn = document.createElement("a");
      waBtn.href = waLink;
      waBtn.target = "_blank";
      waBtn.rel = "noopener noreferrer";
      waBtn.className = "dock-whatsapp-btn";
      waBtn.textContent = t("cta.whatsapp");
      waBtn.addEventListener("click", () => emit("cta_whatsapp", { flow: currentJourney.id }));
      ctaBtns.appendChild(waBtn);
    }

    const progLink = document.createElement("a");
    progLink.href = getProgramLink("dock");
    progLink.target = "_blank";
    progLink.rel = "noopener noreferrer";
    progLink.className = "dock-program-link";
    progLink.textContent = t("cta.program");
    progLink.addEventListener("click", () => emit("cta_program", { flow: currentJourney.id }));
    ctaBtns.appendChild(progLink);

    colCta.appendChild(ctaBtns);
    endWrap.appendChild(colCta);

    // Column 3: Actions & Progress
    const colActions = document.createElement("div");
    colActions.className = "dock-end-col-actions";

    const isAll = watched.length >= journeys.length;
    const progText = document.createElement("p");
    progText.className = "dock-progress-counter";
    progText.textContent = isAll ? t("cta.all") : t("cta.progress", { n: watched.length, total: journeys.length });
    colActions.appendChild(progText);

    if (CONFIG.features.allCode) {
      const allCodeBtn = document.createElement("button");
      allCodeBtn.type = "button";
      allCodeBtn.className = "dock-all-code-btn";
      allCodeBtn.innerHTML = `${getIconSvg("copy", 16)} <span>${t("panel.allCode")}</span>`;
      allCodeBtn.addEventListener("click", () => {
        openAllCodeSheet({ journey: currentJourney, steps: activePlayer.steps });
      });
      colActions.appendChild(allCodeBtn);
    }

    const tryAnotherBtn = document.createElement("button");
    tryAnotherBtn.type = "button";
    tryAnotherBtn.className = "dock-try-another-btn";
    tryAnotherBtn.textContent = t("cta.another");
    tryAnotherBtn.addEventListener("click", () => setDockMode("flowList"));
    colActions.appendChild(tryAnotherBtn);

    const shareBtn = createShareButton({ className: "dock-ctrl-btn" });
    colActions.appendChild(shareBtn);

    endWrap.appendChild(colActions);
    dock.appendChild(endWrap);
  }

  // ---------------------------------------------------------------- 8. TRY IT YOURSELF (SECTION 6G)
  function startTryItYourself(journeyId) {
    const j = journeys.find((item) => item.id === journeyId);
    if (!j) return;

    if (!isSplit) split();

    isTryingYourself = true;
    cardRow.classList.add("dimmed");

    // Move phone to flat position at flatPhoneScale
    const flatScale = flatPhoneScale(window.innerWidth, window.innerHeight, "laptop");
    const scaleRatio = flatScale / currentGeo.phoneScale;

    // Center of flat phone
    const screenRect = cards[0].getBoundingClientRect();
    const flatW = (window.innerWidth - 48);
    const flatPhoneCenterX = window.innerWidth / 2 - 180;
    const flatPhoneCenterY = window.innerHeight / 2;

    const currentCenterX = screenRect.left + screenRect.width / 2;
    const currentCenterY = screenRect.top + screenRect.height / 2;

    const dx = flatPhoneCenterX - currentCenterX;
    const dy = flatPhoneCenterY - currentCenterY;

    phoneObj.frameElement.style.transition = "transform 600ms var(--ease-out)";
    phoneObj.frameElement.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scaleRatio})`;

    // Show floating banner above phone
    if (tryBanner) tryBanner.remove();
    tryBanner = document.createElement("div");
    tryBanner.className = "try-yourself-banner";

    const bannerText = document.createElement("span");
    bannerText.className = "try-yourself-text";
    bannerText.textContent = t("panel.yourTurn", { hint: j.tryThis });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "try-yourself-cancel-btn";
    cancelBtn.textContent = t("panel.cancel");
    cancelBtn.addEventListener("click", () => cancelTryItYourself());

    tryBanner.appendChild(bannerText);
    tryBanner.appendChild(cancelBtn);
    splitContainer.appendChild(tryBanner);
  }

  function cancelTryItYourself() {
    if (!isTryingYourself) return;
    isTryingYourself = false;

    if (tryBanner) {
      tryBanner.remove();
      tryBanner = null;
    }

    cardRow.classList.remove("dimmed");
    phoneObj.frameElement.style.transition = "transform 500ms var(--ease-out)";
    phoneObj.frameElement.style.transform = "none";
  }

  // ---------------------------------------------------------------- 9. PLAYER FLOW EXECUTION
  function startFlow(journeyId, values, commit) {
    const journey = journeys.find((j) => j.id === journeyId);
    if (!journey) return;

    if (!isSplit) split();

    // Cancel "Try it yourself" if active
    if (isTryingYourself) {
      cancelTryItYourself();
    }

    if (activePlayer) {
      activePlayer.close();
      activePlayer = null;
    }

    currentJourney = journey;
    currentStepIndex = 0;
    selectedLayerTab = "screen";

    // Reset layers visual state
    layerArts.database?.reset();
    layerArts.server?.reset();
    layerArts.logic?.updateState();
    layerArts.styling?.redraw();
    cardFooters.forEach((f) => (f.textContent = t("card.last", { title: "Ready" })));

    activePlayer = createPlayer({
      journey,
      layers: LAYERS,
      values,
      speed: currentSpeed,
      commit,
      autoPlay: CONFIG.features.autoPlay,
      onStep: (step, index) => {
        currentStepIndex = index;
        selectedLayerTab = step.layer;

        const destIndex = layerIndex(LAYERS, step.layer);
        const fromIndex = step.from !== null && step.from !== undefined ? step.from : destIndex;

        // Travel packet on bus
        travelPacket(
          fromIndex,
          destIndex,
          step.packet?.label || "step",
          step.packet?.data || {},
          step.travel,
          () => {
            setActiveCard(destIndex);
          }
        );

        // Update layer card contents
        if (step.layer === "styling" && layerArts.styling) {
          layerArts.styling.highlight(step.code?.lines?.[0]);
        } else if (step.layer === "logic" && layerArts.logic) {
          layerArts.logic.pulseNodes();
        } else if (step.layer === "server" && layerArts.server) {
          layerArts.server.highlightRoute(step.route);
          if (step.log) layerArts.server.addLog(step.log);
        } else if (step.layer === "database" && layerArts.database) {
          if (step.db) layerArts.database.execute(step.db);
        }

        // Update card footer
        if (cardFooters[destIndex]) {
          cardFooters[destIndex].textContent = t("card.last", { title: step.title });
        }

        // Update dock playing mode
        setDockMode("playing");
      },
      onComplete: (j) => {
        markFlowWatched(j.id);
        setActiveCard(-1);
        emit("flow_complete", { flow: j.id });
        setDockMode("flowEnd");
      }
    });

    setDockMode("playing");
    activePlayer.start();
  }

  // ---------------------------------------------------------------- 10. KEYBOARD & EVENT LISTENERS
  function handleKeyDown(e) {
    const tag = e.target ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "Escape") {
      if (isTryingYourself) {
        e.preventDefault();
        cancelTryItYourself();
      } else if (activePlayer && activePlayer.isPlaying) {
        e.preventDefault();
        activePlayer.close();
        setDockMode("flowList");
      }
    } else if (e.key === " ") {
      if (activePlayer && !activePlayer.isEnded) {
        e.preventDefault();
        if (activePlayer.isPlaying) activePlayer.pause();
        else activePlayer.play();
      }
    } else if (e.key === "ArrowLeft") {
      if (activePlayer && !activePlayer.isEnded) {
        e.preventDefault();
        activePlayer.prev();
      }
    } else if (e.key === "ArrowRight") {
      if (activePlayer && !activePlayer.isEnded) {
        e.preventDefault();
        activePlayer.next();
      }
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  // Subscribe to journey requests (from phone screen clicks or doItForMe)
  const unsubRequest = on("journey:request", (req) => {
    startFlow(req.journeyId, req.values, req.commit);
  });

  // ---------------------------------------------------------------- Initial setup
  applyGeometry(currentGeo);
  setDockMode("flowList");

  return {
    element: root,
    split,
    assemble,
    get isSplit() { return isSplit; },
    setActiveCard,
    travelPacket,
    startFlow,
    startTryItYourself,
    setDockMode,
    get dockMode() { return dockMode; },
    get activePlayer() { return activePlayer; },
    updateGeometry: (w, h) => applyGeometry(rowGeometry(w, h)),
    layerArts,
    cards,
    unmount() {
      if (typeof window !== "undefined") delete window.__isExplaining;
      window.removeEventListener("keydown", handleKeyDown);
      unsubRequest();
      if (activePlayer) activePlayer.close();
      if (activeTypingCancel) activeTypingCancel();
      root.remove();
    }
  };
}
