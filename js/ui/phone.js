// Renders the realistic phone frame, drawn status bar, and handles transform scaling.
// Uses config.js and plain DOM APIs.
// Used by screens/stage.js.

import { CONFIG } from "../../config.js";

const PHONE_WIDTH = CONFIG.phone.width || 360;
const PHONE_HEIGHT = CONFIG.phone.height || 760;

/**
 * Creates the phone frame element hierarchy.
 * @returns {{ element: HTMLElement, screenElement: HTMLElement, updateScale: (availW: number, availH: number) => number }}
 */
export function createPhoneFrame() {
  const wrapper = document.createElement("div");
  wrapper.className = "phone-scale-wrapper";

  const frame = document.createElement("div");
  frame.className = "phone-frame";

  // Island / speaker pill at top center
  const island = document.createElement("div");
  island.className = "phone-dynamic-island";
  frame.appendChild(island);

  // Status bar
  const statusBar = document.createElement("div");
  statusBar.className = "phone-status-bar";

  const timeEl = document.createElement("span");
  timeEl.className = "phone-status-time";
  timeEl.textContent = "10:42";

  const iconsEl = document.createElement("div");
  iconsEl.className = "phone-status-icons";

  // Signal icon (inline SVG)
  iconsEl.innerHTML = `
    <svg class="phone-icon-signal" width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
      <rect x="1" y="9" width="2.5" height="3" rx="0.5"/>
      <rect x="5" y="6" width="2.5" height="6" rx="0.5"/>
      <rect x="9" y="3" width="2.5" height="9" rx="0.5"/>
      <rect x="13" y="0" width="2.5" height="12" rx="0.5"/>
    </svg>
    <svg class="phone-icon-battery" width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke-width="1"/>
      <rect x="2.5" y="2.5" width="12" height="6" rx="1" fill="currentColor"/>
      <path d="M20 3.5V7.5" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;

  statusBar.appendChild(timeEl);
  statusBar.appendChild(iconsEl);
  frame.appendChild(statusBar);

  // The 360x760 screen container where app screens mount
  const screen = document.createElement("div");
  screen.className = "phone-screen";
  screen.id = "phone-screen";
  screen.style.width = `${PHONE_WIDTH}px`;
  screen.style.height = `${PHONE_HEIGHT}px`;

  frame.appendChild(screen);
  wrapper.appendChild(frame);

  function updateScale(availableWidth, availableHeight) {
    const padX = 24;
    const padY = 24;
    const scaleX = (availableWidth - padX) / (PHONE_WIDTH + 24);
    const scaleY = (availableHeight - padY) / (PHONE_HEIGHT + 24);
    const scale = Math.min(Math.max(scaleX, 0.4), Math.max(scaleY, 0.4), 1);

    frame.style.transform = `scale(${scale})`;
    wrapper.style.width = `${Math.round((PHONE_WIDTH + 24) * scale)}px`;
    wrapper.style.height = `${Math.round((PHONE_HEIGHT + 24) * scale)}px`;
    return scale;
  }

  function setScale(scale) {
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = "top center";
    wrapper.style.width = `${Math.round(PHONE_WIDTH * scale)}px`;
    wrapper.style.height = `${Math.round(PHONE_HEIGHT * scale)}px`;
    return scale;
  }

  return {
    element: wrapper,
    frameElement: frame,
    screenElement: screen,
    updateScale,
    setScale
  };
}
