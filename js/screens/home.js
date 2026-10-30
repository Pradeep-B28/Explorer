// Home screen featuring hero with mini 3D stack art, 5-layer strip, and app picker.
// Uses content.js, copy.js, motion.js, router.js, and links.js.
// Used by main.js and router.js.

import { getLayers, getApps } from "../content.js";
import { t } from "../copy.js";
import { navigateTo } from "../router.js";
import { prefersReducedMotion, subscribe } from "../motion.js";

/**
 * Creates and mounts the Home screen into the container.
 * @param {HTMLElement} container
 * @returns {{ unmount: () => void }}
 */
export function mount(container) {
  const root = document.createElement("div");
  root.className = "home-screen";

  // Background glow elements
  const glow1 = document.createElement("div");
  glow1.className = "home-glow home-glow-1";
  glow1.setAttribute("aria-hidden", "true");

  const glow2 = document.createElement("div");
  glow2.className = "home-glow home-glow-2";
  glow2.setAttribute("aria-hidden", "true");

  root.appendChild(glow1);
  root.appendChild(glow2);

  // 1. HERO SECTION
  const heroSection = document.createElement("section");
  heroSection.className = "home-hero";

  // Hero Left
  const heroLeft = document.createElement("div");
  heroLeft.className = "home-hero-left";

  const eyebrow = document.createElement("span");
  eyebrow.className = "home-eyebrow";
  eyebrow.textContent = t("home.eyebrow");

  const title = document.createElement("h1");
  title.className = "home-title";
  title.textContent = t("home.title");

  const subtitle = document.createElement("p");
  subtitle.className = "home-subtitle";
  subtitle.textContent = t("home.subtitle");

  const ctaGroup = document.createElement("div");
  ctaGroup.className = "home-hero-ctas";

  const openBtn = document.createElement("a");
  openBtn.href = "#/app/foodzy";
  openBtn.className = "home-btn-primary";
  openBtn.textContent = t("home.open");

  const howBtn = document.createElement("button");
  howBtn.type = "button";
  howBtn.className = "home-btn-secondary";
  howBtn.textContent = t("home.how");
  howBtn.addEventListener("click", () => {
    const strip = document.getElementById("layers-strip");
    if (strip) {
      strip.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  });

  ctaGroup.appendChild(openBtn);
  ctaGroup.appendChild(howBtn);

  heroLeft.appendChild(eyebrow);
  heroLeft.appendChild(title);
  heroLeft.appendChild(subtitle);
  heroLeft.appendChild(ctaGroup);

  // Hero Right: Mini 5-Layer Stack Art
  const heroRight = document.createElement("div");
  heroRight.className = "home-hero-right";

  const stackViewport = document.createElement("div");
  stackViewport.className = "home-mini-viewport";
  stackViewport.setAttribute("aria-hidden", "true");

  const miniStack = document.createElement("div");
  miniStack.className = "home-mini-stack";

  // Central Beam
  const beam = document.createElement("div");
  beam.className = "home-mini-beam";
  miniStack.appendChild(beam);

  // 5 Mini Layer Cards
  const layers = getLayers();
  const miniLayers = [];
  layers.forEach((layer, i) => {
    const card = document.createElement("div");
    card.className = `home-mini-layer layer-${layer.id}`;
    card.style.setProperty("--layer-color", `var(--layer-${layer.id})`);

    const dot = document.createElement("span");
    dot.className = "home-mini-dot";
    dot.style.backgroundColor = `var(--layer-${layer.id})`;

    const name = document.createElement("span");
    name.className = "home-mini-layer-name";
    name.textContent = layer.name;

    const tech = document.createElement("span");
    tech.className = "home-mini-layer-tech";
    tech.textContent = layer.tech;

    card.appendChild(dot);
    card.appendChild(name);
    card.appendChild(tech);

    miniStack.appendChild(card);
    miniLayers.push({ el: card, index: i });
  });

  // Travelling Packet Dot
  const packetDot = document.createElement("div");
  packetDot.className = "home-mini-packet";
  miniStack.appendChild(packetDot);

  stackViewport.appendChild(miniStack);
  heroRight.appendChild(stackViewport);

  heroSection.appendChild(heroLeft);
  heroSection.appendChild(heroRight);
  root.appendChild(heroSection);

  // 2. LAYERS STRIP
  const layersStrip = document.createElement("section");
  layersStrip.id = "layers-strip";
  layersStrip.className = "home-layers-strip-section";

  const stripTitle = document.createElement("h2");
  stripTitle.className = "home-section-title";
  stripTitle.textContent = t("home.layersTitle");
  layersStrip.appendChild(stripTitle);

  const chipsGrid = document.createElement("div");
  chipsGrid.className = "home-layers-grid";

  layers.forEach((layer) => {
    const chip = document.createElement("div");
    chip.className = `home-layer-chip chip-${layer.id}`;

    const chipHeader = document.createElement("div");
    chipHeader.className = "home-chip-header";

    const dot = document.createElement("span");
    dot.className = "home-chip-dot";
    dot.style.backgroundColor = `var(--layer-${layer.id})`;

    const name = document.createElement("span");
    name.className = "home-chip-name";
    name.textContent = layer.name;

    const tech = document.createElement("span");
    tech.className = "home-chip-tech";
    tech.textContent = layer.tech;

    chipHeader.appendChild(dot);
    chipHeader.appendChild(name);
    chipHeader.appendChild(tech);

    const desc = document.createElement("p");
    desc.className = "home-chip-desc";
    desc.textContent = layer.oneLine;

    chip.appendChild(chipHeader);
    chip.appendChild(desc);
    chipsGrid.appendChild(chip);
  });

  layersStrip.appendChild(chipsGrid);
  root.appendChild(layersStrip);

  // 3. APP PICKER
  const appSection = document.createElement("section");
  appSection.className = "home-apps-section";

  const appTitle = document.createElement("h2");
  appTitle.className = "home-section-title";
  appTitle.textContent = t("home.pickTitle");

  const appSub = document.createElement("p");
  appSub.className = "home-section-sub";
  appSub.textContent = t("home.pickSub");

  appSection.appendChild(appTitle);
  appSection.appendChild(appSub);

  const appsGrid = document.createElement("div");
  appsGrid.className = "home-apps-grid";

  const apps = getApps();
  apps.forEach((app) => {
    const card = document.createElement("div");
    card.className = `home-app-card app-status-${app.status}`;

    const cardTop = document.createElement("div");
    cardTop.className = "home-app-card-top";

    const appName = document.createElement("h3");
    appName.className = "home-app-name";
    appName.textContent = app.name;

    const appKind = document.createElement("span");
    appKind.className = "home-app-kind";
    appKind.textContent = app.kind;

    cardTop.appendChild(appName);
    cardTop.appendChild(appKind);

    const teaser = document.createElement("p");
    teaser.className = "home-app-teaser";
    teaser.textContent = app.teaser;

    const cardBottom = document.createElement("div");
    cardBottom.className = "home-app-card-bottom";

    if (app.status === "live") {
      const openAppLink = document.createElement("a");
      openAppLink.href = `#/app/${app.id}`;
      openAppLink.className = "home-app-btn-open";
      openAppLink.textContent = t("app.open");
      cardBottom.appendChild(openAppLink);
    } else {
      card.setAttribute("aria-disabled", "true");
      const soonChip = document.createElement("span");
      soonChip.className = "home-app-soon-chip";
      soonChip.textContent = t("app.soon");
      cardBottom.appendChild(soonChip);
    }

    card.appendChild(cardTop);
    card.appendChild(teaser);
    card.appendChild(cardBottom);
    appsGrid.appendChild(card);
  });

  appSection.appendChild(appsGrid);
  root.appendChild(appSection);

  container.replaceChildren(root);

  // ANIMATION LOOP & INTERACTION FOR MINI 3D STACK ART
  // Pointer follow (up to 5deg tilt on laptop)
  let targetTiltX = 45;
  let targetTiltZ = -30;
  let currentTiltX = 45;
  let currentTiltZ = -30;

  function handleMouseMove(e) {
    if (window.innerWidth < 900 || prefersReducedMotion()) return;
    const rect = stackViewport.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    targetTiltX = 45 - dy * 5;
    targetTiltZ = -30 + dx * 5;
  }

  function handleMouseLeave() {
    targetTiltX = 45;
    targetTiltZ = -30;
  }

  window.addEventListener("mousemove", handleMouseMove);
  stackViewport.addEventListener("mouseleave", handleMouseLeave);

  // 6-Second Animation Loop for Mini Stack Art
  // Phase 1 (0-1.5s): Layers separate along Z
  // Phase 2 (1.5-3.5s): Packet travels down beam (Screen to DB)
  // Phase 3 (3.5-5.0s): Packet travels back up beam (DB to Screen)
  // Phase 4 (5.0-6.0s): Layers close together
  let animTime = 0;
  const loopStop = subscribe((dt) => {
    animTime = (animTime + dt) % 6.0;

    const isReduced = prefersReducedMotion() || window.innerWidth < 900;

    if (!isReduced) {
      // Smooth tilt follow
      currentTiltX += (targetTiltX - currentTiltX) * 0.1;
      currentTiltZ += (targetTiltZ - currentTiltZ) * 0.1;
      miniStack.style.transform = `rotateX(${currentTiltX.toFixed(2)}deg) rotateZ(${currentTiltZ.toFixed(2)}deg)`;
    } else {
      miniStack.style.transform = "none";
    }

    // Calculate separation factor (0 = collapsed, 1 = exploded)
    let separation = 0;
    if (animTime < 1.5) {
      separation = Math.min(1, animTime / 1.2);
    } else if (animTime < 5.0) {
      separation = 1;
    } else {
      separation = Math.max(0, 1 - (animTime - 5.0) / 0.8);
    }

    // Apply Z translation to mini layers (gap = 36px when separated)
    const maxGap = 36;
    miniLayers.forEach(({ el, index }) => {
      const zOffset = (2 - index) * maxGap * separation;
      if (!isReduced) {
        el.style.transform = `translateZ(${zOffset.toFixed(1)}px)`;
        el.style.opacity = "1";
      } else {
        el.style.transform = "none";
        el.style.opacity = separation > 0 ? "1" : index === 0 ? "1" : "0.7";
      }
    });

    // Beam visibility & height
    if (!isReduced) {
      beam.style.height = `${(maxGap * 4 * separation).toFixed(0)}px`;
      beam.style.opacity = (separation * 0.8).toFixed(2);
    } else {
      beam.style.opacity = "0";
    }

    // Packet motion
    // Screen is top (z = +72), DB is bottom (z = -72)
    if (!isReduced) {
      let packetZ = 2 * maxGap * separation; // Start at Screen
      let packetOpacity = 0;

      if (animTime >= 1.5 && animTime < 3.5) {
        // Travel down
        const progress = (animTime - 1.5) / 2.0;
        packetZ = (2 - 4 * progress) * maxGap * separation;
        packetOpacity = 1;
      } else if (animTime >= 3.5 && animTime < 5.0) {
        // Travel up
        const progress = (animTime - 3.5) / 1.5;
        packetZ = (-2 + 4 * progress) * maxGap * separation;
        packetOpacity = 1;
      }

      packetDot.style.transform = `translate(-50%, -50%) translateZ(${packetZ.toFixed(1)}px)`;
      packetDot.style.opacity = packetOpacity.toString();
    } else {
      // Reduced motion: fade packet
      let packetOpacity = (animTime >= 1.5 && animTime < 5.0) ? "0.8" : "0";
      packetDot.style.opacity = packetOpacity;
      packetDot.style.transform = "translate(-50%, -50%)";
    }
  });

  return {
    unmount() {
      loopStop();
      window.removeEventListener("mousemove", handleMouseMove);
      stackViewport.removeEventListener("mouseleave", handleMouseLeave);
      root.remove();
    }
  };
}
