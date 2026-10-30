// Application entry point managing routing, theme, loader, modes, and screen lifecycle.
// Uses js/router.js, js/screens/stage.js, js/screens/home.js, js/ui/loader.js, js/analytics.js, and js/demo.js.
// Used by index.html.

import { initRouter, onRoute, navigateTo } from "./router.js";
import { mount as mountStage } from "./screens/stage.js";
import { mount as mountHome } from "./screens/home.js";
import { shouldShowLoader, runLoader } from "./ui/loader.js";
import { initAnalytics } from "./analytics.js";
import { isDemoMode, initDemoMode, isPresenterMode, initPresenterMode } from "./demo.js";

let currentScreenInstance = null;

function renderRoute({ route, params }) {
  const root = document.getElementById("app-root");
  if (!root) return;

  if (currentScreenInstance && typeof currentScreenInstance.unmount === "function") {
    currentScreenInstance.unmount();
    currentScreenInstance = null;
  }

  const siteHeader = document.querySelector(".site-header");
  const siteFooter = document.querySelector(".site-footer");

  if (route === "app" && params.id) {
    // Hide standard site header/footer when in app stage to give full focus to stage header
    if (siteHeader) siteHeader.setAttribute("hidden", "");
    if (siteFooter) siteFooter.setAttribute("hidden", "");

    currentScreenInstance = mountStage(root, { appId: params.id });
  } else {
    // Home screen (route === "home" or empty / default)
    if (siteHeader) siteHeader.removeAttribute("hidden");
    if (siteFooter) siteFooter.removeAttribute("hidden");

    currentScreenInstance = mountHome(root);
  }
}

export function init() {
  if (shouldShowLoader()) {
    runLoader(document.body);
  }

  initAnalytics();

  if (isPresenterMode()) {
    initPresenterMode();
  }

  onRoute(renderRoute);
  initRouter();

  if (isDemoMode()) {
    navigateTo("#/app/Foodzy");
    setTimeout(() => {
      initDemoMode();
    }, 100);
  }
}

// Auto-boot if loaded in browser
if (typeof window !== "undefined") {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("test") !== "1") {
    window.addEventListener("DOMContentLoaded", init);
    if (document.readyState === "complete" || document.readyState === "interactive") {
      init();
    }
  }
}
