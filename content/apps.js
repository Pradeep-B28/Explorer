// The app registry: every app Explorer can show, live or coming soon.
// Locked content. A new app is a new entry here plus a folder in content/apps/.
// Used by content/index.js and the home screen app picker.

export const APPS = [
  {
    id: "foodzy",
    name: "Foodzy",
    kind: "Food delivery",
    status: "live",
    teaser: "Order biryani and watch your order travel through every layer."
  },
  {
    id: "mpay",
    name: "Mpay",
    kind: "UPI payments",
    status: "soon",
    teaser: "Pay a friend and follow the money all the way to their bank."
  },
  {
    id: "chitchat",
    name: "Chitchat",
    kind: "Chat",
    status: "soon",
    teaser: "Send a message and watch it reach your friend's phone."
  },
  {
    id: "tripz",
    name: "Tripz",
    kind: "Travel booking",
    status: "soon",
    teaser: "Book a bus seat and see why two people never get the same one."
  }
];
