// Foodzy tracking screen with live SVG route map, order lookup input, rider card, and status progression.
// Uses map.js, toast.js, copy.js, trackingEta from js/engine/foodzy/orders.js.
// Used by Foodzy app index.js.

import { getAppContent } from "../../../content.js";
import { t } from "../../../copy.js";
import { trackingEta } from "../../../engine/foodzy/orders.js";
import { showToast } from "../../../ui/toast.js";
import { createTrackingMap } from "../ui/map.js";
import { navigate, getLastOrder } from "../state.js";

const { app } = getAppContent("foodzy") || { app: { riderName: "Arun" } };

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
  let currentOrderId = params.orderId || (lastOrder ? lastOrder.id : "FZ-52001");
  let shopName = params.shopName || (lastOrder ? lastOrder.shopName : "Marina Biryani Co.");
  let initialEta = params.eta || (lastOrder ? lastOrder.eta : 32);
  let remainingMinutes = trackingEta(initialEta);

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

  // Order Lookup Card (Action 4: working order-lookup inputs)
  const lookupCard = document.createElement("div");
  lookupCard.className = "track-lookup-card";

  const lookupForm = document.createElement("form");
  lookupForm.className = "track-lookup-form";
  lookupForm.setAttribute("role", "search");
  lookupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = lookupInput.value.trim();
    if (val) {
      currentOrderId = val;
      orderNumSpan.textContent = val;
      showToast(`Tracking order ${val}`, root);
    }
  });

  const lookupLabel = document.createElement("label");
  lookupLabel.className = "track-lookup-label";
  lookupLabel.htmlFor = "track-order-lookup-input";
  lookupLabel.textContent = "Order Lookup";

  const lookupInputRow = document.createElement("div");
  lookupInputRow.className = "track-lookup-input-row";

  const lookupInput = document.createElement("input");
  lookupInput.id = "track-order-lookup-input";
  lookupInput.type = "text";
  lookupInput.className = "track-lookup-input";
  lookupInput.value = currentOrderId;
  lookupInput.placeholder = "Enter Order ID (e.g. FZ-52001)";
  lookupInput.setAttribute("aria-label", "Order ID to track");

  const lookupSubmitBtn = document.createElement("button");
  lookupSubmitBtn.type = "submit";
  lookupSubmitBtn.className = "track-lookup-submit-btn";
  lookupSubmitBtn.textContent = "Track";

  lookupInputRow.appendChild(lookupInput);
  lookupInputRow.appendChild(lookupSubmitBtn);

  lookupForm.appendChild(lookupLabel);
  lookupForm.appendChild(lookupInputRow);
  lookupCard.appendChild(lookupForm);
  root.appendChild(lookupCard);

  // Map
  const mapObj = createTrackingMap({ shopName, progress: 0.65 });
  root.appendChild(mapObj.element);

  // Status Card below map
  const statusCard = document.createElement("div");
  statusCard.className = "track-status-card";

  // Order Info Header
  const orderMetaRow = document.createElement("div");
  orderMetaRow.className = "track-order-meta-row";

  const orderIdLabel = document.createElement("span");
  orderIdLabel.className = "track-order-id-label";
  orderIdLabel.textContent = "Order ";

  const orderNumSpan = document.createElement("strong");
  orderNumSpan.className = "track-order-number";
  orderNumSpan.textContent = currentOrderId;
  orderIdLabel.appendChild(orderNumSpan);

  const shopNameSpan = document.createElement("span");
  shopNameSpan.className = "track-shop-name";
  shopNameSpan.textContent = shopName;

  orderMetaRow.appendChild(orderIdLabel);
  orderMetaRow.appendChild(shopNameSpan);
  statusCard.appendChild(orderMetaRow);

  // ETA Banner
  const etaRow = document.createElement("div");
  etaRow.className = "track-eta-row";

  const etaBadge = document.createElement("span");
  etaBadge.className = "track-eta-badge";
  etaBadge.textContent = t("foodzy.status.onTheWay");

  const etaTime = document.createElement("span");
  etaTime.className = "track-eta-time";
  etaTime.textContent = t("foodzy.minsAway", { n: remainingMinutes });

  etaRow.appendChild(etaBadge);
  etaRow.appendChild(etaTime);
  statusCard.appendChild(etaRow);

  // 4-Step Status Bar
  const stepsList = document.createElement("ol");
  stepsList.className = "track-steps-bar";
  const stepLabels = [
    { key: "foodzy.status.placed", label: t("foodzy.status.placed"), done: true },
    { key: "foodzy.status.preparing", label: t("foodzy.status.preparing"), done: true },
    { key: "foodzy.status.onTheWay", label: t("foodzy.status.onTheWay"), active: true },
    { key: "foodzy.status.delivered", label: t("foodzy.status.delivered"), future: true }
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
  riderMsg.textContent = t("foodzy.riderOnWay", { name: app.riderName || "Arun" });

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
    showToast(t("demo.toast") || "Demo action", root);
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
