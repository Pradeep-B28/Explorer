// Phone layout controller: Map strip, Big card, Wrapping code, Sticky controls, Bottom sheet flow list, and Flow end.
// UPGRADE_BRIEF.md Section 9 & 16 (Phase 4).
// Uses content.js, copy.js, engine/layout.js, motion.js, ui/icons.js, ui/codeview.js, ui/allcode.js, and ui/share.js.
// Used by ui/split.js.

import { LAYERS, getAppContent } from "../content.js";
import { t } from "../copy.js";
import { flatPhoneScale } from "../engine/layout.js";
import { prefersReducedMotion } from "../motion.js";
import { ICONS, getIconSvg } from "./icons.js";
import { tokenizeLine } from "./codeview.js";
import { isFlowWatched, getWatchedFlows } from "../progress.js";
import { getWhatsAppLink, getProgramLink } from "../links.js";
import { shareSite } from "./share.js";
import { openAllCodeSheet } from "./allcode.js";
import { travelMs, latestCodeByLayer } from "../engine/journey.js";
import { CONFIG } from "../../config.js";

const LAYER_COLORS = {
  screen: "var(--layer-screen)",
  styling: "var(--layer-styling)",
  logic: "var(--layer-logic)",
  server: "var(--layer-server)",
  database: "var(--layer-database)"
};

const LAYER_GLOWS = {
  screen: "rgba(52, 211, 153, 0.4)",
  styling: "rgba(167, 139, 250, 0.4)",
  logic: "rgba(250, 204, 21, 0.4)",
  server: "rgba(34, 211, 238, 0.4)",
  database: "rgba(129, 140, 248, 0.4)"
};

/**
 * Creates the Phone View controller.
 * @param {object} options
 * @param {object} options.phoneObj
 * @param {object} options.layerArts
 * @param {string} [options.appId="foodzy"]
 * @param {() => void} options.onSplit
 * @param {(journeyId: string) => void} options.onDoItForMe
 * @param {(journey: object) => void} options.onTryItYourself
 * @param {() => void} options.onPrev
 * @param {() => void} options.onPlayPause
 * @param {() => void} options.onNext
 * @param {(speed: number) => void} options.onSpeedChange
 * @returns {object}
 */
export function createPhoneView(options) {
  const {
    phoneObj,
    layerArts,
    appId = "foodzy",
    onSplit,
    onDoItForMe,
    onTryItYourself,
    onPrev,
    onPlayPause,
    onNext,
    onSpeedChange
  } = options;

  const { journeys } = getAppContent(appId) || {};

  const root = document.createElement("div");
  root.className = "phone-view-root";

  let isSplit = false;
  let activeLayer = "screen";
  let packetLayer = "screen";
  let activeLayerIndex = 0;
  let previousLayerIndex = 0;
  let isFollowingPacket = true;

  let currentJourney = null;
  let currentStep = null;
  let currentStepIdx = 0;
  let currentTotalSteps = 0;
  let currentSpeed = 1;
  let isPlaying = false;
  let isFlowEnded = false;
  let isTryingYourself = false;
  let activeDotAnim = null;

  // ---------------------------------------------------------------- 1. FLAT MODE (BEFORE SPLIT)
  const flatContainer = document.createElement("div");
  flatContainer.className = "phone-flat-container";

  const flatPhoneWrap = document.createElement("div");
  flatPhoneWrap.className = "phone-flat-phone-wrap";
  flatPhoneWrap.appendChild(phoneObj.frameElement);
  flatContainer.appendChild(flatPhoneWrap);

  const splitBtn = document.createElement("button");
  splitBtn.type = "button";
  splitBtn.className = "phone-split-btn";
  splitBtn.textContent = t("stage.explode");
  splitBtn.addEventListener("click", () => {
    if (typeof onSplit === "function") onSplit();
  });
  flatContainer.appendChild(splitBtn);

  root.appendChild(flatContainer);

  // ---------------------------------------------------------------- 2. SPLIT MODE CONTAINER
  const splitContainer = document.createElement("div");
  splitContainer.className = "phone-split-container hidden";

  // ---------------------------------------------------------------- 3. THE MAP STRIP (Sticky ~96px)
  const mapStrip = document.createElement("aside");
  mapStrip.className = "phone-map-strip";

  const stripInner = document.createElement("div");
  stripInner.className = "phone-strip-inner";

  // Tiles Row
  const tilesRow = document.createElement("div");
  tilesRow.className = "phone-strip-tiles-row";

  // Frontend Group (Screen, Styling, Logic) - Faint --layer-screen tint
  const frontendGroup = document.createElement("div");
  frontendGroup.className = "phone-strip-group group-frontend";

  // Gap with small cloud icon
  const cloudGap = document.createElement("div");
  cloudGap.className = "phone-strip-cloud-gap";
  cloudGap.innerHTML = getIconSvg("cloud", 14);
  cloudGap.setAttribute("title", t("stage.internet"));

  // Backend Group (Server, Database) - Faint --layer-database tint
  const backendGroup = document.createElement("div");
  backendGroup.className = "phone-strip-group group-backend";

  const tileElements = [];

  LAYERS.forEach((layer, idx) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `phone-strip-tile tile-${layer.id}`;
    tile.setAttribute("data-layer", layer.id);
    tile.setAttribute("aria-label", layer.name);
    tile.style.setProperty("--layer-color", LAYER_COLORS[layer.id]);
    tile.style.setProperty("--layer-glow", LAYER_GLOWS[layer.id]);

    const icon = document.createElement("span");
    icon.className = "phone-tile-icon";
    icon.innerHTML = getIconSvg(layer.id, 18);
    icon.style.color = LAYER_COLORS[layer.id];

    const label = document.createElement("span");
    label.className = "phone-tile-label";
    label.textContent = layer.name;

    tile.appendChild(icon);
    tile.appendChild(label);

    tile.addEventListener("click", () => {
      selectLayer(layer.id, false);
    });

    if (idx < 3) {
      frontendGroup.appendChild(tile);
    } else {
      backendGroup.appendChild(tile);
    }

    tileElements.push(tile);
  });

  tilesRow.appendChild(frontendGroup);
  tilesRow.appendChild(cloudGap);
  tilesRow.appendChild(backendGroup);
  stripInner.appendChild(tilesRow);

  // Bus Wire & 12px Glowing Packet Dot under the tiles
  const busArea = document.createElement("div");
  busArea.className = "phone-strip-bus-area";

  const busSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  busSvg.setAttribute("class", "phone-strip-bus-svg");

  const busLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  busLine.setAttribute("class", "phone-bus-line");
  busSvg.appendChild(busLine);

  busArea.appendChild(busSvg);

  // 12px Glowing Packet Dot
  const packetDot = document.createElement("div");
  packetDot.className = "phone-packet-dot";
  packetDot.style.setProperty("--layer-color", LAYER_COLORS.screen);
  busArea.appendChild(packetDot);

  stripInner.appendChild(busArea);

  // "Follow the packet" Pill (hidden by default)
  const followPill = document.createElement("button");
  followPill.type = "button";
  followPill.className = "phone-follow-pill hidden";
  followPill.innerHTML = `${getIconSvg("next", 12)} <span>${t("panel.follow")}</span>`;
  followPill.addEventListener("click", () => {
    isFollowingPacket = true;
    selectLayer(packetLayer, true);
    followPill.classList.add("hidden");
  });
  stripInner.appendChild(followPill);

  mapStrip.appendChild(stripInner);
  splitContainer.appendChild(mapStrip);

  // ---------------------------------------------------------------- 4. THE BIG CARD (Below Strip)
  const bigCardArea = document.createElement("div");
  bigCardArea.className = "phone-big-card-area";

  // Try it yourself banner (when user chooses Try it yourself)
  const tryBanner = document.createElement("div");
  tryBanner.className = "phone-try-banner hidden";
  const tryText = document.createElement("span");
  tryText.className = "phone-try-text";
  const tryCancelBtn = document.createElement("button");
  tryCancelBtn.type = "button";
  tryCancelBtn.className = "phone-try-cancel-btn";
  tryCancelBtn.textContent = t("panel.cancel");
  tryCancelBtn.addEventListener("click", () => {
    cancelTryItYourself();
  });
  tryBanner.appendChild(tryText);
  tryBanner.appendChild(tryCancelBtn);
  bigCardArea.appendChild(tryBanner);

  const bigCard = document.createElement("div");
  bigCard.className = "phone-big-card";

  // Header: layer icon, name 16px 800, tech chip, oneLine 13px
  const cardHeader = document.createElement("header");
  cardHeader.className = "phone-card-header";

  const headerLeft = document.createElement("div");
  headerLeft.className = "phone-card-header-left";

  const headerIcon = document.createElement("span");
  headerIcon.className = "phone-card-header-icon";
  headerLeft.appendChild(headerIcon);

  const headerName = document.createElement("h2");
  headerName.className = "phone-card-header-name";
  headerLeft.appendChild(headerName);

  const headerTech = document.createElement("span");
  headerTech.className = "phone-card-header-tech";
  headerLeft.appendChild(headerTech);

  cardHeader.appendChild(headerLeft);

  const headerOneLine = document.createElement("p");
  headerOneLine.className = "phone-card-header-oneline";
  cardHeader.appendChild(headerOneLine);

  bigCard.appendChild(cardHeader);

  // Layer Work Area (Screen phone, or Styling wireframe, or Logic nodes, or Server routes/log, or DB tables)
  const workArea = document.createElement("div");
  workArea.className = "phone-card-work-area";

  // Container for Screen layer phone inside big card
  const screenPhoneWrap = document.createElement("div");
  screenPhoneWrap.className = "phone-card-screen-wrap";

  const liveChip = document.createElement("div");
  liveChip.className = "phone-live-chip";
  liveChip.textContent = t("card.live");
  screenPhoneWrap.appendChild(liveChip);

  workArea.appendChild(screenPhoneWrap);
  bigCard.appendChild(workArea);

  // Step Details Area (below work): panel.step, title, say line, wrapping code, folded packet
  const stepDetailsArea = document.createElement("div");
  stepDetailsArea.className = "phone-card-step-details";

  const stepMetaRow = document.createElement("div");
  stepMetaRow.className = "phone-step-meta-row";

  const stepBadge = document.createElement("span");
  stepBadge.className = "phone-step-badge";
  stepMetaRow.appendChild(stepBadge);

  const stepLayerPill = document.createElement("span");
  stepLayerPill.className = "phone-step-layer-pill";
  stepMetaRow.appendChild(stepLayerPill);

  stepDetailsArea.appendChild(stepMetaRow);

  const stepTitle = document.createElement("h3");
  stepTitle.className = "phone-step-title";
  stepDetailsArea.appendChild(stepTitle);

  const stepSay = document.createElement("p");
  stepSay.className = "phone-step-say";
  stepDetailsArea.appendChild(stepSay);

  // Code Block (wraps with line numbers kept and hanging indent)
  const codeBox = document.createElement("div");
  codeBox.className = "phone-code-box";

  const codeHeader = document.createElement("div");
  codeHeader.className = "phone-code-header";

  const codeFilePath = document.createElement("span");
  codeFilePath.className = "phone-code-file-path";
  codeHeader.appendChild(codeFilePath);

  const codeLang = document.createElement("span");
  codeLang.className = "phone-code-lang";
  codeHeader.appendChild(codeLang);

  codeBox.appendChild(codeHeader);

  const codeLinesContainer = document.createElement("div");
  codeLinesContainer.className = "phone-code-lines";
  codeBox.appendChild(codeLinesContainer);

  stepDetailsArea.appendChild(codeBox);

  // Folded Packet Accordion ("What travels", tap to open)
  const packetAccordion = document.createElement("details");
  packetAccordion.className = "phone-packet-accordion";

  const packetSummary = document.createElement("summary");
  packetSummary.className = "phone-packet-summary";
  packetSummary.innerHTML = `<span>${t("panel.packet")}</span> <span class="phone-accordion-arrow">▼</span>`;
  packetAccordion.appendChild(packetSummary);

  const packetContent = document.createElement("div");
  packetContent.className = "phone-packet-content";

  const packetPre = document.createElement("pre");
  packetPre.className = "phone-packet-pre";
  const packetCode = document.createElement("code");
  packetPre.appendChild(packetCode);
  packetContent.appendChild(packetPre);

  packetAccordion.appendChild(packetContent);
  stepDetailsArea.appendChild(packetAccordion);

  bigCard.appendChild(stepDetailsArea);

  // Flow End Cards (Shown at flow complete)
  const flowEndArea = document.createElement("div");
  flowEndArea.className = "phone-flow-end-area hidden";

  // Card 1: Lesson
  const endLessonCard = document.createElement("div");
  endLessonCard.className = "phone-end-card end-card-lesson";
  const endLessonTitle = document.createElement("h3");
  endLessonTitle.className = "phone-end-title";
  const endLessonBody = document.createElement("p");
  endLessonBody.className = "phone-end-body";
  endLessonCard.appendChild(endLessonTitle);
  endLessonCard.appendChild(endLessonBody);
  flowEndArea.appendChild(endLessonCard);

  // Card 2: CTA
  const endCtaCard = document.createElement("div");
  endCtaCard.className = "phone-end-card end-card-cta";
  const endCtaTitle = document.createElement("h3");
  endCtaTitle.className = "phone-end-title";
  endCtaTitle.textContent = t("cta.title");
  const endCtaBody = document.createElement("p");
  endCtaBody.className = "phone-end-body";
  endCtaBody.textContent = t("cta.body", { program: CONFIG.program.name });

  const endWaBtn = document.createElement("a");
  endWaBtn.className = "phone-end-wa-btn";
  endWaBtn.target = "_blank";
  endWaBtn.rel = "noopener noreferrer";
  endWaBtn.innerHTML = `${ICONS.whatsapp} <span>${t("cta.whatsapp")}</span>`;

  const endProgramLink = document.createElement("a");
  endProgramLink.className = "phone-end-program-link";
  endProgramLink.target = "_blank";
  endProgramLink.rel = "noopener noreferrer";
  endProgramLink.textContent = `${t("cta.seeProgram")} →`;

  endCtaCard.appendChild(endCtaTitle);
  endCtaCard.appendChild(endCtaBody);
  endCtaCard.appendChild(endWaBtn);
  endCtaCard.appendChild(endProgramLink);
  flowEndArea.appendChild(endCtaCard);

  // Card 3: Progress & Actions
  const endActionsCard = document.createElement("div");
  endActionsCard.className = "phone-end-card end-card-actions";

  const endProgressText = document.createElement("p");
  endProgressText.className = "phone-end-progress-text";
  endActionsCard.appendChild(endProgressText);

  const tryAnotherBtn = document.createElement("button");
  tryAnotherBtn.type = "button";
  tryAnotherBtn.className = "phone-end-action-btn btn-try-another";
  tryAnotherBtn.textContent = "Try another flow";
  tryAnotherBtn.addEventListener("click", () => {
    openFlowSheet();
  });
  endActionsCard.appendChild(tryAnotherBtn);

  const seeAllCodeBtn = document.createElement("button");
  seeAllCodeBtn.type = "button";
  seeAllCodeBtn.className = "phone-end-action-btn btn-see-allcode";
  seeAllCodeBtn.textContent = t("panel.allCode");
  seeAllCodeBtn.addEventListener("click", () => {
    if (currentJourney) {
      openAllCodeSheet({ journey: currentJourney, layers: LAYERS });
    }
  });
  endActionsCard.appendChild(seeAllCodeBtn);

  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "phone-end-action-btn btn-share";
  shareBtn.textContent = "Share";
  shareBtn.addEventListener("click", () => {
    shareSite();
  });
  endActionsCard.appendChild(shareBtn);

  flowEndArea.appendChild(endActionsCard);
  bigCard.appendChild(flowEndArea);

  bigCardArea.appendChild(bigCard);
  splitContainer.appendChild(bigCardArea);

  // ---------------------------------------------------------------- 5. STICKY BOTTOM CONTROLS (48px buttons)
  const stickyControls = document.createElement("nav");
  stickyControls.className = "phone-sticky-controls";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "phone-ctrl-btn btn-back";
  backBtn.setAttribute("aria-label", t("panel.back"));
  backBtn.innerHTML = getIconSvg("back", 20);
  backBtn.addEventListener("click", () => {
    if (typeof onPrev === "function") onPrev();
  });
  stickyControls.appendChild(backBtn);

  const playPauseBtn = document.createElement("button");
  playPauseBtn.type = "button";
  playPauseBtn.className = "phone-ctrl-btn btn-play-pause";
  playPauseBtn.setAttribute("aria-label", t("panel.pause"));
  playPauseBtn.innerHTML = getIconSvg("pause", 20);
  playPauseBtn.addEventListener("click", () => {
    if (typeof onPlayPause === "function") onPlayPause();
  });
  stickyControls.appendChild(playPauseBtn);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "phone-ctrl-btn btn-next";
  nextBtn.setAttribute("aria-label", t("panel.next"));
  nextBtn.innerHTML = getIconSvg("next", 20);
  nextBtn.addEventListener("click", () => {
    if (typeof onNext === "function") onNext();
  });
  stickyControls.appendChild(nextBtn);

  // Speed Control Segmented Control (0.5x, 1x, 2x)
  const speedSeg = document.createElement("div");
  speedSeg.className = "phone-speed-seg";

  [0.5, 1, 2].forEach((spd) => {
    const spdBtn = document.createElement("button");
    spdBtn.type = "button";
    spdBtn.className = `phone-speed-btn ${spd === currentSpeed ? "active" : ""}`;
    spdBtn.textContent = `${spd}x`;
    spdBtn.addEventListener("click", () => {
      currentSpeed = spd;
      speedSeg.querySelectorAll(".phone-speed-btn").forEach((b) => b.classList.remove("active"));
      spdBtn.classList.add("active");
      if (typeof onSpeedChange === "function") onSpeedChange(spd);
    });
    speedSeg.appendChild(spdBtn);
  });

  stickyControls.appendChild(speedSeg);
  splitContainer.appendChild(stickyControls);

  // ---------------------------------------------------------------- 6. FLOW LIST BOTTOM SHEET
  const sheetScrim = document.createElement("div");
  sheetScrim.className = "phone-sheet-scrim hidden";

  const flowSheet = document.createElement("div");
  flowSheet.className = "phone-flow-sheet";

  const sheetHandle = document.createElement("div");
  sheetHandle.className = "phone-sheet-handle";
  flowSheet.appendChild(sheetHandle);

  const sheetTitle = document.createElement("h3");
  sheetTitle.className = "phone-sheet-title";
  sheetTitle.textContent = t("panel.flowsTitle");
  flowSheet.appendChild(sheetTitle);

  const flowsList = document.createElement("div");
  flowsList.className = "phone-flows-list";

  (journeys || []).forEach((j) => {
    const card = document.createElement("div");
    card.className = "phone-flow-card";

    const head = document.createElement("div");
    head.className = "phone-flow-head";

    const fTitle = document.createElement("h4");
    fTitle.className = "phone-flow-title";
    fTitle.textContent = j.title;
    head.appendChild(fTitle);

    if (isFlowWatched(j.id)) {
      const watched = document.createElement("span");
      watched.className = "phone-flow-watched-badge";
      watched.textContent = "✓ Watched";
      head.appendChild(watched);
    }

    card.appendChild(head);

    const hint = document.createElement("p");
    hint.className = "phone-flow-hint";
    hint.textContent = j.tryThis;
    card.appendChild(hint);

    const btnRow = document.createElement("div");
    btnRow.className = "phone-flow-btn-row";

    const tryBtn = document.createElement("button");
    tryBtn.type = "button";
    tryBtn.className = "phone-flow-try-btn";
    tryBtn.textContent = t("panel.tryIt");
    tryBtn.addEventListener("click", () => {
      closeFlowSheet();
      startTryItYourself(j);
    });
    btnRow.appendChild(tryBtn);

    const doBtn = document.createElement("button");
    doBtn.type = "button";
    doBtn.className = "phone-flow-do-btn";
    doBtn.textContent = t("panel.doIt");
    doBtn.addEventListener("click", () => {
      closeFlowSheet();
      if (typeof onDoItForMe === "function") onDoItForMe(j.id);
    });
    btnRow.appendChild(doBtn);

    card.appendChild(btnRow);
    flowsList.appendChild(card);
  });

  flowSheet.appendChild(flowsList);

  sheetScrim.addEventListener("click", () => {
    closeFlowSheet();
  });

  root.appendChild(splitContainer);
  root.appendChild(sheetScrim);
  root.appendChild(flowSheet);

  // ---------------------------------------------------------------- CORE VIEW LOGIC

  function openFlowSheet() {
    sheetScrim.classList.remove("hidden");
    requestAnimationFrame(() => {
      sheetScrim.classList.add("visible");
      flowSheet.classList.add("open");
    });
  }

  function closeFlowSheet() {
    sheetScrim.classList.remove("visible");
    flowSheet.classList.remove("open");
    setTimeout(() => {
      sheetScrim.classList.add("hidden");
    }, 250);
  }

  function updateBusLineGeometry() {
    if (!tileElements.length) return;
    const busRect = busArea.getBoundingClientRect();
    if (busRect.width === 0) return;

    const firstTileRect = tileElements[0].getBoundingClientRect();
    const lastTileRect = tileElements[4].getBoundingClientRect();

    const startX = firstTileRect.left + firstTileRect.width / 2 - busRect.left;
    const endX = lastTileRect.left + lastTileRect.width / 2 - busRect.left;

    busLine.setAttribute("x1", startX);
    busLine.setAttribute("y1", 10);
    busLine.setAttribute("x2", endX);
    busLine.setAttribute("y2", 10);

    // Position dot at active tile center if idle
    const activeTileRect = tileElements[activeLayerIndex].getBoundingClientRect();
    const dotX = activeTileRect.left + activeTileRect.width / 2 - busRect.left;
    packetDot.style.left = `${dotX}px`;
    packetDot.style.top = `10px`;
  }

  function getTileCenterX(idx) {
    const busRect = busArea.getBoundingClientRect();
    const tileRect = tileElements[idx].getBoundingClientRect();
    return tileRect.left + tileRect.width / 2 - busRect.left;
  }

  /**
   * Animates the 12px glowing packet dot along the bus wire (20% down, 60% along, 20% up).
   */
  function travelDot(fromIdx, toIdx, speed = 1) {
    if (activeDotAnim) {
      cancelAnimationFrame(activeDotAnim);
      activeDotAnim = null;
    }

    const startX = getTileCenterX(fromIdx);
    const targetX = getTileCenterX(toIdx);
    const busY = 10;
    const portY = 0; // tile bottom port
    const duration = travelMs(fromIdx, toIdx, speed);

    const destLayer = LAYERS[toIdx].id;
    packetDot.style.setProperty("--layer-color", LAYER_COLORS[destLayer]);

    if (prefersReducedMotion() || duration <= 0) {
      packetDot.style.left = `${targetX}px`;
      packetDot.style.top = `${busY}px`;
      return;
    }

    if (fromIdx === toIdx) {
      // Pulse in place
      packetDot.style.left = `${startX}px`;
      packetDot.style.top = `${busY}px`;
      packetDot.classList.add("pulsing");
      setTimeout(() => {
        packetDot.classList.remove("pulsing");
      }, duration);
      return;
    }

    const startTime = performance.now();

    function stepDot(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      let currentX = startX;
      let currentY = busY;

      if (progress < 0.2) {
        // Phase 1: 20% down from start port to bus
        const p1 = progress / 0.2;
        currentX = startX;
        currentY = portY + p1 * (busY - portY);
      } else if (progress < 0.8) {
        // Phase 2: 60% along bus from startX to targetX
        const p2 = (progress - 0.2) / 0.6;
        currentX = startX + p2 * (targetX - startX);
        currentY = busY;
      } else {
        // Phase 3: 20% up from bus to destination port
        const p3 = (progress - 0.8) / 0.2;
        currentX = targetX;
        currentY = busY - p3 * (busY - portY);
      }

      packetDot.style.left = `${currentX}px`;
      packetDot.style.top = `${currentY}px`;

      if (progress < 1) {
        activeDotAnim = requestAnimationFrame(stepDot);
      } else {
        packetDot.style.left = `${targetX}px`;
        packetDot.style.top = `${busY}px`;
        activeDotAnim = null;
      }
    }

    activeDotAnim = requestAnimationFrame(stepDot);
  }

  /**
   * Switches the active big card to the specified layer.
   * Slides in from right if moving forward, from left if moving backward.
   */
  function selectLayer(layerId, isPacketFollow = false) {
    const newIdx = LAYERS.findIndex((l) => l.id === layerId);
    if (newIdx === -1) return;

    const oldIdx = activeLayerIndex;
    activeLayer = layerId;
    activeLayerIndex = newIdx;

    if (isPacketFollow) {
      isFollowingPacket = true;
      followPill.classList.add("hidden");
    } else {
      if (layerId !== packetLayer) {
        isFollowingPacket = false;
        followPill.classList.remove("hidden");
      } else {
        isFollowingPacket = true;
        followPill.classList.add("hidden");
      }
    }

    // Update active tile on map strip
    tileElements.forEach((tEl, idx) => {
      if (idx === newIdx) {
        tEl.classList.add("active");
        tEl.style.borderColor = LAYER_COLORS[layerId];
      } else {
        tEl.classList.remove("active");
        tEl.style.borderColor = "transparent";
      }
    });

    const meta = LAYERS[newIdx];
    bigCard.style.setProperty("--layer-color", LAYER_COLORS[layerId]);
    bigCard.style.setProperty("--layer-glow", LAYER_GLOWS[layerId]);

    // Update Card Header
    headerIcon.innerHTML = getIconSvg(meta.id, 20);
    headerIcon.style.color = LAYER_COLORS[meta.id];
    headerName.textContent = meta.name;
    headerTech.textContent = meta.tech;
    headerOneLine.textContent = meta.oneLine;

    // Reparent active layer work into big card workArea
    workArea.replaceChildren();

    if (meta.id === "screen") {
      screenPhoneWrap.replaceChildren();
      screenPhoneWrap.appendChild(liveChip);
      screenPhoneWrap.appendChild(phoneObj.frameElement);
      workArea.appendChild(screenPhoneWrap);
      const scale = flatPhoneScale(window.innerWidth, window.innerHeight, "phone");
      phoneObj.setScale(scale);
    } else if (meta.id === "styling" && layerArts?.styling?.element) {
      workArea.appendChild(layerArts.styling.element);
      layerArts.styling.redraw();
    } else if (meta.id === "logic" && layerArts?.logic?.element) {
      workArea.appendChild(layerArts.logic.element);
    } else if (meta.id === "server" && layerArts?.server?.element) {
      workArea.appendChild(layerArts.server.element);
    } else if (meta.id === "database" && layerArts?.database?.element) {
      workArea.appendChild(layerArts.database.element);
    }

    // Big Card Slide Transition (300 ms, from right if moving right, from left if moving left)
    if (!prefersReducedMotion() && oldIdx !== newIdx) {
      bigCard.classList.remove("slide-from-right", "slide-from-left");
      void bigCard.offsetWidth; // trigger reflow
      if (newIdx > oldIdx) {
        bigCard.classList.add("slide-from-right");
      } else {
        bigCard.classList.add("slide-from-left");
      }
    }
  }

  /**
   * Updates the step details, wrapping code, and folded packet data inside the big card.
   */
  function renderStep(step, journey, current, total, speed) {
    currentStep = step;
    currentJourney = journey;
    currentStepIdx = current;
    currentTotalSteps = total;
    currentSpeed = speed;
    packetLayer = step.layer;
    isFlowEnded = false;

    flowEndArea.classList.add("hidden");
    stepDetailsArea.classList.remove("hidden");

    // Always follow packet on new step unless user was viewing another layer
    previousLayerIndex = activeLayerIndex;
    const destIdx = LAYERS.findIndex((l) => l.id === step.layer);

    travelDot(previousLayerIndex, destIdx, speed);

    selectLayer(step.layer, true);

    // 1. Step Meta & Titles
    stepBadge.textContent = t("panel.step", { n: current, total });
    stepBadge.style.color = LAYER_COLORS[step.layer];

    stepLayerPill.textContent = step.layer.toUpperCase();
    stepLayerPill.style.backgroundColor = LAYER_COLORS[step.layer];

    stepTitle.textContent = step.title;
    stepSay.textContent = step.say;

    // 2. Code Box: file path, lang, and WRAPPING lines with line numbers & hanging indent
    codeFilePath.textContent = step.code?.file || "";
    codeLang.textContent = (step.code?.lang || "js").toUpperCase();

    codeLinesContainer.replaceChildren();

    const rawLines = step.code?.lines || [];
    const lang = step.code?.lang || "js";

    rawLines.forEach((lineText, idx) => {
      const lineRow = document.createElement("div");
      lineRow.className = "phone-code-line";

      const numCol = document.createElement("span");
      numCol.className = "phone-line-num";
      numCol.textContent = idx + 1;

      const codeCol = document.createElement("span");
      codeCol.className = "phone-line-content";
      codeCol.innerHTML = tokenizeLine(lineText, lang);

      lineRow.appendChild(numCol);
      lineRow.appendChild(codeCol);
      codeLinesContainer.appendChild(lineRow);
    });

    // 3. Folded Packet Accordion ("What travels", folded by default)
    packetAccordion.open = false;
    packetCode.textContent = JSON.stringify(step.packet || {}, null, 2);
  }

  /**
   * Displays the Flow End cards inside the big card.
   */
  function showFlowEnd(journey) {
    isFlowEnded = true;
    currentJourney = journey;

    stepDetailsArea.classList.add("hidden");
    flowEndArea.classList.remove("hidden");

    // Card 1: Lesson
    endLessonTitle.textContent = journey.end?.title || "What just happened?";
    endLessonBody.textContent = journey.end?.lesson || "";

    // Card 2: CTA links
    endWaBtn.href = getWhatsAppLink(journey.id);
    endProgramLink.href = getProgramLink(journey.id);

    // Card 3: Progress text
    const watched = getWatchedFlows();
    const count = watched.length;
    const total = (journeys || []).length;
    if (count >= total) {
      endProgressText.textContent = t("cta.all");
    } else {
      endProgressText.textContent = t("cta.progress", { count, total });
    }
  }

  /**
   * "Try it yourself" mode on phone.
   */
  function startTryItYourself(journey) {
    isTryingYourself = true;
    tryText.textContent = t("panel.yourTurn", { hint: journey.tryThis });
    tryBanner.classList.remove("hidden");

    // Switch big card to live Screen layer
    selectLayer("screen", true);

    if (typeof onTryItYourself === "function") {
      onTryItYourself(journey);
    }
  }

  function cancelTryItYourself() {
    isTryingYourself = false;
    tryBanner.classList.add("hidden");
    openFlowSheet();
  }

  /**
   * The phone split animation (Section 9):
   * Phone shrinks up into Screen tile (500 ms).
   * The other 4 tiles slide out sideways into strip (500 ms, 60 ms apart).
   * Then big card fades in below.
   */
  function playSplitAnimation(callback) {
    if (isSplit) return;
    isSplit = true;

    if (prefersReducedMotion()) {
      flatContainer.style.display = "none";
      splitContainer.classList.remove("hidden");
      selectLayer("screen", true);
      updateBusLineGeometry();
      openFlowSheet();
      if (typeof callback === "function") callback();
      return;
    }

    // Normal motion
    const screenTile = tileElements[0];

    // Measure starting position
    const startWrapRect = flatPhoneWrap.getBoundingClientRect();
    const targetTileRect = screenTile.getBoundingClientRect();

    // Prepare tiles: tiles 1 to 4 start translated over tile 0
    const t0Rect = tileElements[0].getBoundingClientRect();
    tileElements.slice(1).forEach((tile) => {
      const rect = tile.getBoundingClientRect();
      const dx = t0Rect.left - rect.left;
      tile.style.transform = `translateX(${dx}px)`;
      tile.style.opacity = "0";
      tile.style.transition = "none";
    });

    // Make split container visible with zero opacity on card
    splitContainer.classList.remove("hidden");
    bigCardArea.style.opacity = "0";
    bigCardArea.style.transform = "translateY(16px)";
    bigCardArea.style.transition = "opacity 300ms ease, transform 300ms ease";

    // Animate flat phone shrinking up into screen tile
    flatPhoneWrap.style.transition = "transform 500ms var(--ease-out), opacity 500ms ease";
    const dy = targetTileRect.top - startWrapRect.top;
    const dx = targetTileRect.left - startWrapRect.left;
    const scaleFactor = 0.12;
    flatPhoneWrap.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleFactor})`;
    flatPhoneWrap.style.opacity = "0.2";

    // Stagger slide-out of the 4 tiles: 60ms apart, 500ms duration
    tileElements.slice(1).forEach((tile, i) => {
      setTimeout(() => {
        tile.style.transition = "transform 500ms var(--ease-out), opacity 300ms ease";
        tile.style.transform = "none";
        tile.style.opacity = "1";
      }, (i + 1) * 60);
    });

    setTimeout(() => {
      // Cleanup flat phone wrap and show phone inside screen card
      flatContainer.style.display = "none";
      flatPhoneWrap.style.transform = "none";
      flatPhoneWrap.style.opacity = "1";

      selectLayer("screen", true);
      updateBusLineGeometry();

      // Fade in big card below
      bigCardArea.style.opacity = "1";
      bigCardArea.style.transform = "none";

      openFlowSheet();

      if (typeof callback === "function") callback();
    }, 550);
  }

  function assemble() {
    isSplit = false;
    isFlowEnded = false;
    isTryingYourself = false;
    tryBanner.classList.add("hidden");
    closeFlowSheet();

    splitContainer.classList.add("hidden");
    flatContainer.style.display = "flex";

    flatPhoneWrap.replaceChildren();
    flatPhoneWrap.appendChild(phoneObj.frameElement);

    const scale = flatPhoneScale(window.innerWidth, window.innerHeight, "phone");
    phoneObj.setScale(scale);
  }

  function updateGeometry(width, height) {
    const scale = flatPhoneScale(width, height, "phone");
    phoneObj.setScale(scale);
    updateBusLineGeometry();
  }

  function setPlayState(playing) {
    isPlaying = playing;
    playPauseBtn.innerHTML = playing ? getIconSvg("pause", 20) : getIconSvg("play", 20);
    playPauseBtn.setAttribute("aria-label", playing ? t("panel.pause") : t("panel.play"));
  }

  // Initial scale
  const initialScale = flatPhoneScale(window.innerWidth, window.innerHeight, "phone");
  phoneObj.setScale(initialScale);

  return {
    element: root,
    get isSplit() { return isSplit; },
    get activeLayer() { return activeLayer; },
    playSplitAnimation,
    assemble,
    selectLayer,
    renderStep,
    showFlowEnd,
    openFlowSheet,
    closeFlowSheet,
    startTryItYourself,
    cancelTryItYourself,
    setPlayState,
    updateGeometry,
    travelDot,
    updateBusLineGeometry
  };
}