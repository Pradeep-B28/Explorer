// App stage screen rendering the header, 3D exploded stack, phone frame, and panel.
// Uses ui/phone.js, ui/exploded.js, apps/registry.js, content.js, and copy.js.
// Used by main.js and router.

import { getApp, getLayers } from "../content.js";
import { t } from "../copy.js";
import { getAppModule } from "../apps/registry.js";
import { createPhoneFrame } from "../ui/phone.js";
import { createExplodedStack } from "../ui/exploded.js";

const BACK_ARROW_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
`;

export function mount(container, { appId = "Foodzy" }) {
  const root = document.createElement("div");
  root.className = "stage-screen-layout";

  const appMeta = getApp(appId) || { id: appId, name: appId };
  const appModule = getAppModule(appId);

  // Stage Header
  const header = document.createElement("header");
  header.className = "stage-header";

  const headerLeft = document.createElement("div");
  headerLeft.className = "stage-header-left";

  const backLink = document.createElement("a");
  backLink.href = "#/";
  backLink.className = "stage-back-link";
  backLink.innerHTML = `${BACK_ARROW_SVG} <span>${t("stage.back")}</span>`;
  backLink.setAttribute("aria-label", t("stage.back"));

  const titleEl = document.createElement("h1");
  titleEl.className = "stage-app-title";
  titleEl.textContent = appMeta.name;

  headerLeft.appendChild(backLink);
  headerLeft.appendChild(titleEl);

  const headerRight = document.createElement("div");
  headerRight.className = "stage-header-right";

  const themeBtn = document.createElement("button");
  themeBtn.type = "button";
  themeBtn.className = "theme-toggle-btn stage-theme-btn";
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  themeBtn.textContent = currentTheme === "dark" ? t("theme.toLight") : t("theme.toDark");
  themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("tea-theme", next);
    } catch (e) {}
    themeBtn.textContent = next === "dark" ? t("theme.toLight") : t("theme.toDark");
  });

  headerRight.appendChild(themeBtn);
  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  root.appendChild(header);

  // Stage Main Body
  const body = document.createElement("div");
  body.className = "stage-body";

  // Left Column: Stage area holding the 3D Exploded Stack
  const stageCol = document.createElement("div");
  stageCol.className = "stage-col";

  const phoneObj = createPhoneFrame();
  const explodedStack = createExplodedStack(phoneObj, phoneObj.screenElement);
  stageCol.appendChild(explodedStack.element);

  // Expose on window for testing
  window.__explodedStack = explodedStack;

  // Mount the app into phone screen
  let appInstance = null;
  if (appModule && typeof appModule.mount === "function") {
    appInstance = appModule.mount(phoneObj.screenElement);
  }

  // Explode trigger button below the phone
  const explodeWrap = document.createElement("div");
  explodeWrap.className = "stage-explode-wrap";

  const explodeBtn = document.createElement("button");
  explodeBtn.type = "button";
  explodeBtn.className = "stage-explode-btn";
  explodeBtn.textContent = t("stage.explode");

  explodeBtn.addEventListener("click", () => {
    if (!explodedStack.isExploded) {
      explodedStack.explode();
      explodeBtn.textContent = t("stage.together");
      pTitle.textContent = t("stage.intro.title");
      pBody.textContent = t("stage.intro.body");
    } else {
      explodedStack.collapse();
      explodeBtn.textContent = t("stage.explode");
      pTitle.textContent = t("panel.intro.title");
      pBody.textContent = t("panel.intro.body");
    }
  });

  explodeWrap.appendChild(explodeBtn);
  stageCol.appendChild(explodeWrap);

  body.appendChild(stageCol);

  // Right Column: Panel
  const panelCol = document.createElement("div");
  panelCol.className = "stage-panel-col";

  const panelCard = document.createElement("div");
  panelCard.className = "stage-panel-card";

  const pTitle = document.createElement("h2");
  pTitle.className = "stage-panel-title";
  pTitle.textContent = t("panel.intro.title");

  const pBody = document.createElement("p");
  pBody.className = "stage-panel-body";
  pBody.textContent = t("panel.intro.body");

  panelCard.appendChild(pTitle);
  panelCard.appendChild(pBody);

  // Layers list chips
  const layersList = document.createElement("div");
  layersList.className = "stage-layers-list";
  getLayers().forEach((l, idx) => {
    const chip = document.createElement("div");
    chip.className = `stage-layer-chip layer-${l.id}`;
    chip.style.cursor = "pointer";
    chip.addEventListener("click", () => {
      if (explodedStack.isExploded) {
        explodedStack.setActiveLayer(idx);
      }
    });

    const dot = document.createElement("span");
    dot.className = "stage-layer-dot";
    dot.style.background = `var(--layer-${l.id})`;

    const name = document.createElement("strong");
    name.textContent = l.name;

    const tech = document.createElement("span");
    tech.className = "stage-layer-tech";
    tech.textContent = `(${l.tech})`;

    chip.appendChild(dot);
    chip.appendChild(name);
    chip.appendChild(tech);
    layersList.appendChild(chip);
  });
  panelCard.appendChild(layersList);

  panelCol.appendChild(panelCard);
  body.appendChild(panelCol);
  root.appendChild(body);

  // Responsive Phone & Exploded Scaling
  function handleResize() {
    const stageWidth = stageCol.clientWidth || window.innerWidth;
    const stageHeight = Math.max(window.innerHeight - 140, 500);
    phoneObj.updateScale(stageWidth, stageHeight);
    explodedStack.updateScale(stageWidth, stageHeight);
  }

  window.addEventListener("resize", handleResize);
  requestAnimationFrame(handleResize);

  container.replaceChildren(root);

  return {
    unmount() {
      window.removeEventListener("resize", handleResize);
      delete window.__explodedStack;
      if (appInstance && typeof appInstance.unmount === "function") {
        appInstance.unmount();
      }
      root.remove();
    }
  };
}
