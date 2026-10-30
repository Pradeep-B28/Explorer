// Manages the split view on laptop, card shells, FLIP split/assembly, bus wire, and packet.
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

    const viewCodeLink = document.createElement("button");
    viewCodeLink.type = "button";
    viewCodeLink.className = "card-view-code-link";
    viewCodeLink.textContent = t("card.viewCode");
    viewCodeLink.addEventListener("click", () => {
      // Open dock tab in Phase 3
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

  // Dock (Laptop)
  const dock = document.createElement("aside");
  dock.className = "split-dock";

  const dockFlowList = document.createElement("div");
  dockFlowList.className = "dock-flow-list-mode";

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
    tryBtn.addEventListener("click", () => {
      // Try it yourself trigger (Section 6G)
    });

    const doitBtn = document.createElement("button");
    doitBtn.type = "button";
    doitBtn.className = "dock-flow-btn-doit";
    doitBtn.textContent = t("panel.doIt");
    doitBtn.addEventListener("click", () => {
      if (typeof onDoItForMe === "function") {
        onDoItForMe(j.id);
      }
    });

    btnGroup.appendChild(tryBtn);
    btnGroup.appendChild(doitBtn);
    flowCard.appendChild(btnGroup);

    flowsContainer.appendChild(flowCard);
  });

  dockFlowList.appendChild(flowsContainer);

  const togetherBtn = document.createElement("button");
  togetherBtn.type = "button";
  togetherBtn.className = "dock-together-btn";
  togetherBtn.textContent = t("stage.together");
  togetherBtn.addEventListener("click", () => assemble());
  dockFlowList.appendChild(togetherBtn);

  dock.appendChild(dockFlowList);
  splitContainer.appendChild(dock);

  root.appendChild(splitContainer);

  // ---------------------------------------------------------------- 3. Geometry & Layout
  function applyGeometry(geo) {
    currentGeo = geo;

    if (geo.compact) {
      groupsRow.classList.add("compact");
    } else {
      groupsRow.classList.remove("compact");
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
  }

  function getPortPositions() {
    const busRect = busArea.getBoundingClientRect();
    return cards.map((c) => {
      const rect = c.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) - busRect.left;
      const y = (rect.bottom) - busRect.top;
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

    const reduced = prefersReducedMotion();

    if (reduced) {
      flatContainer.style.display = "none";
      splitContainer.classList.remove("hidden");
      const screenContainer = cards[0].querySelector(".screen-phone-container");
      screenContainer.appendChild(phoneObj.frameElement);
      applyGeometry(currentGeo);
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
      const phoneDx = (flatRect.left + flatRect.width / 2) - (targetScreenRect.left + targetScreenRect.width / 2);
      const phoneDy = (flatRect.top + flatRect.height / 2) - (targetScreenRect.top + targetScreenRect.height / 2);
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
        const cardDx = (flatRect.left + flatRect.width / 2) - (cardRect.left + cardRect.width / 2);
        const cardDy = (flatRect.top + flatRect.height / 2) - (cardRect.top + cardRect.height / 2);
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
    isSplit = false;
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
    const phoneDx = (flatRect.left + flatRect.width / 2) - (targetScreenRect.left + targetScreenRect.width / 2);
    const phoneDy = (flatRect.top + flatRect.height / 2) - (targetScreenRect.top + targetScreenRect.height / 2);

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
    if (!ports.length) return;

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
        setTimeout(() => cardPorts[toIndex].classList.remove("pulse"), 400);
      }

      setActiveCard(toIndex);
      if (typeof onArrival === "function") onArrival();
    }, durationMs);
  }

  // ---------------------------------------------------------------- Initial setup
  applyGeometry(currentGeo);

  return {
    element: root,
    split,
    assemble,
    get isSplit() { return isSplit; },
    setActiveCard,
    travelPacket,
    updateGeometry: (w, h) => applyGeometry(rowGeometry(w, h)),
    layerArts,
    cards,
    unmount() {
      root.remove();
    }
  };
}
