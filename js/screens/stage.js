// App stage screen rendering the header, split view on laptop, phone frame, and dock.
// Uses ui/phone.js, ui/split.js, apps/registry.js, content.js, and copy.js.
// Used by main.js and router.

import { getApp, getLayers } from "../content.js";
import { t } from "../copy.js";
import { getAppModule } from "../apps/registry.js";
import { createPhoneFrame } from "../ui/phone.js";
import { createSplitView } from "../ui/split.js";
import { createShareButton } from "../ui/share.js";
import { ICONS, getIconSvg } from "../ui/icons.js";
import { emit } from "../events.js";
import { layoutFor } from "../engine/layout.js";

export function mount(container, { appId = "foodzy" }) {
  const root = document.createElement("div");
  root.className = "stage-screen-layout";

  const appMeta = getApp(appId) || { id: appId, name: appId };
  const appModule = getAppModule(appId);

  // 1. Stage Header (Section 12: 64px, Explorer wordmark, All apps, App name, Share, 40px theme button)
  const header = document.createElement("header");
  header.className = "stage-header";

  const headerLeft = document.createElement("div");
  headerLeft.className = "stage-header-left";

  const wordmark = document.createElement("a");
  wordmark.href = "#/";
  wordmark.className = "stage-wordmark";
  wordmark.setAttribute("aria-label", "Explorer Home");
  wordmark.innerHTML = `${ICONS.splitLayers} <span>Explorer</span>`;
  headerLeft.appendChild(wordmark);

  const backLink = document.createElement("a");
  backLink.href = "#/";
  backLink.className = "stage-back-link";
  backLink.innerHTML = `${getIconSvg("back", 16)} <span>${t("stage.back")}</span>`;
  backLink.setAttribute("aria-label", t("stage.back"));
  headerLeft.appendChild(backLink);

  const titleEl = document.createElement("span");
  titleEl.className = "stage-app-title";
  titleEl.textContent = appMeta.name;
  headerLeft.appendChild(titleEl);

  header.appendChild(headerLeft);

  const headerRight = document.createElement("div");
  headerRight.className = "stage-header-right";

  const shareBtn = createShareButton({ className: "stage-share-btn" });
  headerRight.appendChild(shareBtn);

  // 40px theme icon button (sun/moon)
  const themeBtn = document.createElement("button");
  themeBtn.type = "button";
  themeBtn.className = "stage-theme-btn";

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const label = isDark ? t("theme.toLight") : t("theme.toDark");
    themeBtn.setAttribute("aria-label", label);
    themeBtn.setAttribute("title", label);
    themeBtn.innerHTML = isDark ? getIconSvg("sun", 20) : getIconSvg("moon", 20);
  }

  updateThemeIcon();

  themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("tea-theme", next);
    } catch (e) {}
    updateThemeIcon();
  });

  headerRight.appendChild(themeBtn);
  header.appendChild(headerRight);
  root.appendChild(header);

  // 2. Main phone frame & Split View
  const phoneObj = createPhoneFrame();

  // Mount the app (Foodzy) into phone screen
  let appInstance = null;
  if (appModule && typeof appModule.mount === "function") {
    appInstance = appModule.mount(phoneObj.screenElement);
  }

  const splitView = createSplitView({
    phoneObj,
    phoneScreenEl: phoneObj.screenElement,
    appId,
    onDoItForMe: (journeyId) => {
      if (appModule && typeof appModule.doItForMe === "function") {
        appModule.doItForMe(journeyId);
      }
    }
  });

  root.appendChild(splitView.element);

  // 3. Responsive resize handler
  function handleResize() {
    splitView.updateGeometry(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", handleResize);
  requestAnimationFrame(handleResize);

  container.replaceChildren(root);
  emit("app_open", { app: appId });

  return {
    unmount() {
      window.removeEventListener("resize", handleResize);
      if (splitView && typeof splitView.unmount === "function") {
        splitView.unmount();
      }
      if (appInstance && typeof appInstance.unmount === "function") {
        appInstance.unmount();
      }
      root.remove();
    }
  };
}
