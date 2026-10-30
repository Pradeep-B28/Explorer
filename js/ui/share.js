// Handles site sharing via Web Share API or clipboard copy fallback.
// Uses links.js, copy.js, events.js, and toast.js.
// Used by stage.js, cta.js, and main.js.

import { getShareLink } from "../links.js";
import { t } from "../copy.js";
import { emit } from "../events.js";
import { showToast } from "./toast.js";

const SHARE_ICON_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
`;

/**
 * Triggers site sharing via Web Share API or clipboard copy fallback.
 * @returns {Promise<void>}
 */
export async function shareSite() {
  const url = getShareLink();
  const text = t("share.text");

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: t("site.title"),
        text: `${text} ${url}`,
        url
      });
      emit("share", { method: "native" });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") {
        return; // User dismissed native share sheet
      }
    }
  }

  // Fallback: Copy to clipboard
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    showToast(t("share.copied"));
    emit("share", { method: "copy" });
  } catch (err) {
    showToast(t("share.copied"));
  }
}

/**
 * Creates a reusable share button element.
 * @param {object} [options]
 * @param {string} [options.className=""]
 * @param {boolean} [options.showIcon=true]
 * @param {string} [options.text]
 * @returns {HTMLButtonElement}
 */
export function createShareButton(options = {}) {
  const { className = "", showIcon = true, text = t("share.button") } = options;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `btn-share ${className}`.trim();
  btn.setAttribute("aria-label", text);
  btn.setAttribute("title", text);

  if (showIcon) {
    btn.innerHTML = `${SHARE_ICON_SVG} <span>${text}</span>`;
  } else {
    btn.textContent = text;
  }

  btn.addEventListener("click", () => {
    shareSite();
  });

  return btn;
}
