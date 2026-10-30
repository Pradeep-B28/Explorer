// Foodzy restaurant screen displaying restaurant details, offer strip, and menu with dish steppers.
// Uses Foodzy state, dish UI, cartbar, dialog, toast, and copy.js.
// Used by Foodzy app index.js.

import { getAppContent, CONFIG } from "../../../content.js";
import { t } from "../../../copy.js";
import { formatINR } from "../../../engine/money.js";
import { showToast } from "../../../ui/toast.js";
import { showConfirmDialog } from "../../../ui/dialog.js";
import { createDishRow } from "../ui/dish.js";
import { createCartBar } from "../ui/cartbar.js";
import {
  getCart,
  addCartItem,
  removeCartItem,
  replaceCartWith,
  navigate,
  subscribe
} from "../state.js";

const { restaurants, app } = getAppContent("Foodzy");

const BACK_ARROW_SVG = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
`;

const STAR_SVG = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
`;

export function mount(container, { restaurantId }) {
  const root = document.createElement("div");
  root.className = "foodzy-screen foodzy-restaurant-screen";

  const restaurant = restaurants.find((r) => r.id === restaurantId) || restaurants[0];

  // Header Nav
  const nav = document.createElement("nav");
  nav.className = "foodzy-sub-nav";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "foodzy-back-btn";
  backBtn.setAttribute("aria-label", "Back to restaurants");
  backBtn.innerHTML = BACK_ARROW_SVG;
  backBtn.addEventListener("click", () => navigate("home"));

  const navTitle = document.createElement("h2");
  navTitle.className = "foodzy-sub-nav-title";
  navTitle.textContent = restaurant.name;

  nav.appendChild(backBtn);
  nav.appendChild(navTitle);
  root.appendChild(nav);

  // Restaurant Summary Box
  const infoCard = document.createElement("div");
  infoCard.className = "restaurant-info-header";

  const nameRow = document.createElement("div");
  nameRow.className = "info-header-top";
  const rName = document.createElement("h1");
  rName.className = "info-restaurant-name";
  rName.textContent = restaurant.name;

  const rChip = document.createElement("div");
  rChip.className = "restaurant-rating-chip";
  rChip.innerHTML = `${STAR_SVG} <span>${restaurant.rating.toFixed(1)}</span>`;

  nameRow.appendChild(rName);
  nameRow.appendChild(rChip);
  infoCard.appendChild(nameRow);

  const subMeta = document.createElement("div");
  subMeta.className = "info-header-sub";
  const etaText = t("Foodzy.mins", { n: restaurant.etaMin });
  subMeta.textContent = `${restaurant.cuisine} • ${restaurant.area} • ${etaText}`;
  infoCard.appendChild(subMeta);

  // Offer strip
  const offerStrip = document.createElement("div");
  offerStrip.className = "restaurant-offer-strip";
  const freeAboveStr = formatINR(app.fees.freeDeliveryAbove);
  offerStrip.textContent = `Free delivery above ${freeAboveStr}`;
  infoCard.appendChild(offerStrip);

  root.appendChild(infoCard);

  // Menu Section
  const menuSection = document.createElement("section");
  menuSection.className = "restaurant-menu-section";

  const menuTitle = document.createElement("h3");
  menuTitle.className = "menu-section-title";
  menuTitle.textContent = t("Foodzy.menu");
  menuSection.appendChild(menuTitle);

  const dishesList = document.createElement("div");
  dishesList.className = "restaurant-dishes-list";
  menuSection.appendChild(dishesList);
  root.appendChild(menuSection);

  // Cart bar
  const cartBar = createCartBar(() => navigate("cart"));
  root.appendChild(cartBar.element);

  function handleAdd(dishId) {
    const res = addCartItem(dishId);
    if (res.reason === "other-shop") {
      const currentCart = getCart();
      const currentShop = restaurants.find((r) => r.id === currentCart.shopId);
      const shopName = currentShop ? currentShop.name : "another restaurant";

      showConfirmDialog({
        title: t("Foodzy.newCart.title"),
        body: t("Foodzy.newCart.body", { shop: shopName }),
        keepText: t("Foodzy.newCart.keep"),
        startText: t("Foodzy.newCart.start"),
        onStart: () => replaceCartWith(dishId),
        container: root
      });
    } else if (res.reason === "max-qty") {
      showToast(t("Foodzy.maxQty", { n: CONFIG.limits.maxQtyPerItem }), root);
    }
  }

  function handleRemove(dishId) {
    removeCartItem(dishId);
  }

  function renderDishes() {
    dishesList.replaceChildren();
    const cart = getCart();

    restaurant.menu.forEach((dish) => {
      const item = cart.lines ? cart.lines.find((i) => i.itemId === dish.id) : null;
      const qty = item ? item.qty : 0;

      const row = createDishRow({
        dish,
        qty,
        onAdd: handleAdd,
        onRemove: handleRemove
      });
      dishesList.appendChild(row);
    });

    cartBar.update();
  }

  const unsubscribe = subscribe(() => {
    renderDishes();
  });

  renderDishes();
  container.replaceChildren(root);

  return {
    unmount() {
      unsubscribe();
      root.remove();
    }
  };
}
