// Exports user-facing copy strings and translation helper t().
// Uses fillText from js/engine/template.js.
// Used by content check, selftest, player, screens, and UI components.

import { fillText } from "./engine/template.js";

export const COPY = {
  // Site
  "site.title": "Explorer",
  "site.description": "Use a real-looking app, then split it open and watch your order travel through every layer.",

  // Home screen
  "home.eyebrow": "A Wrench Wise project",
  "home.title": "Every app you use has 5 hidden layers.",
  "home.subtitle": "Order food in a real-looking app. Then split it open and watch your order travel through every layer.",
  "home.open": "Open Foodzy",
  "home.how": "How it works",
  "home.layersTitle": "The 5 layers inside every app",
  "home.pickTitle": "Pick an app",
  "home.pickSub": "Every app here is made up for learning. More are coming.",

  // App picker
  "app.open": "Open",
  "app.soon": "Coming soon",

  // Stage
  "stage.back": "All apps",
  "stage.explode": "Show me how it works",
  "stage.together": "Put it back together",
  "stage.intro.title": "5 layers. Every app has them.",
  "stage.intro.body": "Now use the app. Each tap travels through the layers.",

  // Panel
  "panel.intro.title": "Want to see inside?",
  "panel.intro.body": "Tap the button and this app splits into the 5 layers a full stack developer builds.",
  "panel.flowsTitle": "Try a flow",
  "panel.doIt": "Do it for me",
  "panel.watched": "Watched",
  "panel.step": "Step {n} of {total}",
  "panel.code": "The code",
  "panel.packet": "What travels",
  "panel.play": "Play",
  "panel.pause": "Pause",
  "panel.next": "Next",
  "panel.prev": "Back",
  "panel.replay": "Replay",
  "panel.close": "Close",
  "panel.speed": "Speed",
  "panel.busy": "Wait for this flow to finish, or close it.",

  // Flow end & CTA
  "flow.end.title": "What this shows",
  "cta.title": "This is what a full stack developer builds.",
  "cta.body": "In the {program}, you'll build an app like this, every layer of it.",
  "cta.whatsapp": "Talk to us on WhatsApp",
  "cta.program": "See the program",
  "cta.another": "Try another flow",
  "cta.progress": "You've watched {n} of {total} flows.",
  "cta.all": "You've seen how a whole app works.",

  // Sharing
  "share.button": "Share",
  "share.text": "I watched a food order travel through all 5 layers of an app. Try it:",
  "share.copied": "Link copied",

  // Theme
  "theme.toLight": "Switch to light theme",
  "theme.toDark": "Switch to dark theme",

  // Demo
  "demo.toast": "This is a demo app, so this button does nothing.",

  // Footer
  "footer.line": "Built by Wrench Wise to show what full stack developers build.",
  "footer.disclaimer": "Foodzy, MPay, ChitChat and Tripz are made-up apps for learning. They are not linked to any real company.",
  "footer.legal": "© 2026 Wrench Wise Edutech Private Limited",

  // Foodzy app
  "Foodzy.home": "Home",
  "Foodzy.searchPlaceholder": "Search for dishes or restaurants",
  "Foodzy.nearYou": "Restaurants near you",
  "Foodzy.resultsFor": "Results for \"{query}\"",
  "search.count": "{n} restaurants",
  "search.count.one": "{n} restaurant",
  "Foodzy.noResults": "No matches for \"{query}\". Try biryani or coffee.",
  "Foodzy.dishes": "Dishes: {list}",
  "Foodzy.andMore": "and {n} more",
  "Foodzy.mins": "{n} mins",
  "Foodzy.forTwo": "{price} for two",
  "Foodzy.pureVeg": "Pure veg",
  "Foodzy.bestseller": "Bestseller",
  "Foodzy.add": "ADD",
  "Foodzy.menu": "Menu",
  "cart.bar": "{n} items, {total}",
  "cart.bar.one": "{n} item, {total}",
  "Foodzy.viewCart": "View cart",
  "Foodzy.cartTitle": "Your cart",
  "Foodzy.billTitle": "Bill details",
  "Foodzy.itemTotal": "Item total",
  "Foodzy.delivery": "Delivery fee",
  "Foodzy.free": "FREE",
  "Foodzy.platform": "Platform fee",
  "Foodzy.gst": "GST and restaurant charges",
  "Foodzy.toPay": "To pay",
  "Foodzy.deliverTo": "Delivering to",
  "Foodzy.payWith": "Pay with {method}",
  "Foodzy.placeOrder": "Place order",
  "Foodzy.emptyCart": "Your cart is empty. Add something tasty.",
  "Foodzy.newCart.title": "Start a new cart?",
  "Foodzy.newCart.body": "Your cart has dishes from {shop}. Start a new cart with this dish instead?",
  "Foodzy.newCart.keep": "Keep my cart",
  "Foodzy.newCart.start": "Start new cart",
  "Foodzy.maxQty": "You can add up to {n} of one dish.",
  "Foodzy.placed": "Order placed",
  "Foodzy.orderNo": "Order {id}",
  "Foodzy.preparing": "{shop} is preparing your food.",
  "Foodzy.arriving": "Arriving in {n} mins",
  "Foodzy.track": "Track order",
  "Foodzy.backHome": "Back to home",
  "Foodzy.status.placed": "Placed",
  "Foodzy.status.preparing": "Preparing",
  "Foodzy.status.onTheWay": "On the way",
  "Foodzy.status.delivered": "Delivered",
  "Foodzy.riderOnWay": "{name} is on the way",
  "Foodzy.minsAway": "{n} mins away"
};

/**
 * Returns translation with values filled.
 * If values.n === 1 and key.one exists, uses key.one.
 * @param {string} key
 * @param {Record<string, any>} [values={}]
 * @returns {string}
 */
export function t(key, values = {}) {
  const k = values.n === 1 && COPY[key + ".one"] ? key + ".one" : key;
  const raw = COPY[k];
  if (raw === undefined) return key;
  return fillText(raw, values);
}
