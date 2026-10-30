// Exports user-facing copy strings and translation helper t().
// Uses fillText from js/engine/template.js.
// Used by content check, selftest, player, screens, and UI components.

import { fillText } from "./engine/template.js";

export const COPY = {
  // Site
  "site.title": "Explorer",
  "site.description": "Use a real-looking app, then split it into its 5 layers and watch every tap travel from your phone to the server and back.",

  // Home screen
  "home.eyebrow": "A Wrench Wise project",
  "home.title": "See inside the apps you use every day.",
  "home.subtitle": "Use Foodzy, a real-looking food app. Then split it into its 5 layers and watch every tap travel from your phone to the server and back.",
  "home.open": "Explore Foodzy",
  "home.fact1": "5 layers, side by side",
  "home.fact2": "Real code at every step",
  "home.fact3": "No sign-up needed",
  "home.stepsTitle": "How it works",
  "home.step1.title": "Use the app",
  "home.step1.body": "Search, add dishes and place an order in Foodzy, a made-up food app.",
  "home.step2.title": "Split it open",
  "home.step2.body": "One tap splits the app into its 5 layers, side by side.",
  "home.step3.title": "Watch it travel",
  "home.step3.body": "Follow every tap from your phone to the server and the database, with the code at each stop.",
  "home.stackTitle": "Frontend plus backend is full stack",
  "home.stackBody": "A full stack developer builds all five layers.",
  "home.pickTitle": "Pick an app",
  "home.pickSub": "Every app here is made up for learning. More are coming.",
  "home.bandTitle": "Want to build apps like these?",
  "home.bandBody": "In the {program}, you build every layer yourself.",

  // App picker
  "app.open": "Open",
  "app.soon": "Coming soon",

  // Stage
  "stage.back": "All apps",
  "stage.explode": "Show me how it works",
  "stage.together": "Put it back together",
  "stage.frontend": "Frontend: runs on your phone",
  "stage.backend": "Backend: runs on a server",
  "stage.fullstack": "Full stack means both",
  "stage.internet": "Internet",
  "stage.intro.title": "5 layers. Every app has them.",
  "stage.intro.body": "Now use the app. Each tap travels through the layers.",

  // Panel & Dock
  "panel.intro.title": "Want to see inside?",
  "panel.intro.body": "Tap the button and this app splits into the 5 layers a full stack developer builds, side by side.",
  "panel.flowsTitle": "Try a flow",
  "panel.doIt": "Do it for me",
  "panel.tryIt": "Try it yourself",
  "panel.yourTurn": "Your turn: {hint}",
  "panel.cancel": "Cancel",
  "panel.notReached": "Not reached yet",
  "panel.copy": "Copy code",
  "panel.copied": "Copied",
  "panel.allCode": "See the full stack code",
  "panel.allCodeTitle": "Every line of code in this flow",
  "panel.follow": "Follow the packet",
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

  // Layer cards
  "card.last": "Last: {title}",
  "card.live": "Live. You can tap it.",
  "card.viewCode": "View code",

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
  "share.text": "I watched a food order travel through all 5 layers of an app, side by side. Try it:",
  "share.copied": "Link copied",

  // Theme
  "theme.toLight": "Switch to light theme",
  "theme.toDark": "Switch to dark theme",

  // Demo
  "demo.toast": "This is a demo app, so this button does nothing.",

  // Footer
  "footer.line": "Built by Wrench Wise to show what full stack developers build.",
  "footer.disclaimer": "Foodzy, Mpay, Chitchat and Tripz are made-up apps for learning. They are not linked to any real company.",
  "footer.legal": "© 2026 Wrench Wise Edutech Private Limited",

  // Foodzy app
  "foodzy.home": "Home",
  "foodzy.searchPlaceholder": "Search for dishes or restaurants",
  "foodzy.nearYou": "Restaurants near you",
  "foodzy.resultsFor": "Results for \"{query}\"",
  "search.count": "{n} restaurants",
  "search.count.one": "{n} restaurant",
  "foodzy.noResults": "No matches for \"{query}\". Try biryani or coffee.",
  "foodzy.dishes": "Dishes: {list}",
  "foodzy.andMore": "and {n} more",
  "foodzy.mins": "{n} mins",
  "foodzy.forTwo": "{price} for two",
  "foodzy.pureVeg": "Pure veg",
  "foodzy.bestseller": "Bestseller",
  "foodzy.add": "ADD",
  "foodzy.menu": "Menu",
  "cart.bar": "{n} items, {total}",
  "cart.bar.one": "{n} item, {total}",
  "foodzy.viewCart": "View cart",
  "foodzy.cartTitle": "Your cart",
  "foodzy.billTitle": "Bill details",
  "foodzy.itemTotal": "Item total",
  "foodzy.delivery": "Delivery fee",
  "foodzy.free": "FREE",
  "foodzy.platform": "Platform fee",
  "foodzy.gst": "GST and restaurant charges",
  "foodzy.toPay": "To pay",
  "foodzy.deliverTo": "Delivering to",
  "foodzy.payWith": "Pay with {method}",
  "foodzy.placeOrder": "Place order",
  "foodzy.emptyCart": "Your cart is empty. Add something tasty.",
  "foodzy.newCart.title": "Start a new cart?",
  "foodzy.newCart.body": "Your cart has dishes from {shop}. Start a new cart with this dish instead?",
  "foodzy.newCart.keep": "Keep my cart",
  "foodzy.newCart.start": "Start new cart",
  "foodzy.maxQty": "You can add up to {n} of one dish.",
  "foodzy.placed": "Order placed",
  "foodzy.orderNo": "Order {id}",
  "foodzy.preparing": "{shop} is preparing your food.",
  "foodzy.arriving": "Arriving in {n} mins",
  "foodzy.track": "Track order",
  "foodzy.backHome": "Back to home",
  "foodzy.status.placed": "Placed",
  "foodzy.status.preparing": "Preparing",
  "foodzy.status.onTheWay": "On the way",
  "foodzy.status.delivered": "Delivered",
  "foodzy.riderOnWay": "{name} is on the way",
  "foodzy.minsAway": "{n} mins away",
  "foodzy.serverReady": "api.foodzy.example ready on port 3000",
  "foodzy.serverWaiting": "Waiting for requests"
};

/**
 * Returns translation with values filled.
 * Supports case-insensitivity (e.g. foodzy.home and Foodzy.home).
 * If values.n === 1 and key.one exists, uses key.one.
 * @param {string} key
 * @param {Record<string, any>} [values={}]
 * @returns {string}
 */
export function t(key, values = {}) {
  const normalizedKey = key.startsWith("Foodzy.") ? "foodzy." + key.slice(7) : key;
  const k = values.n === 1 && COPY[normalizedKey + ".one"] ? normalizedKey + ".one" : normalizedKey;
  const raw = COPY[k] !== undefined ? COPY[k] : COPY[key];
  if (raw === undefined) return key;
  return fillText(raw, values);
}
