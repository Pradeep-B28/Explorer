// Manages Foodzy cart, search, orders, and screen navigation state.
// Uses js/engine/Foodzy/cart.js, search.js, orders.js, and js/content.js.
// Used by Foodzy app screens and index.js.

import { getAppContent, CONFIG } from "../../content.js";
import { emptyCart, addItem, removeItem, replaceWith, cartFrom, itemCount, bill } from "../../engine/Foodzy/cart.js";
import { search } from "../../engine/Foodzy/search.js";
import { orderId, trackingEta } from "../../engine/Foodzy/orders.js";

const { app, restaurants } = getAppContent("Foodzy");

// State
let cart = emptyCart();
let searchQuery = "";
let searchActive = false;
let searchResults = [...restaurants];

let orderCounter = 1;
const placedOrders = [];

let currentScreen = "home";
let screenParams = {};

const listeners = new Set();

function notify() {
  for (const fn of Array.from(listeners)) {
    try {
      fn();
    } catch (e) {
      // Ignore listener errors
    }
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Navigation
export function getScreen() {
  return { screen: currentScreen, params: screenParams };
}

export function navigate(screen, params = {}) {
  currentScreen = screen;
  screenParams = params;
  notify();
}

// Cart
export function getCart() {
  return cart;
}

export function setCart(newCart) {
  cart = newCart;
  notify();
}

export function clearCart() {
  cart = emptyCart();
  notify();
}

export function getBill() {
  return bill(cart, restaurants, app.fees);
}

export function getItemCount() {
  return itemCount(cart);
}

export function addCartItem(itemId) {
  const result = addItem(cart, restaurants, itemId, CONFIG.limits.maxQtyPerItem);
  if (result.cart) {
    cart = result.cart;
    notify();
  }
  return result;
}

export function removeCartItem(itemId) {
  cart = removeItem(cart, itemId);
  notify();
  return cart;
}

export function replaceCartWith(itemId) {
  cart = replaceWith(restaurants, itemId);
  notify();
  return cart;
}

// Search
export function getSearchState() {
  return {
    query: searchQuery,
    active: searchActive,
    results: searchResults
  };
}

export function executeSearch(query) {
  searchQuery = query;
  const res = search(restaurants, query, CONFIG.limits.searchMinChars);
  searchActive = res.active;
  searchResults = res.results;
  notify();
  return res;
}

export function clearSearch() {
  searchQuery = "";
  searchActive = false;
  searchResults = [...restaurants];
  notify();
}

// Orders
export function placeCurrentOrder() {
  const currentBill = getBill();
  const shop = restaurants.find((r) => r.id === cart.shopId);
  const id = orderId(orderCounter++, app.orders);
  const eta = shop ? shop.etaMin : 30;

  const order = {
    id,
    shopId: cart.shopId,
    shopName: shop ? shop.name : "Restaurant",
    total: currentBill.total,
    eta,
    status: "PLACED",
    createdAt: new Date()
  };

  placedOrders.push(order);
  clearCart();
  navigate("placed", { orderId: id, shopName: order.shopName, eta });
  return order;
}

export function getLastOrder() {
  return placedOrders.length > 0 ? placedOrders[placedOrders.length - 1] : null;
}

export function getPlacedOrders() {
  return placedOrders;
}

if (typeof window !== "undefined") {
  window.__foodzyState = {
    getCart,
    setCart,
    addCartItem,
    removeCartItem,
    getScreen,
    navigate,
    clearCart,
    getLastOrder
  };
}
