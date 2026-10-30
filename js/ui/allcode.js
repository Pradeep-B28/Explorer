// Modal sheet showing all steps of a flow grouped by layer in stack order.
// UPGRADE_BRIEF.md Section 8D: The full stack code sheet (features.allCode).
// Uses plain DOM APIs and copy.js.

import { LAYERS } from "../content.js";
import { t } from "../copy.js";
import { getIconSvg } from "./icons.js";
import { tokenizeLine } from "./codeview.js";

/**
 * Opens the full stack code sheet modal.
 * @param {object} options
 * @param {object} options.journey The current journey
 * @param {Array} options.steps Prepared steps of the current journey
 * @param {() => void} [options.onClose] Callback when closed
 * @returns {{ close: () => void }}
 */
export function openAllCodeSheet(options) {
  const { journey, steps = [], onClose } = options;

  // Scrim Overlay
  const scrim = document.createElement("div");
  scrim.className = "allcode-scrim";

  // Modal Sheet
  const modal = document.createElement("div");
  modal.className = "allcode-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", t("panel.allCodeTitle"));

  // Header
  const header = document.createElement("header");
  header.className = "allcode-header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "allcode-title-group";

  const title = document.createElement("h2");
  title.className = "allcode-title";
  title.textContent = t("panel.allCodeTitle");

  const subtitle = document.createElement("span");
  subtitle.className = "allcode-subtitle";
  subtitle.textContent = journey ? `${journey.title} (${steps.length} steps)` : "";

  titleGroup.appendChild(title);
  titleGroup.appendChild(subtitle);
  header.appendChild(titleGroup);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "allcode-close-btn";
  closeBtn.setAttribute("aria-label", t("panel.close") || "Close");
  closeBtn.innerHTML = getIconSvg("close", 20);
  closeBtn.addEventListener("click", () => close());
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // Body: steps grouped by layer in stack order (Screen, Styling, Logic, Server, Database)
  const body = document.createElement("div");
  body.className = "allcode-body";

  LAYERS.forEach((layer) => {
    const layerSteps = steps.filter((s) => s.layer === layer.id);
    if (!layerSteps.length) return;

    const layerGroup = document.createElement("section");
    layerGroup.className = `allcode-layer-group layer-group-${layer.id}`;

    // Layer group header
    const layerHead = document.createElement("div");
    layerHead.className = "allcode-layer-head";

    const layerIcon = document.createElement("span");
    layerIcon.className = "allcode-layer-icon";
    layerIcon.innerHTML = getIconSvg(layer.id, 20);

    const layerName = document.createElement("h3");
    layerName.className = "allcode-layer-name";
    layerName.textContent = layer.name;

    const layerTech = document.createElement("span");
    layerTech.className = "allcode-layer-tech";
    layerTech.textContent = layer.tech;

    layerHead.appendChild(layerIcon);
    layerHead.appendChild(layerName);
    layerHead.appendChild(layerTech);
    layerGroup.appendChild(layerHead);

    // Each step on that layer
    layerSteps.forEach((s) => {
      const block = document.createElement("article");
      block.className = "allcode-block";

      const blockHead = document.createElement("div");
      blockHead.className = "allcode-block-head";

      const leftInfo = document.createElement("div");
      leftInfo.className = "allcode-block-info";

      const fileChip = document.createElement("span");
      fileChip.className = "allcode-file-chip";
      fileChip.textContent = s.code?.file || "file";

      const stepTitle = document.createElement("strong");
      stepTitle.className = "allcode-step-title";
      stepTitle.textContent = s.title;

      leftInfo.appendChild(fileChip);
      leftInfo.appendChild(stepTitle);
      blockHead.appendChild(leftInfo);

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "allcode-copy-btn";
      copyBtn.innerHTML = `${getIconSvg("copy", 16)} <span>${t("panel.copy")}</span>`;
      copyBtn.addEventListener("click", () => {
        const fullText = (s.code?.lines || []).join("\n");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fullText).catch(() => {});
        }
        copyBtn.querySelector("span").textContent = t("panel.copied");
        setTimeout(() => {
          copyBtn.querySelector("span").textContent = t("panel.copy");
        }, 1500);
      });
      blockHead.appendChild(copyBtn);
      block.appendChild(blockHead);

      // Code with line numbers
      const pre = document.createElement("pre");
      pre.className = "allcode-pre";

      const lines = s.code?.lines || [];
      const lang = s.code?.lang || "text";

      lines.forEach((lineText, lineIdx) => {
        const lineEl = document.createElement("div");
        lineEl.className = "allcode-line";

        const lineNum = document.createElement("span");
        lineNum.className = "allcode-line-num";
        lineNum.textContent = String(lineIdx + 1);
        lineEl.appendChild(lineNum);

        const lineCode = document.createElement("span");
        lineCode.className = "allcode-line-code";

        const tokens = tokenizeLine(lineText, lang);
        tokens.forEach((tok) => {
          const span = document.createElement("span");
          if (tok.type !== "plain") {
            span.className = `tok-${tok.type}`;
          }
          span.textContent = tok.text;
          lineCode.appendChild(span);
        });
        lineEl.appendChild(lineCode);
        pre.appendChild(lineEl);
      });

      block.appendChild(pre);
      layerGroup.appendChild(block);
    });

    body.appendChild(layerGroup);
  });

  modal.appendChild(body);
  scrim.appendChild(modal);
  document.body.appendChild(scrim);

  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    window.removeEventListener("keydown", handleKeyDown);
    scrim.classList.add("closing");
    setTimeout(() => {
      scrim.remove();
      if (typeof onClose === "function") onClose();
    }, 200);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  scrim.addEventListener("click", (e) => {
    if (e.target === scrim) {
      close();
    }
  });

  window.addEventListener("keydown", handleKeyDown);

  return { close };
}
