// Renders the lesson summary and full-stack course CTA card after flow completion.
// Uses config.js, copy.js, links.js, progress.js, events.js, and share.js.
// Used by ui/panel.js.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getWhatsAppLink, getProgramLink } from "../links.js";
import { getWatchedFlows } from "../progress.js";
import { emit } from "../events.js";
import { createShareButton } from "./share.js";

/**
 * Renders the flow end lesson and CTA card into container.
 * @param {HTMLElement} container
 * @param {object} options
 * @param {object} options.journey Completed journey object
 * @param {Array} options.journeys All journeys list
 * @param {() => void} options.onTryAnother Callback to try another flow
 */
export function renderCtaCard(container, options) {
  const { journey, journeys, onTryAnother } = options;
  container.replaceChildren();

  const wrap = document.createElement("div");
  wrap.className = "panel-flow-end";

  // Lesson Card
  const lessonCard = document.createElement("div");
  lessonCard.className = "panel-lesson-card";

  const lessonTitle = document.createElement("h4");
  lessonTitle.className = "panel-lesson-title";
  lessonTitle.textContent = t("flow.end.title");

  const lessonBody = document.createElement("p");
  lessonBody.className = "panel-lesson-body";
  lessonBody.textContent = journey.lesson;

  lessonCard.appendChild(lessonTitle);
  lessonCard.appendChild(lessonBody);
  wrap.appendChild(lessonCard);

  // CTA Card
  const ctaCard = document.createElement("div");
  ctaCard.className = "panel-cta-card";

  const ctaTitle = document.createElement("h3");
  ctaTitle.className = "panel-cta-title";
  ctaTitle.textContent = t("cta.title");

  const ctaBody = document.createElement("p");
  ctaBody.className = "panel-cta-body";
  ctaBody.textContent = t("cta.body", { program: CONFIG.program.name });

  ctaCard.appendChild(ctaTitle);
  ctaCard.appendChild(ctaBody);

  const buttons = document.createElement("div");
  buttons.className = "panel-cta-buttons";

  const watched = getWatchedFlows();
  const waLink = getWhatsAppLink(watched);

  if (waLink) {
    const waBtn = document.createElement("a");
    waBtn.href = waLink;
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.className = "panel-whatsapp-btn";
    waBtn.textContent = t("cta.whatsapp");
    waBtn.addEventListener("click", () => {
      emit("cta_whatsapp", { flow: journey.id });
    });
    buttons.appendChild(waBtn);
  }

  const progLink = document.createElement("a");
  progLink.href = getProgramLink("cta");
  progLink.target = "_blank";
  progLink.rel = "noopener noreferrer";
  progLink.className = waLink ? "panel-program-link" : "panel-whatsapp-btn";
  progLink.textContent = t("cta.program");
  progLink.addEventListener("click", () => {
    emit("cta_program", { flow: journey.id });
  });
  buttons.appendChild(progLink);

  const tryAnotherBtn = document.createElement("button");
  tryAnotherBtn.type = "button";
  tryAnotherBtn.className = "panel-try-another-btn";
  tryAnotherBtn.textContent = t("cta.another");
  tryAnotherBtn.addEventListener("click", () => {
    if (typeof onTryAnother === "function") onTryAnother();
  });
  buttons.appendChild(tryAnotherBtn);

  ctaCard.appendChild(buttons);

  // Progress counter
  const progText = document.createElement("div");
  progText.className = "panel-cta-progress";
  progText.textContent = t("cta.progress", { n: watched.length, total: journeys.length });
  ctaCard.appendChild(progText);

  const isAllWatched = watched.length >= journeys.length;
  if (isAllWatched) {
    const allDone = document.createElement("div");
    allDone.className = "panel-cta-all";
    allDone.textContent = t("cta.all");
    ctaCard.appendChild(allDone);
  }

  // Share button (made bigger when all flows are watched)
  const shareBtn = createShareButton({
    className: isAllWatched ? "panel-share-btn panel-share-btn-large" : "panel-share-btn"
  });
  ctaCard.appendChild(shareBtn);

  wrap.appendChild(ctaCard);
  container.appendChild(wrap);
}
