// The app registry: every app the site can show, live or coming soon.
// Locked content. A new app is a new entry here plus a folder in content/apps/.
// Used by content/index.js and the home screen app picker.

export const APPS = [
  {
    id: "Foodzy",
    name: "Foodzy",
    kind: "Food delivery",
    status: "live",
    teaser: "Order biryani and watch your order travel through every layer."
  },
  {
    id: "MPay",
    name: "MPay",
    kind: "UPI payments",
    status: "soon",
    teaser: "Send money to a friend and follow it all the way to their bank."
  },
  {
    id: "Chitchat",
    name: "Chitchat",
    kind: "Chat",
    status: "soon",
    teaser: "Send a message and watch it reach your friend's phone."
  },
  {
    id: "Tripz",
    name: "Tripz",
    kind: "Bus booking",
    status: "soon",
    teaser: "Book a bus seat and see why two people never get the same one."
  }
];
