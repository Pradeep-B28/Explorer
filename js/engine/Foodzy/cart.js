// Foodzy's cart and bill. A cart holds dishes from one restaurant only, like real food apps.
// Uses nothing (restaurants and fees are passed in). Pure functions: every change returns a new cart.
// Used by the Foodzy screens, the journey values, the self-test and tools/verify-content.mjs.

// cart = { shopId: "r1" | null, lines: [{ itemId, qty }] }
export function emptyCart() {
  return { shopId: null, lines: [] };
}

// Finds a dish and its restaurant by dish id. Returns null if not found.
export function findItem(restaurants, itemId) {
  for (const r of restaurants) {
    const item = r.menu.find((m) => m.id === itemId);
    if (item) return { restaurant: r, item };
  }
  return null;
}

// Adds one of a dish.
// Returns { ok: true, cart } or { ok: false, reason } where reason is
// "unknown-item", "other-shop" (cart has dishes from another restaurant) or "max-qty".
export function addItem(cart, restaurants, itemId, maxQty = 10) {
  const found = findItem(restaurants, itemId);
  if (!found) return { ok: false, reason: "unknown-item" };
  const shopId = found.restaurant.id;
  if (cart.shopId && cart.shopId !== shopId && cart.lines.length) return { ok: false, reason: "other-shop" };
  const line = cart.lines.find((l) => l.itemId === itemId);
  if (line && line.qty >= maxQty) return { ok: false, reason: "max-qty" };
  const lines = line
    ? cart.lines.map((l) => (l.itemId === itemId ? { itemId, qty: l.qty + 1 } : l))
    : [...cart.lines, { itemId, qty: 1 }];
  return { ok: true, cart: { shopId, lines } };
}

// Removes one of a dish. The line goes when it reaches 0, and the cart forgets its shop when empty.
export function removeItem(cart, itemId) {
  const lines = cart.lines
    .map((l) => (l.itemId === itemId ? { itemId, qty: l.qty - 1 } : l))
    .filter((l) => l.qty > 0);
  return { shopId: lines.length ? cart.shopId : null, lines };
}

// Empties the cart and starts it with one dish (used after "Start a new cart?").
export function replaceWith(restaurants, itemId) {
  return addItem(emptyCart(), restaurants, itemId);
}

// Builds a cart from a list like [{ itemId, qty }] (used for the demo cart).
export function cartFrom(restaurants, list) {
  let cart = emptyCart();
  for (const { itemId, qty } of list) {
    for (let i = 0; i < qty; i++) {
      const r = addItem(cart, restaurants, itemId);
      if (!r.ok) throw new Error(`Cannot build cart: ${r.reason} for ${itemId}`);
      cart = r.cart;
    }
  }
  return cart;
}

// Total number of dishes (2 biryanis and 1 raita is 3).
export function itemCount(cart) {
  return cart.lines.reduce((n, l) => n + l.qty, 0);
}

// The bill, in whole rupees.
// itemTotal: sum of price x qty.
// delivery: fees.delivery, or 0 when itemTotal is at least fees.freeDeliveryAbove. 0 for an empty cart.
// platform: fees.platform. 0 for an empty cart.
// gst: fees.gstPercent of itemTotal, rounded to the nearest rupee (Math.round).
// total: itemTotal + delivery + platform + gst.
export function bill(cart, restaurants, fees) {
  const lines = cart.lines.map((l) => {
    const { item } = findItem(restaurants, l.itemId);
    return { itemId: l.itemId, name: item.name, veg: item.veg, price: item.price, qty: l.qty, lineTotal: item.price * l.qty };
  });
  const itemTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  if (itemTotal === 0) return { lines, itemTotal: 0, delivery: 0, freeDelivery: false, platform: 0, gst: 0, total: 0 };
  const freeDelivery = itemTotal >= fees.freeDeliveryAbove;
  const delivery = freeDelivery ? 0 : fees.delivery;
  const platform = fees.platform;
  const gst = Math.round((itemTotal * fees.gstPercent) / 100);
  return { lines, itemTotal, delivery, freeDelivery, platform, gst, total: itemTotal + delivery + platform + gst };
}
