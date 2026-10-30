// Session loader with 5 sliding layer bars and logo reveal.
// Uses sessionStorage (tea-intro-seen) and tokens.css colors.
// Used by main.js.

import { prefersReducedMotion } from "../motion.js";

/**
 * Checks if the loader should be shown for this session.
 * @returns {boolean}
 */
export function shouldShowLoader() {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("test") === "1" || urlParams.get("demo") === "1" || urlParams.get("present") === "1") {
    return false;
  }

  try {
    return !sessionStorage.getItem("tea-intro-seen");
  } catch (e) {
    return false;
  }
}

/**
 * Marks intro as seen in sessionStorage.
 */
function markLoaderSeen() {
  try {
    sessionStorage.setItem("tea-intro-seen", "1");
  } catch (e) {
    // Storage blocked, ignore
  }
}

/**
 * Runs the loader animation and removes it when done (under 1.2s total).
 * @param {HTMLElement} parent
 * @param {() => void} [onComplete]
 */
export function runLoader(parent, onComplete) {
  markLoaderSeen();

  const overlay = document.createElement("div");
  overlay.className = "site-intro-loader";

  const frame = document.createElement("div");
  frame.className = "loader-phone-outline";

  const LAYER_COLORS = [
    "var(--layer-screen)",
    "var(--layer-styling)",
    "var(--layer-logic)",
    "var(--layer-server)",
    "var(--layer-database)"
  ];

  const bars = [];
  LAYER_COLORS.forEach((color, idx) => {
    const bar = document.createElement("div");
    bar.className = `loader-layer-bar bar-${idx % 2 === 0 ? "left" : "right"}`;
    bar.style.backgroundColor = color;
    frame.appendChild(bar);
    bars.push(bar);
  });

  const logoWrap = document.createElement("div");
  logoWrap.className = "loader-logo-wrap";

  const logoImg = document.createElement("img");
  logoImg.src = "assets/logo.png";
  logoImg.alt = "Wrench Wise";
  logoImg.className = "loader-logo-img";

  const logoText = document.createElement("span");
  logoText.className = "loader-logo-text";
  logoText.textContent = "Explorer";

  logoWrap.appendChild(logoImg);
  logoWrap.appendChild(logoText);
  frame.appendChild(logoWrap);
  overlay.appendChild(frame);
  parent.appendChild(overlay);

  if (prefersReducedMotion()) {
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        if (typeof onComplete === "function") onComplete();
      }, 150);
    }, 150);
    return;
  }

  // Animation timeline (total < 1.2s per brief Section 6A)
  // 1. Bars slide in sequentially (0ms to 80ms)
  bars.forEach((bar, i) => {
    setTimeout(() => {
      bar.classList.add("slid-in");
    }, i * 20);
  });

  // 2. Logo fades in (120ms)
  setTimeout(() => {
    logoWrap.classList.add("visible");
  }, 120);

  // 3. Whole loader fades out (260ms)
  setTimeout(() => {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.remove();
      if (typeof onComplete === "function") onComplete();
    }, 90);
  }, 260);
}
