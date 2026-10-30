// Manages the stage side panel: flow list, step player, controls, keyboard shortcuts, and flow transitions.
// Uses player.js, codeview.js, cta.js, copy.js, content.js, progress.js, and events.js.
// Used by screens/stage.js.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getJourneys, getLayers } from "../content.js";
import { isFlowWatched, markFlowWatched } from "../progress.js";
import { createPlayer } from "../player.js";
import { renderCodeView } from "./codeview.js";
import { renderCtaCard } from "./cta.js";
import { showToast } from "./toast.js";
import { on } from "../events.js";

/**
 * Creates and mounts the Panel controller.
 * @param {HTMLElement} container
 * @param {object} options
 * @param {string} [options.appId="Foodzy"]
 * @param {object} options.explodedStack
 * @param {(journeyId: string) => void} options.onDoItForMe
 * @returns {object}
 */
export function createPanel(container, options) {
  const { appId = "Foodzy", explodedStack, onDoItForMe } = options;
  const journeys = getJourneys(appId);
  const layers = getLayers();

  const panelRoot = document.createElement("div");
  panelRoot.className = "panel-container";

  const dragHandle = document.createElement("div");
  dragHandle.className = "panel-sheet-handle";
  panelRoot.appendChild(dragHandle);

  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", "polite");
  announcer.className = "sr-only";
  announcer.style.cssText = "position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
  panelRoot.appendChild(announcer);

  const panelBody = document.createElement("div");
  panelBody.className = "panel-dynamic-body";
  panelRoot.appendChild(panelBody);

  container.replaceChildren(panelRoot);

  let activePlayer = null;
  let codeViewHandle = null;
  let currentSpeed = CONFIG.defaultSpeed || 1;
  let screenBlocker = null;

  function setScreenBlocker(active) {
    const screen = document.getElementById("phone-screen");
    if (!screen) return;
    if (active && !screenBlocker) {
      screenBlocker = document.createElement("div");
      screenBlocker.className = "stage-screen-blocker";
      screenBlocker.addEventListener("click", (e) => {
        e.stopPropagation();
        showToast(t("panel.busy"), screen);
      });
      screen.appendChild(screenBlocker);
    } else if (!active && screenBlocker) {
      screenBlocker.remove();
      screenBlocker = null;
    }
  }

  function renderFlowList() {
    setScreenBlocker(false);
    if (codeViewHandle) {
      codeViewHandle.cancel();
      codeViewHandle = null;
    }
    panelBody.replaceChildren();

    const header = document.createElement("div");
    header.className = "panel-flows-header";
    const title = document.createElement("h3");
    title.className = "panel-flows-title";
    title.textContent = t("panel.flowsTitle");
    header.appendChild(title);
    panelBody.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "panel-flows-grid";

    journeys.forEach(j => {
      const card = document.createElement("div");
      card.className = "panel-flow-card";

      const top = document.createElement("div");
      top.className = "panel-flow-top";
      const name = document.createElement("h4");
      name.className = "panel-flow-name";
      name.textContent = j.title;
      top.appendChild(name);

      if (isFlowWatched(j.id)) {
        const badge = document.createElement("span");
        badge.className = "panel-watched-badge";
        badge.textContent = `✓ ${t("panel.watched")}`;
        top.appendChild(badge);
      }
      card.appendChild(top);

      const hint = document.createElement("p");
      hint.className = "panel-flow-hint";
      hint.textContent = j.tryThis;
      card.appendChild(hint);

      if (CONFIG.features.doItForMe) {
        const actions = document.createElement("div");
        actions.className = "panel-flow-actions";
        const doitBtn = document.createElement("button");
        doitBtn.type = "button";
        doitBtn.className = "panel-doit-btn";
        doitBtn.textContent = t("panel.doIt");
        doitBtn.addEventListener("click", () => {
          if (!explodedStack.isExploded) explodedStack.explode();
          if (typeof onDoItForMe === "function") onDoItForMe(j.id);
        });
        actions.appendChild(doitBtn);
        card.appendChild(actions);
      }
      grid.appendChild(card);
    });
    panelBody.appendChild(grid);
  }

  function startFlow(requestData) {
    const { journeyId, values, commit } = requestData;
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return;

    if (!explodedStack.isExploded) explodedStack.explode();
    if (activePlayer) activePlayer.close();

    setScreenBlocker(true);
    activePlayer = createPlayer({
      journey,
      layers,
      values,
      speed: currentSpeed,
      commit,
      autoPlay: CONFIG.features.autoPlay,
      onStep: (step, index) => renderStep(step, index, journey),
      onComplete: (j) => {
        setScreenBlocker(false);
        markFlowWatched(j.id);
        explodedStack.setActiveLayer(-1);
        renderCtaCard(panelBody, { journey: j, journeys, onTryAnother: renderFlowList });
      }
    });
    activePlayer.start();
  }

  function renderStep(step, index, journey) {
    panelBody.replaceChildren();

    const toIndex = step.to !== undefined ? step.to : 0;
    const fromIndex = step.from !== undefined ? step.from : toIndex;

    explodedStack.packet.travel(
      fromIndex, toIndex, step.travel,
      step.packet ? step.packet.label : "step",
      step.layer,
      () => explodedStack.setActiveLayer(toIndex)
    );

    if (step.layer === "styling" && explodedStack.stylingArt) {
      explodedStack.stylingArt.highlight(step.code && step.code.lines ? step.code.lines[0] : "");
    } else if (step.layer === "logic" && explodedStack.logicArt) {
      explodedStack.logicArt.pulseNodes();
    } else if (step.layer === "server" && explodedStack.serverArt && step.log) {
      explodedStack.serverArt.addLog(step.log);
    } else if (step.layer === "database" && explodedStack.databaseArt && step.db) {
      explodedStack.databaseArt.execute(step.db);
    }

    announcer.textContent = `${t("panel.step", { n: index + 1, total: activePlayer.steps.length })}: ${step.title}. ${step.say}`;

    // Header & Progress
    const header = document.createElement("div");
    header.className = "panel-playing-header";

    const topBar = document.createElement("div");
    topBar.className = "panel-playing-topbar";
    const flowTitle = document.createElement("h3");
    flowTitle.className = "panel-playing-title";
    flowTitle.textContent = journey.title;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "panel-close-btn";
    closeBtn.textContent = "✕";
    closeBtn.setAttribute("aria-label", t("panel.close"));
    closeBtn.addEventListener("click", () => {
      if (activePlayer) activePlayer.close();
      renderFlowList();
    });

    topBar.appendChild(flowTitle);
    topBar.appendChild(closeBtn);
    header.appendChild(topBar);

    const progressBar = document.createElement("div");
    progressBar.className = "panel-progress-bar";
    activePlayer.steps.forEach((st, idx) => {
      const seg = document.createElement("div");
      seg.className = `panel-progress-seg ${idx === index ? "active" : ""} ${idx < index ? "done" : ""}`;
      seg.style.backgroundColor = `var(--layer-${st.layer})`;
      progressBar.appendChild(seg);
    });
    header.appendChild(progressBar);
    panelBody.appendChild(header);

    // Step Card
    const stepCard = document.createElement("div");
    stepCard.className = "panel-step-card";

    const stepMeta = document.createElement("div");
    stepMeta.className = "panel-step-meta";
    const stepCount = document.createElement("span");
    stepCount.className = "panel-step-count";
    stepCount.textContent = t("panel.step", { n: index + 1, total: activePlayer.steps.length });
    const layerTag = document.createElement("span");
    layerTag.className = "panel-code-lang";
    layerTag.textContent = step.layer;
    layerTag.style.color = `var(--layer-${step.layer})`;
    stepMeta.appendChild(stepCount);
    stepMeta.appendChild(layerTag);
    stepCard.appendChild(stepMeta);

    const stepTitle = document.createElement("h4");
    stepTitle.className = "panel-step-title";
    stepTitle.textContent = step.title;
    stepCard.appendChild(stepTitle);

    const stepSay = document.createElement("p");
    stepSay.className = "panel-step-say";
    stepSay.textContent = step.say;
    stepCard.appendChild(stepSay);

    // Code block
    if (step.code && step.code.lines && step.code.lines.length > 0) {
      const codeSec = document.createElement("div");
      codeSec.className = "panel-code-section";
      const codeHead = document.createElement("div");
      codeHead.className = "panel-code-header";
      const codeLabel = document.createElement("span");
      codeLabel.className = "panel-code-label";
      codeLabel.textContent = t("panel.code");
      const codeLang = document.createElement("span");
      codeLang.className = "panel-code-lang";
      codeLang.textContent = step.code.lang;
      codeHead.appendChild(codeLabel);
      codeHead.appendChild(codeLang);
      codeSec.appendChild(codeHead);

      const codeContainer = document.createElement("div");
      codeContainer.className = "panel-code-container";
      codeSec.appendChild(codeContainer);
      if (codeViewHandle) codeViewHandle.cancel();
      codeViewHandle = renderCodeView(codeContainer, step.code);
      stepCard.appendChild(codeSec);
    }

    // Packet data
    if (step.packet && step.packet.data) {
      const packetSec = document.createElement("div");
      packetSec.className = "panel-packet-section";
      const packetHead = document.createElement("div");
      packetHead.className = "panel-packet-header";
      const packetLabel = document.createElement("span");
      packetLabel.className = "panel-packet-label";
      packetLabel.textContent = t("panel.packet");
      const packetTag = document.createElement("span");
      packetTag.className = "panel-packet-tag";
      packetTag.textContent = step.packet.label;
      packetHead.appendChild(packetLabel);
      packetHead.appendChild(packetTag);
      packetSec.appendChild(packetHead);

      const jsonPre = document.createElement("pre");
      jsonPre.className = "panel-packet-json";
      jsonPre.textContent = JSON.stringify(step.packet.data, null, 2);
      packetSec.appendChild(jsonPre);
      stepCard.appendChild(packetSec);
    }
    panelBody.appendChild(stepCard);

    // Controls
    const controls = document.createElement("div");
    controls.className = "panel-controls-row";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "panel-ctrl-btn";
    prevBtn.textContent = `← ${t("panel.prev")}`;
    prevBtn.disabled = index === 0;
    prevBtn.addEventListener("click", () => activePlayer.prev());

    const playPauseBtn = document.createElement("button");
    playPauseBtn.type = "button";
    playPauseBtn.className = "panel-ctrl-btn panel-play-btn";
    playPauseBtn.textContent = activePlayer.isPlaying ? t("panel.pause") : t("panel.play");
    playPauseBtn.addEventListener("click", () => {
      if (activePlayer.isPlaying) {
        activePlayer.pause();
        playPauseBtn.textContent = t("panel.play");
      } else {
        activePlayer.play();
        playPauseBtn.textContent = t("panel.pause");
      }
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "panel-ctrl-btn";
    nextBtn.textContent = `${t("panel.next")} →`;
    nextBtn.disabled = index === activePlayer.steps.length - 1;
    nextBtn.addEventListener("click", () => activePlayer.next());

    controls.appendChild(prevBtn);
    controls.appendChild(playPauseBtn);
    controls.appendChild(nextBtn);

    const speedGroup = document.createElement("div");
    speedGroup.className = "panel-speed-group";
    (CONFIG.speeds || [0.5, 1, 2]).forEach(sp => {
      const spBtn = document.createElement("button");
      spBtn.type = "button";
      spBtn.className = `panel-speed-btn ${sp === currentSpeed ? "active" : ""}`;
      spBtn.textContent = `${sp}x`;
      spBtn.addEventListener("click", () => {
        currentSpeed = sp;
        activePlayer.setSpeed(sp);
        speedGroup.querySelectorAll(".panel-speed-btn").forEach(b => b.classList.remove("active"));
        spBtn.classList.add("active");
      });
      speedGroup.appendChild(spBtn);
    });
    controls.appendChild(speedGroup);
    panelBody.appendChild(controls);
  }

  function handleKeyDown(e) {
    const tag = e.target ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return;
    if (!activePlayer || activePlayer.isEnded) return;

    if (e.key === " ") {
      e.preventDefault();
      if (activePlayer.isPlaying) activePlayer.pause();
      else activePlayer.play();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activePlayer.prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      activePlayer.next();
    } else if (e.key === "Escape") {
      e.preventDefault();
      activePlayer.close();
      renderFlowList();
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  const unsubRequest = on("journey:request", (req) => startFlow(req));
  renderFlowList();

  return {
    renderFlowList,
    startFlow,
    get activePlayer() { return activePlayer; },
    unmount() {
      window.removeEventListener("keydown", handleKeyDown);
      unsubRequest();
      setScreenBlocker(false);
      if (activePlayer) activePlayer.close();
      if (codeViewHandle) codeViewHandle.cancel();
      panelRoot.remove();
    }
  };
}
