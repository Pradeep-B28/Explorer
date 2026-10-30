// Analytics manager for Google Analytics 4 (GA4) and Meta Pixel.
// Uses config.js and events.js.
// Used by main.js.

import { CONFIG } from "../config.js";
import { on } from "./events.js";

/**
 * Initializes GA4 and Meta Pixel tracking if configured and not in demo/test/presenter mode.
 */
export function initAnalytics() {
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const isExcluded =
    urlParams.get("test") === "1" ||
    urlParams.get("demo") === "1" ||
    urlParams.get("present") === "1";

  if (isExcluded) return;

  const ga4Id = CONFIG.analytics?.ga4Id?.trim();
  const metaPixelId = CONFIG.analytics?.metaPixelId?.trim();

  // Initialize GA4
  if (ga4Id) {
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", ga4Id); // Fires page_view on load
  }

  // Initialize Meta Pixel
  if (metaPixelId) {
    if (!window.fbq) {
      const fbq = function () {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, arguments);
        } else {
          fbq.queue.push(arguments);
        }
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;

      const fbScript = document.createElement("script");
      fbScript.async = true;
      fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(fbScript);
    }

    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView"); // PageView on load
  }

  // Event Listeners (Strictly limited to spec; NEVER user-typed text or search queries)
  on("app_open", ({ app }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "app_open", { app });
    }
  });

  on("explode_open", ({ app }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "explode_open", { app });
    }
  });

  on("flow_start", ({ flow, how }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "flow_start", { flow, how: how || "tap" });
    }
  });

  on("flow_complete", ({ flow }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "flow_complete", { flow });
    }
    if (metaPixelId && window.fbq) {
      window.fbq("trackCustom", "FlowCompleted", { flow });
    }
  });

  on("cta_whatsapp", ({ flow }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "cta_whatsapp", { flow });
    }
    if (metaPixelId && window.fbq) {
      window.fbq("track", "Lead", { flow });
    }
  });

  on("cta_program", ({ flow }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "cta_program", { flow });
    }
  });

  on("share", ({ method }) => {
    if (ga4Id && window.gtag) {
      window.gtag("event", "share", { method });
    }
  });
}
