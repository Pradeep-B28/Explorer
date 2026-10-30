// Order placed confirmation screen with success tick, order ID, and tracking action.
// Uses Foodzy state and copy.js.
// Used by Foodzy app index.js.

import { getAppContent } from "../../../content.js";
import { t } from "../../../copy.js";
import { journeyValues } from "../../../engine/Foodzy/values.js";
import { emit } from "../../../events.js";
import { navigate, getLastOrder } from "../state.js";

const { app, restaurants } = getAppContent("Foodzy");

const TICK_SVG = `
  <svg class="success-tick-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="2.5"/>
    <path class="tick-path" d="M20 33 L28 41 L44 23" stroke="var(--brand)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

export function mount(container, params = {}) {
  const root = document.createElement("div");
  root.className = "foodzy-screen foodzy-placed-screen";
  root.setAttribute("role", "status");

  const lastOrder = getLastOrder();
  const orderId = params.orderId || (lastOrder ? lastOrder.id : "TH-52001");
  const shopName = params.shopName || (lastOrder ? lastOrder.shopName : "Marina Biryani Co.");
  const eta = params.eta || (lastOrder ? lastOrder.eta : 32);

  const card = document.createElement("div");
  card.className = "placed-success-card";

  const tickWrap = document.createElement("div");
  tickWrap.className = "placed-tick-wrap";
  tickWrap.innerHTML = TICK_SVG;
  card.appendChild(tickWrap);

  const title = document.createElement("h1");
  title.className = "placed-title";
  title.textContent = t("Foodzy.placed");
  card.appendChild(title);

  const orderNum = document.createElement("div");
  orderNum.className = "placed-order-num";
  orderNum.textContent = t("Foodzy.orderNo", { id: orderId });
  card.appendChild(orderNum);

  const shopMsg = document.createElement("p");
  shopMsg.className = "placed-shop-msg";
  shopMsg.textContent = t("Foodzy.preparing", { shop: shopName });
  card.appendChild(shopMsg);

  const etaMsg = document.createElement("p");
  etaMsg.className = "placed-eta-msg";
  etaMsg.textContent = t("Foodzy.arriving", { n: eta });
  card.appendChild(etaMsg);

  const actions = document.createElement("div");
  actions.className = "placed-actions";

  const trackBtn = document.createElement("button");
  trackBtn.type = "button";
  trackBtn.className = "placed-track-btn";
  trackBtn.textContent = t("Foodzy.track");
  trackBtn.addEventListener("click", () => {
    const isExplaining = typeof window !== "undefined" && window.__isExplaining;
    const order = getLastOrder() || { id: orderId, shopId: "r1" };

    if (isExplaining) {
      const values = journeyValues("track", { orderId: order.id, shopId: order.shopId || "r1" }, { app, restaurants }, t);
      emit("journey:request", {
        journeyId: "track",
        values,
        commit: () => {
          navigate("track", { orderId, shopName, eta });
        }
      });
    } else {
      navigate("track", { orderId, shopName, eta });
    }
  });

  const homeBtn = document.createElement("button");
  homeBtn.type = "button";
  homeBtn.className = "placed-home-btn";
  homeBtn.textContent = t("Foodzy.backHome");
  homeBtn.addEventListener("click", () => {
    navigate("home");
  });

  actions.appendChild(trackBtn);
  actions.appendChild(homeBtn);
  card.appendChild(actions);

  root.appendChild(card);
  container.replaceChildren(root);

  return {
    unmount() {
      root.remove();
    }
  };
}
