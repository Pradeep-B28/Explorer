// Foodzy tracking screen with live SVG route map, rider card, and status progression.
// Uses map.js, toast.js, copy.js, trackingEta from js/engine/Foodzy/orders.js.
// Used by Foodzy app index.js.

import { getAppContent } from "../../../content.js";
import { t } from "../../../copy.js";
import { trackingEta } from "../../../engine/Foodzy/orders.js";
import { showToast } from "../../../ui/toast.js";
import { createTrackingMap } from "../ui/map.js";
import { navigate, getLastOrder } from "../state.js";

const { app } = getAppContent("Foodzy");

const BACK_ARROW_SVG = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
`;

const CALL_ICON_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
`;

export function mount(container, params = {}) {
  const root = document.createElement("div");
  root.className = "foodzy-screen foodzy-track-screen";

  const lastOrder = getLastOrder();
  const shopName = params.shopName || (lastOrder ? lastOrder.shopName : "Marina Biryani Co.");
  const initialEta = params.eta || (lastOrder ? lastOrder.eta : 32);
  const remainingMinutes = trackingEta(initialEta);

  // Top Nav
  const nav = document.createElement("nav");
  nav.className = "foodzy-sub-nav";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "foodzy-back-btn";
  backBtn.setAttribute("aria-label", "Back to home");
  backBtn.innerHTML = BACK_ARROW_SVG;
  backBtn.addEventListener("click", () => navigate("home"));

  const navTitle = document.createElement("h2");
  navTitle.className = "foodzy-sub-nav-title";
  navTitle.textContent = "Track order";

  nav.appendChild(backBtn);
  nav.appendChild(navTitle);
  root.appendChild(nav);

  // Map
  const mapObj = createTrackingMap({ shopName, progress: 0.65 });
  root.appendChild(mapObj.element);

  // Status Card below map
  const statusCard = document.createElement("div");
  statusCard.className = "track-status-card";

  // ETA Banner
  const etaRow = document.createElement("div");
  etaRow.className = "track-eta-row";

  const etaBadge = document.createElement("span");
  etaBadge.className = "track-eta-badge";
  etaBadge.textContent = t("Foodzy.status.onTheWay");

  const etaTime = document.createElement("span");
  etaTime.className = "track-eta-time";
  etaTime.textContent = t("Foodzy.minsAway", { n: remainingMinutes });

  etaRow.appendChild(etaBadge);
  etaRow.appendChild(etaTime);
  statusCard.appendChild(etaRow);

  // 4-Step Status Bar
  const stepsList = document.createElement("ol");
  stepsList.className = "track-steps-bar";
  const stepLabels = [
    { key: "Foodzy.status.placed", label: t("Foodzy.status.placed"), done: true },
    { key: "Foodzy.status.preparing", label: t("Foodzy.status.preparing"), done: true },
    { key: "Foodzy.status.onTheWay", label: t("Foodzy.status.onTheWay"), active: true },
    { key: "Foodzy.status.delivered", label: t("Foodzy.status.delivered"), future: true }
  ];

  stepLabels.forEach((s) => {
    const li = document.createElement("li");
    let cls = "track-step-item";
    if (s.done) cls += " done";
    if (s.active) cls += " active";
    if (s.future) cls += " future";
    li.className = cls;

    const dot = document.createElement("span");
    dot.className = "track-step-dot";

    const lbl = document.createElement("span");
    lbl.className = "track-step-label";
    lbl.textContent = s.label;

    li.appendChild(dot);
    li.appendChild(lbl);
    stepsList.appendChild(li);
  });
  statusCard.appendChild(stepsList);

  // Rider Card
  const riderCard = document.createElement("div");
  riderCard.className = "track-rider-card";

  const riderAvatar = document.createElement("div");
  riderAvatar.className = "track-rider-avatar";
  riderAvatar.textContent = app.riderName ? app.riderName.charAt(0) : "A";

  const riderInfo = document.createElement("div");
  riderInfo.className = "track-rider-info";

  const riderMsg = document.createElement("h4");
  riderMsg.className = "track-rider-name";
  riderMsg.textContent = t("Foodzy.riderOnWay", { name: app.riderName || "Arun" });

  const riderSub = document.createElement("p");
  riderSub.className = "track-rider-sub";
  riderSub.textContent = "Delivery Partner";

  riderInfo.appendChild(riderMsg);
  riderInfo.appendChild(riderSub);

  const callBtn = document.createElement("button");
  callBtn.type = "button";
  callBtn.className = "track-call-btn";
  callBtn.setAttribute("aria-label", "Call delivery partner demo");
  callBtn.innerHTML = CALL_ICON_SVG;
  callBtn.addEventListener("click", () => {
    showToast(t("demo.toast"), root);
  });

  riderCard.appendChild(riderAvatar);
  riderCard.appendChild(riderInfo);
  riderCard.appendChild(callBtn);
  statusCard.appendChild(riderCard);

  root.appendChild(statusCard);
  container.replaceChildren(root);

  return {
    unmount() {
      root.remove();
    }
  };
}
