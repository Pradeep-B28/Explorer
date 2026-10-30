// Builds the live values each Foodzy journey needs, from the app's current state.
// Uses cart.js, orders.js and ../money.js. Pure functions. t() is passed in from js/copy.js.
// Used by the Foodzy screens when a journey starts, the self-test and tools/verify-content.mjs.

import { findItem, itemCount, bill } from "./cart.js";
import { orderId, trackingEta } from "./orders.js";
import { formatINR } from "../money.js";

// data = { app, restaurants } from content. t = the copy function (needs keys
// "cart.bar", "cart.bar.one", "search.count", "search.count.one").
//
// ctx by journey:
//   add:    { cart, itemId }          cart AFTER the dish was added
//   search: { query, result }         result from search() with at least 1 result
//   order:  { cart, orderNumber }     cart BEFORE it is cleared; orderNumber starts at 1 per visit
//   track:  { orderId, shopId }       the order being tracked
export function journeyValues(journeyId, ctx, data, t) {
  const { app, restaurants } = data;
  const shop = (id) => restaurants.find((r) => r.id === id);

  if (journeyId === "add") {
    const found = findItem(restaurants, ctx.itemId);
    const b = bill(ctx.cart, restaurants, app.fees);
    const n = itemCount(ctx.cart);
    // The cart bar always shows the ITEM total (not "To pay"), the same as cartBarLabel() below.
    return {
      itemId: ctx.itemId,
      itemName: found.item.name,
      priceLabel: formatINR(found.item.price),
      cartCount: n,
      cartLabel: t("cart.bar", { n, total: formatINR(b.itemTotal) })
    };
  }

  if (journeyId === "search") {
    const first = shop(ctx.result.results[0].id);
    const count = ctx.result.results.length;
    return {
      query: String(ctx.query).trim(),
      count,
      countLabel: t("search.count", { n: count }),
      firstId: first.id,
      firstName: first.name,
      firstRating: first.rating
    };
  }

  if (journeyId === "order") {
    const s = shop(ctx.cart.shopId);
    const b = bill(ctx.cart, restaurants, app.fees);
    return {
      restaurantName: s.name,
      totalLabel: formatINR(b.total),
      total: b.total,
      itemCount: itemCount(ctx.cart),
      orderId: orderId(ctx.orderNumber, app.orders),
      eta: s.etaMin
    };
  }

  if (journeyId === "track") {
    const s = shop(ctx.shopId);
    return {
      orderId: ctx.orderId,
      riderName: app.riderName,
      restaurantName: s.name,
      etaLeft: trackingEta(s.etaMin)
    };
  }

  throw new Error(`Unknown journey "${journeyId}"`);
}

// The words on the cart bar: "1 item, ₹289". Uses the ITEM total, never "To pay".
// The cart bar on screen and the Add to cart flow must both use this, so they always agree.
export function cartBarLabel(cart, data, t) {
  const b = bill(cart, data.restaurants, data.app.fees);
  return t("cart.bar", { n: itemCount(cart), total: formatINR(b.itemTotal) });
}
