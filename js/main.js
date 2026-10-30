// Application entry point managing routing, theme, and screen lifecycle.
// Uses js/router.js, js/screens/stage.js, and js/store.js.
// Used by index.html.

import { initRouter, onRoute, navigateTo } from "./router.js";
import { mount as mountStage } from "./screens/stage.js";

let currentScreenInstance = null;

function renderRoute({ route, params }) {
  const root = document.getElementById("app-root");
  if (!root) return;

  if (currentScreenInstance && typeof currentScreenInstance.unmount === "function") {
    currentScreenInstance.unmount();
    currentScreenInstance = null;
  }

  if (route === "app" && params.id) {
    // Hide standard site header/footer when in app stage to give full focus to stage header
    const siteHeader = document.querySelector(".site-header");
    if (siteHeader) siteHeader.setAttribute("hidden", "");

    currentScreenInstance = mountStage(root, { appId: params.id });
  } else {
    // Default to Foodzy stage in Phase 2
    navigateTo("#/app/Foodzy");
  }
}

export function init() {
  onRoute(renderRoute);
  initRouter();
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
