// Home screen featuring hero with 8s looping split preview, facts strip,
// how it works cards, frontend/backend layer row, app picker, and program band.
// UPGRADE_BRIEF.md Section 11.
// Uses content.js, copy.js, motion.js, router.js, links.js, and icons.js.
// Used by main.js and router.js.

import { getLayers, getApps, CONFIG } from "../content.js";
import { t } from "../copy.js";
import { prefersReducedMotion, subscribe } from "../motion.js";
import { ICONS, getIconSvg } from "../ui/icons.js";
import { getProgramLink, getWhatsAppLink } from "../links.js";

/**
 * Creates and mounts the Home screen into the container.
 * @param {HTMLElement} container
 * @returns {{ unmount: () => void }}
 */
export function mount(container) {
  const root = document.createElement("div");
  root.className = "home-page";

  const layers = getLayers();
  const apps = getApps();

  // 1. HERO SECTION
  const heroSection = document.createElement("section");
  heroSection.className = "home-hero-section home-fade-up";

  const heroInner = document.createElement("div");
  heroInner.className = "home-hero-inner";

  // Hero Left
  const heroLeft = document.createElement("div");
  heroLeft.className = "home-hero-left";

  const eyebrow = document.createElement("div");
  eyebrow.className = "home-eyebrow-chip";
  eyebrow.textContent = t("home.eyebrow");

  const title = document.createElement("h1");
  title.className = "home-hero-title";
  title.textContent = t("home.title");

  const subtitle = document.createElement("p");
  subtitle.className = "home-hero-subtitle";
  subtitle.textContent = t("home.subtitle");

  const ctaGroup = document.createElement("div");
  ctaGroup.className = "home-hero-actions";

  const openBtn = document.createElement("a");
  openBtn.href = "#/app/foodzy";
  openBtn.className = "btn-primary home-btn-open";
  openBtn.textContent = t("home.open");

  const howBtn = document.createElement("button");
  howBtn.type = "button";
  howBtn.className = "btn-secondary home-btn-how";
  howBtn.textContent = t("home.stepsTitle");
  howBtn.addEventListener("click", () => {
    const target = document.getElementById("home-how-section");
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  });

  ctaGroup.appendChild(openBtn);
  ctaGroup.appendChild(howBtn);

  heroLeft.appendChild(eyebrow);
  heroLeft.appendChild(title);
  heroLeft.appendChild(subtitle);
  heroLeft.appendChild(ctaGroup);

  // Hero Right: 8-second Looping Split Preview
  const heroRight = document.createElement("div");
  heroRight.className = "home-hero-right";

  const loopViewport = document.createElement("div");
  loopViewport.className = "home-loop-viewport";
  loopViewport.setAttribute("aria-hidden", "true");

  const loopStage = document.createElement("div");
  loopStage.className = "home-loop-stage";

  // Header brackets inside loop
  const loopBrackets = document.createElement("div");
  loopBrackets.className = "home-loop-brackets";
  loopBrackets.innerHTML = `
    <span class="loop-bracket frontend">${t("stage.frontend")}</span>
    <span class="loop-bracket-gap">${ICONS.cloud}</span>
    <span class="loop-bracket backend">${t("stage.backend")}</span>
  `;
  loopStage.appendChild(loopBrackets);

  // 5 Mini Cards Row
  const cardsRow = document.createElement("div");
  cardsRow.className = "home-loop-cards-row";

  const miniCardEls = [];
  layers.forEach((layer, idx) => {
    const miniCard = document.createElement("div");
    miniCard.className = `home-loop-mini-card layer-${layer.id}`;
    miniCard.dataset.layer = layer.id;
    miniCard.style.setProperty("--mini-color", `var(--layer-${layer.id})`);

    const cardHeader = document.createElement("div");
    cardHeader.className = "home-loop-card-header";
    cardHeader.innerHTML = `
      <span class="mini-card-dot" style="background: var(--layer-${layer.id})"></span>
      <span class="mini-card-name">${layer.name}</span>
    `;

    const cardBody = document.createElement("div");
    cardBody.className = "home-loop-card-body";

    if (layer.id === "screen") {
      cardBody.innerHTML = `
        <div class="mini-phone-screen">
          <div class="mini-phone-bar"></div>
          <div class="mini-phone-hero"></div>
          <div class="mini-phone-item"></div>
        </div>
      `;
    } else if (layer.id === "styling") {
      cardBody.innerHTML = `
        <div class="mini-style-swatches">
          <span style="background: #C2410C"></span>
          <span style="background: #059669"></span>
          <span style="background: #7C3AED"></span>
        </div>
        <div class="mini-style-lines">
          <div></div><div></div><div></div>
        </div>
      `;
    } else if (layer.id === "logic") {
      cardBody.innerHTML = `
        <div class="mini-logic-nodes">
          <span class="mini-node">Evt</span>
          <span class="mini-arrow">&rarr;</span>
          <span class="mini-node">St</span>
        </div>
        <div class="mini-logic-json">{ cart: 1 }</div>
      `;
    } else if (layer.id === "server") {
      cardBody.innerHTML = `
        <div class="mini-server-box">
          <div class="mini-server-led"></div>
          <span class="mini-server-route">POST /orders</span>
        </div>
        <div class="mini-server-log">200 OK</div>
      `;
    } else if (layer.id === "database") {
      cardBody.innerHTML = `
        <div class="mini-db-cylinder">
          <div class="mini-db-top"></div>
        </div>
        <div class="mini-db-rows">
          <div>FZ-52001</div>
          <div>388 PLACED</div>
        </div>
      `;
    }

    const cardPort = document.createElement("div");
    cardPort.className = "home-loop-card-port";
    cardPort.innerHTML = `<span class="mini-port-dot"></span>`;

    miniCard.appendChild(cardHeader);
    miniCard.appendChild(cardBody);
    miniCard.appendChild(cardPort);
    cardsRow.appendChild(miniCard);

    miniCardEls.push(miniCard);
  });

  loopStage.appendChild(cardsRow);

  // Bus & Packet Wire
  const busWrap = document.createElement("div");
  busWrap.className = "home-loop-bus-wrap";
  busWrap.innerHTML = `
    <div class="home-loop-bus-line"></div>
    <div class="home-loop-packet-pill">
      <span class="packet-dot"></span>
      <span class="packet-label">POST /orders</span>
    </div>
  `;
  loopStage.appendChild(busWrap);

  const packetPill = busWrap.querySelector(".home-loop-packet-pill");
  const busLine = busWrap.querySelector(".home-loop-bus-line");

  loopViewport.appendChild(loopStage);
  heroRight.appendChild(loopViewport);

  heroInner.appendChild(heroLeft);
  heroInner.appendChild(heroRight);
  heroSection.appendChild(heroInner);
  root.appendChild(heroSection);

  // 2. FACTS STRIP
  const factsSection = document.createElement("section");
  factsSection.className = "home-facts-strip home-fade-up";

  const factsInner = document.createElement("div");
  factsInner.className = "home-facts-inner";

  const facts = [
    { icon: ICONS.splitLayers, text: t("home.fact1") },
    { icon: ICONS.logic, text: t("home.fact2") },
    { icon: ICONS.check, text: t("home.fact3") }
  ];

  facts.forEach((fact) => {
    const item = document.createElement("div");
    item.className = "home-fact-item";
    item.innerHTML = `
      <span class="home-fact-icon">${fact.icon}</span>
      <span class="home-fact-text">${fact.text}</span>
    `;
    factsInner.appendChild(item);
  });

  factsSection.appendChild(factsInner);
  root.appendChild(factsSection);

  // 3. HOW IT WORKS
  const howSection = document.createElement("section");
  howSection.id = "home-how-section";
  howSection.className = "home-section home-how-section home-fade-up";

  const howTitle = document.createElement("h2");
  howTitle.className = "home-section-title";
  howTitle.textContent = t("home.stepsTitle");
  howSection.appendChild(howTitle);

  const stepsGrid = document.createElement("div");
  stepsGrid.className = "home-steps-grid";

  const stepsData = [
    {
      num: 1,
      icon: ICONS.screen,
      title: t("home.step1.title"),
      body: t("home.step1.body")
    },
    {
      num: 2,
      icon: ICONS.splitLayers,
      title: t("home.step2.title"),
      body: t("home.step2.body")
    },
    {
      num: 3,
      icon: ICONS.server,
      title: t("home.step3.title"),
      body: t("home.step3.body")
    }
  ];

  stepsData.forEach((st) => {
    const card = document.createElement("div");
    card.className = "home-step-card";
    card.innerHTML = `
      <div class="home-step-card-top">
        <span class="home-step-number">${st.num}</span>
        <span class="home-step-icon">${st.icon}</span>
      </div>
      <h3 class="home-step-title">${st.title}</h3>
      <p class="home-step-body">${st.body}</p>
    `;
    stepsGrid.appendChild(card);
  });

  howSection.appendChild(stepsGrid);
  root.appendChild(howSection);

  // 4. FRONTEND PLUS BACKEND
  const stackSection = document.createElement("section");
  stackSection.className = "home-section home-stack-section home-fade-up";

  const stackTitle = document.createElement("h2");
  stackTitle.className = "home-section-title";
  stackTitle.textContent = t("home.stackTitle");
  stackSection.appendChild(stackTitle);

  // Brackets above layers row
  const stackBracketsRow = document.createElement("div");
  stackBracketsRow.className = "home-stack-brackets-row";
  stackBracketsRow.innerHTML = `
    <div class="stack-bracket-group frontend-group">
      <span class="stack-bracket-line"></span>
      <span class="stack-bracket-label">${t("stage.frontend")}</span>
    </div>
    <div class="stack-bracket-mid">
      <span class="stack-fullstack-pill">${t("stage.fullstack")}</span>
    </div>
    <div class="stack-bracket-group backend-group">
      <span class="stack-bracket-line"></span>
      <span class="stack-bracket-label">${t("stage.backend")}</span>
    </div>
  `;
  stackSection.appendChild(stackBracketsRow);

  // 5 Layers Grid
  const layersGrid = document.createElement("div");
  layersGrid.className = "home-layers-grid";

  layers.forEach((layer) => {
    const lCard = document.createElement("div");
    lCard.className = `home-layer-box layer-${layer.id}`;
    lCard.style.setProperty("--layer-theme", `var(--layer-${layer.id})`);

    const iconHtml = ICONS[layer.id] || "";

    lCard.innerHTML = `
      <div class="home-layer-box-top">
        <span class="home-layer-box-icon" style="color: var(--layer-${layer.id})">${iconHtml}</span>
        <span class="home-layer-box-name">${layer.name}</span>
      </div>
      <div class="home-layer-box-tech">${layer.tech}</div>
      <p class="home-layer-box-desc">${layer.oneLine}</p>
    `;
    layersGrid.appendChild(lCard);
  });

  stackSection.appendChild(layersGrid);

  const stackBody = document.createElement("p");
  stackBody.className = "home-stack-body-text";
  stackBody.textContent = t("home.stackBody");
  stackSection.appendChild(stackBody);

  root.appendChild(stackSection);

  // 5. PICK AN APP
  const appsSection = document.createElement("section");
  appsSection.className = "home-section home-apps-section home-fade-up";

  const appsTitle = document.createElement("h2");
  appsTitle.className = "home-section-title";
  appsTitle.textContent = t("home.pickTitle");

  const appsSub = document.createElement("p");
  appsSub.className = "home-section-sub";
  appsSub.textContent = t("home.pickSub");

  appsSection.appendChild(appsTitle);
  appsSection.appendChild(appsSub);

  const appsGrid = document.createElement("div");
  appsGrid.className = "home-apps-cards-grid";

  apps.forEach((app) => {
    const appCard = document.createElement("div");
    appCard.className = `home-app-card app-status-${app.status}`;
    appCard.style.setProperty("--app-tint", `var(--app-${app.id})`);

    const iconSvg = ICONS[app.id] || "";

    const cardTop = document.createElement("div");
    cardTop.className = "home-app-card-header";
    cardTop.innerHTML = `
      <div class="home-app-icon-tile" style="background: var(--app-${app.id})">
        ${iconSvg}
      </div>
      <div class="home-app-meta">
        <h3 class="home-app-name">${app.name}</h3>
        <span class="home-app-kind">${app.kind}</span>
      </div>
    `;

    const teaser = document.createElement("p");
    teaser.className = "home-app-teaser";
    teaser.textContent = app.teaser;

    const cardBottom = document.createElement("div");
    cardBottom.className = "home-app-card-footer";

    if (app.status === "live") {
      const openLink = document.createElement("a");
      openLink.href = `#/app/${app.id}`;
      openLink.className = "btn-primary home-app-open-btn";
      openLink.textContent = t("app.open");
      cardBottom.appendChild(openLink);
    } else {
      appCard.setAttribute("aria-disabled", "true");
      const soonChip = document.createElement("span");
      soonChip.className = "home-app-soon-chip";
      soonChip.textContent = t("app.soon");
      cardBottom.appendChild(soonChip);
    }

    appCard.appendChild(cardTop);
    appCard.appendChild(teaser);
    appCard.appendChild(cardBottom);
    appsGrid.appendChild(appCard);
  });

  appsSection.appendChild(appsGrid);
  root.appendChild(appsSection);

  // 6. PROGRAM BAND
  const bandSection = document.createElement("section");
  bandSection.className = "home-program-band home-fade-up";

  const bandInner = document.createElement("div");
  bandInner.className = "home-band-inner";

  const bandTitle = document.createElement("h2");
  bandTitle.className = "home-band-title";
  bandTitle.textContent = t("home.bandTitle");

  const bandBody = document.createElement("p");
  bandBody.className = "home-band-body";
  bandBody.textContent = t("home.bandBody", { program: CONFIG.program.name });

  const bandActions = document.createElement("div");
  bandActions.className = "home-band-actions";

  const waLink = getWhatsAppLink(["order"]);
  if (waLink) {
    const waBtn = document.createElement("a");
    waBtn.href = waLink;
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.className = "btn-primary home-band-btn-wa";
    waBtn.textContent = t("cta.whatsapp");
    bandActions.appendChild(waBtn);
  }

  const progLink = document.createElement("a");
  progLink.href = getProgramLink("home");
  progLink.target = "_blank";
  progLink.rel = "noopener noreferrer";
  progLink.className = "btn-secondary home-band-btn-prog";
  progLink.textContent = t("cta.program");
  bandActions.appendChild(progLink);

  bandInner.appendChild(bandTitle);
  bandInner.appendChild(bandBody);
  bandInner.appendChild(bandActions);
  bandSection.appendChild(bandInner);
  root.appendChild(bandSection);

  // 7. FOOTER
  const footerSection = document.createElement("footer");
  footerSection.className = "home-footer home-fade-up";
  footerSection.innerHTML = `
    <div class="home-footer-inner">
      <p class="home-footer-line">${t("footer.line")}</p>
      <p class="home-footer-disclaimer">${t("footer.disclaimer")}</p>
      <p class="home-footer-legal">${t("footer.legal")}</p>
    </div>
  `;
  root.appendChild(footerSection);

  container.replaceChildren(root);

  // SCROLL-TRIGGERED FADE UP (300 ms, 12px, once; reduced motion: no movement)
  const isReduced = prefersReducedMotion();
  const fadeElements = root.querySelectorAll(".home-fade-up");

  if (!isReduced && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeElements.forEach((el) => observer.observe(el));
  } else {
    fadeElements.forEach((el) => el.classList.add("is-visible"));
  }

  // 8-SECOND LOOPING SPLIT PREVIEW ANIMATION & LAPTOP TILT
  // Uses CSS keyframes for 0ms CPU blocking time / 60fps GPU compositor.
  // Laptop tilts up to 4 degrees with pointer movement.
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let tiltRaf = null;

  function handleMouseMove(e) {
    if (window.innerWidth < 900 || prefersReducedMotion()) return;
    const rect = loopViewport.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    // Laptop tilts up to 4 degrees with pointer
    targetTiltX = -dy * 4;
    targetTiltY = dx * 4;

    if (!tiltRaf) {
      tiltRaf = requestAnimationFrame(updateTilt);
    }
  }

  function updateTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.15;
    currentTiltY += (targetTiltY - currentTiltY) * 0.15;
    loopStage.style.transform = `perspective(900px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;

    const diff = Math.abs(targetTiltX - currentTiltX) + Math.abs(targetTiltY - currentTiltY);
    if (diff > 0.05) {
      tiltRaf = requestAnimationFrame(updateTilt);
    } else {
      tiltRaf = null;
    }
  }

  function handleMouseLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
    if (!tiltRaf) {
      tiltRaf = requestAnimationFrame(updateTilt);
    }
  }

  window.addEventListener("mousemove", handleMouseMove);
  loopViewport.addEventListener("mouseleave", handleMouseLeave);

  return {
    unmount() {
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      window.removeEventListener("mousemove", handleMouseMove);
      loopViewport.removeEventListener("mouseleave", handleMouseLeave);
      root.remove();
    }
  };
}
