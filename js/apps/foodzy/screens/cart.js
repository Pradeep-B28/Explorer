// Foodzy cart screen showing order lines, bill breakdown, address, and place order button.
// Uses Foodzy state, copy.js, and formatINR from js/engine/money.js.
// Used by Foodzy app index.js.

import { getAppContent } from "../../../content.js";
import { t } from "../../../copy.js";
import { formatINR } from "../../../engine/money.js";
import { journeyValues } from "../../../engine/foodzy/values.js";
import { emit } from "../../../events.js";
import {
  getCart,
  getBill,
  addCartItem,
  removeCartItem,
  placeCurrentOrder,
  navigate,
  subscribe
} from "../state.js";

const { restaurants, app } = getAppContent("foodzy");

const BACK_ARROW_SVG = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
`;

export function mount(container) {
  const root = document.createElement("div");
  root.className = "foodzy-screen foodzy-cart-screen";

  // Header Nav
  const nav = document.createElement("nav");
  nav.className = "foodzy-sub-nav";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "foodzy-back-btn";
  backBtn.setAttribute("aria-label", "Back");
  backBtn.innerHTML = BACK_ARROW_SVG;
  backBtn.addEventListener("click", () => {
    const c = getCart();
    if (c.shopId) {
      navigate("restaurant", { restaurantId: c.shopId });
    } else {
      navigate("home");
    }
  });

  const navTitle = document.createElement("h2");
  navTitle.className = "foodzy-sub-nav-title";
  navTitle.textContent = t("Foodzy.cartTitle");

  nav.appendChild(backBtn);
  nav.appendChild(navTitle);
  root.appendChild(nav);

  const contentArea = document.createElement("div");
  contentArea.className = "foodzy-cart-content";
  root.appendChild(contentArea);

  function render() {
    contentArea.replaceChildren();
    const cart = getCart();

    if (!cart.lines || cart.lines.length === 0) {
      // Empty state
      const emptyBox = document.createElement("div");
      emptyBox.className = "foodzy-empty-cart-box";

      const emptyText = document.createElement("p");
      emptyText.className = "empty-cart-msg";
      emptyText.textContent = t("Foodzy.emptyCart");

      const browseBtn = document.createElement("button");
      browseBtn.type = "button";
      browseBtn.className = "empty-cart-browse-btn";
      browseBtn.textContent = "Browse restaurants";
      browseBtn.addEventListener("click", () => navigate("home"));

      emptyBox.appendChild(emptyText);
      emptyBox.appendChild(browseBtn);
      contentArea.appendChild(emptyBox);
      return;
    }

    const shop = restaurants.find((r) => r.id === cart.shopId);

    // Restaurant header
    const shopHeader = document.createElement("div");
    shopHeader.className = "cart-shop-header";
    const shopName = document.createElement("h3");
    shopName.className = "cart-shop-name";
    shopName.textContent = shop ? shop.name : "Restaurant";
    const shopArea = document.createElement("p");
    shopArea.className = "cart-shop-area";
    shopArea.textContent = shop ? shop.area : "";
    shopHeader.appendChild(shopName);
    shopHeader.appendChild(shopArea);
    contentArea.appendChild(shopHeader);

    // Order Lines Card
    const linesCard = document.createElement("div");
    linesCard.className = "cart-lines-card";

    cart.lines.forEach((item) => {
      const dish = shop ? shop.menu.find((d) => d.id === item.itemId) : null;
      if (!dish) return;

      const lineRow = document.createElement("div");
      lineRow.className = "cart-line-row";

      const lineName = document.createElement("span");
      lineName.className = "cart-line-name";
      lineName.textContent = dish.name;

      // Stepper
      const stepper = document.createElement("div");
      stepper.className = "dish-stepper compact";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "dish-step-btn minus";
      minusBtn.textContent = "-";
      minusBtn.setAttribute("aria-label", "Decrease");
      minusBtn.addEventListener("click", () => removeCartItem(dish.id));

      const qtySpan = document.createElement("span");
      qtySpan.className = "dish-step-qty";
      qtySpan.textContent = String(item.qty);

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "dish-step-btn plus";
      plusBtn.textContent = "+";
      plusBtn.setAttribute("aria-label", "Increase");
      plusBtn.addEventListener("click", () => addCartItem(dish.id));

      stepper.appendChild(minusBtn);
      stepper.appendChild(qtySpan);
      stepper.appendChild(plusBtn);

      const lineTotal = document.createElement("span");
      lineTotal.className = "cart-line-total";
      lineTotal.textContent = formatINR(dish.price * item.qty);

      lineRow.appendChild(lineName);
      lineRow.appendChild(stepper);
      lineRow.appendChild(lineTotal);
      linesCard.appendChild(lineRow);
    });

    contentArea.appendChild(linesCard);

    // Bill Details Card
    const billCard = document.createElement("div");
    billCard.className = "cart-bill-card";

    const billTitle = document.createElement("h4");
    billTitle.className = "cart-bill-title";
    billTitle.textContent = t("Foodzy.billTitle");
    billCard.appendChild(billTitle);

    const b = getBill();

    function addBillRow(label, value, isBold = false, isDelivery = false) {
      const row = document.createElement("div");
      row.className = `bill-detail-row ${isBold ? "bill-total-row" : ""}`;

      const lbl = document.createElement("span");
      lbl.className = "bill-row-label";
      lbl.textContent = label;

      const val = document.createElement("span");
      val.className = "bill-row-value";

      if (isDelivery && b.delivery === 0) {
        const struck = document.createElement("s");
        struck.className = "struck-fee";
        struck.textContent = formatINR(app.fees.delivery);
        const freeTag = document.createElement("span");
        freeTag.className = "free-delivery-tag";
        freeTag.textContent = t("Foodzy.free");

        val.appendChild(struck);
        val.appendChild(document.createTextNode(" "));
        val.appendChild(freeTag);
      } else {
        val.textContent = value;
      }

      row.appendChild(lbl);
      row.appendChild(val);
      billCard.appendChild(row);
    }

    addBillRow(t("Foodzy.itemTotal"), formatINR(b.itemTotal));
    addBillRow(t("Foodzy.delivery"), formatINR(b.delivery), false, true);
    addBillRow(t("Foodzy.platform"), formatINR(b.platform));
    addBillRow(t("Foodzy.gst"), formatINR(b.gst));
    addBillRow(t("Foodzy.toPay"), formatINR(b.total), true);

    contentArea.appendChild(billCard);

    // Delivery & Payment info
    const infoCard = document.createElement("div");
    infoCard.className = "cart-delivery-card";

    const deliverToRow = document.createElement("div");
    deliverToRow.className = "delivery-info-row";
    const deliverLbl = document.createElement("span");
    deliverLbl.className = "delivery-label";
    deliverLbl.textContent = t("Foodzy.deliverTo");
    const deliverAddr = document.createElement("span");
    deliverAddr.className = "delivery-address";
    deliverAddr.textContent = app.user.address;
    deliverToRow.appendChild(deliverLbl);
    deliverToRow.appendChild(deliverAddr);

    const payRow = document.createElement("div");
    payRow.className = "delivery-info-row";
    const payText = document.createElement("span");
    payText.className = "payment-text";
    payText.textContent = t("Foodzy.payWith", { method: app.payment || "UPI" });
    payRow.appendChild(payText);

    infoCard.appendChild(deliverToRow);
    infoCard.appendChild(payRow);
    contentArea.appendChild(infoCard);

    // Sticky Checkout Footer
    const footer = document.createElement("footer");
    footer.className = "cart-checkout-footer";

    const footerTotal = document.createElement("div");
    footerTotal.className = "checkout-footer-total";
    const totalLbl = document.createElement("span");
    totalLbl.className = "footer-total-label";
    totalLbl.textContent = t("Foodzy.toPay");
    const totalVal = document.createElement("span");
    totalVal.className = "footer-total-val";
    totalVal.textContent = formatINR(b.total);
    footerTotal.appendChild(totalLbl);
    footerTotal.appendChild(totalVal);

    const placeBtn = document.createElement("button");
    placeBtn.type = "button";
    placeBtn.id = "place-order";
    placeBtn.className = "checkout-place-btn";
    placeBtn.textContent = t("Foodzy.placeOrder");
    placeBtn.addEventListener("click", () => {
      const isExplaining = typeof window !== "undefined" && window.__isExplaining;
      const currentCart = getCart();
      if (!currentCart || currentCart.lines.length === 0) return;

      if (isExplaining) {
        const values = journeyValues("order", { cart: currentCart, orderNumber: 1 }, { app, restaurants }, t);
        emit("journey:request", {
          journeyId: "order",
          values,
          commit: () => {
            placeCurrentOrder();
          }
        });
      } else {
        placeCurrentOrder();
      }
    });

    footer.appendChild(footerTotal);
    footer.appendChild(placeBtn);
    contentArea.appendChild(footer);
  }

  const unsubscribe = subscribe(() => {
    render();
  });

  render();
  container.replaceChildren(root);

  return {
    unmount() {
      unsubscribe();
      root.remove();
    }
  };
}
