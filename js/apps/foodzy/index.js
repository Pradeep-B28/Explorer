// Entry point for the Foodzy plug-in app inside the phone screen.
// Uses Foodzy screens, state, cartFrom, and copy.js.
// Used by js/apps/registry.js and stage.js.

import { getAppContent } from "../../content.js";
import { formatINR } from "../../engine/money.js";
import { cartFrom } from "../../engine/foodzy/cart.js";
import {
  getScreen,
  navigate,
  subscribe,
  setCart,
  getCart,
  getItemCount,
  getBill,
  getSearchState,
  executeSearch,
  placeCurrentOrder,
  getLastOrder
} from "./state.js";

import { mount as mountHome } from "./screens/home.js";
import { mount as mountRestaurant } from "./screens/restaurant.js";
import { mount as mountCart } from "./screens/cart.js";
import { mount as mountPlaced } from "./screens/placed.js";
import { mount as mountTrack } from "./screens/track.js";

const { app, restaurants } = getAppContent("foodzy");

/**
 * Mounts Foodzy into the target phone screen element.
 * @param {HTMLElement} screenEl
 * @param {object} [ctx={}]
 * @returns {{ unmount: () => void }}
 */
export function mount(screenEl, ctx = {}) {
  let activeScreenInstance = null;

  function renderCurrentScreen() {
    if (activeScreenInstance && typeof activeScreenInstance.unmount === "function") {
      activeScreenInstance.unmount();
      activeScreenInstance = null;
    }

    const { screen, params } = getScreen();

    switch (screen) {
      case "restaurant":
        activeScreenInstance = mountRestaurant(screenEl, params);
        break;
      case "cart":
        activeScreenInstance = mountCart(screenEl, params);
        break;
      case "placed":
        activeScreenInstance = mountPlaced(screenEl, params);
        break;
      case "track":
        activeScreenInstance = mountTrack(screenEl, params);
        break;
      case "home":
      default:
        activeScreenInstance = mountHome(screenEl, ctx);
        break;
    }
  }

  const unsubscribe = subscribe(() => {
    renderCurrentScreen();
  });

  renderCurrentScreen();

  return {
    unmount() {
      unsubscribe();
      if (activeScreenInstance && typeof activeScreenInstance.unmount === "function") {
        activeScreenInstance.unmount();
      }
      screenEl.replaceChildren();
    }
  };
}

function showTapRingAndClick(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const screen = document.getElementById("phone-screen") || document.body;
  const screenRect = screen.getBoundingClientRect();

  const ring = document.createElement("div");
  ring.className = "doit-tap-ring";
  ring.style.left = `${(rect.left + rect.width / 2) - screenRect.left}px`;
  ring.style.top = `${(rect.top + rect.height / 2) - screenRect.top}px`;
  screen.appendChild(ring);

  setTimeout(() => {
    ring.remove();
    el.click();
  }, 250);
}

/**
 * Prepares the flow prerequisite and performs the action for "Do it for me".
 * @param {string} journeyId
 */
export function doItForMe(journeyId) {
  switch (journeyId) {
    case "add": {
      // Go to first restaurant and tap ADD on dish r1i1
      navigate("restaurant", { restaurantId: restaurants[0].id });
      setTimeout(() => {
        const dishBtn = document.querySelector(`[data-dish-id="${restaurants[0].menu[0].id}"] .dish-add-btn`);
        if (dishBtn) showTapRingAndClick(dishBtn);
      }, 150);
      break;
    }
    case "search": {
      navigate("home");
      setTimeout(() => {
        const input = document.querySelector(".foodzy-search-input");
        const icon = document.querySelector(".search-icon-svg");
        if (input) input.value = "biryani";
        if (icon) showTapRingAndClick(icon);
        else executeSearch("biryani");
      }, 150);
      break;
    }
    case "order": {
      // Load demo cart and navigate to cart screen
      const demo = cartFrom(restaurants, app.demoCart);
      setCart(demo);
      navigate("cart");
      setTimeout(() => {
        const placeBtn = document.getElementById("place-order");
        if (placeBtn) showTapRingAndClick(placeBtn);
      }, 150);
      break;
    }
    case "track": {
      let order = getLastOrder();
      if (!order) {
        // Place demo order quietly without playing flow
        const demo = cartFrom(restaurants, app.demoCart);
        setCart(demo);
        order = placeCurrentOrder();
      } else {
        navigate("placed", { orderId: order.id, shopName: order.shopName, eta: order.eta });
      }
      setTimeout(() => {
        const trackBtn = document.querySelector(".placed-track-btn");
        if (trackBtn) showTapRingAndClick(trackBtn);
      }, 150);
      break;
    }
  }
}

/**
 * Returns DOM elements that the Styling layer outlines.
 * @returns {HTMLElement[]}
 */
export function wireframeTargets() {
  const root = document.getElementById("phone-screen");
  if (!root) return [];
  const selectors = [
    ".foodzy-loc-row",
    ".foodzy-search-box",
    ".foodzy-offer-banner",
    ".foodzy-category-chip",
    ".restaurant-card",
    ".restaurant-info-header",
    ".dish-item-row",
    ".cart-lines-card",
    ".cart-bill-card",
    ".cart-checkout-footer",
    ".placed-success-card",
    ".tracking-map-container",
    ".track-status-card"
  ];
  return Array.from(root.querySelectorAll(selectors.join(",")));
}

/**
 * Returns a small plain object snapshot for the Logic card.
 * (UPGRADE_BRIEF.md Section 5: under 8 keys)
 * @returns {object}
 */
export function stateSnapshot() {
  const { screen } = getScreen();
  const cart = getCart();
  const count = getItemCount();
  const b = getBill();
  const lastOrder = getLastOrder();

  return {
    screen,
    cart: {
      shop: cart.shopId || null,
      items: count,
      itemTotal: b.itemTotal
    },
    lastOrder: lastOrder ? lastOrder.id : null
  };
}

/**
 * Returns a short state summary line for the Logic layer.
 * @returns {string}
 */
export function stateLine() {
  const { screen } = getScreen();
  const count = getItemCount();
  const s = getSearchState();

  if (screen === "track") {
    const o = getLastOrder();
    return `order: ${o ? o.id : "none"}, tracking: on the way`;
  }
  if (screen === "placed") {
    const o = getLastOrder();
    return `order: ${o ? o.id : "none"}, status: PLACED`;
  }
  if (screen === "cart") {
    const b = getBill();
    return `cart: ${count} items, ${formatINR(b.total)}`;
  }
  if (s.active) {
    return `search: "${s.query}", ${s.results.length} results`;
  }
  if (count > 0) {
    const b = getBill();
    return `cart: ${count} items, ${formatINR(b.total)}`;
  }
  return `screen: ${screen}`;
}

if (typeof window !== "undefined") {
  window.__foodzyState = window.__foodzyState || {};
  window.__foodzyState.stateSnapshot = stateSnapshot;
}
