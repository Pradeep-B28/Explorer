// Foodzy: a made-up food delivery app. Its name, user, fees, API routes and order settings.
// Locked content. Not linked to any real company.
// Used by content/index.js, js/engine/foodzy/ (through content.js) and the Server layer card.

export const APP = {
  id: "foodzy",
  name: "Foodzy",
  domain: "foodzy.example",
  tagline: "Food from your favourite Chennai kitchens",
  user: {
    firstName: "Priya",
    area: "Velachery",
    address: "Flat 4B, Lake View Apartments, Velachery, Chennai"
  },
  riderName: "Arun",
  offerBanner: "Free delivery on orders above {freeAbove}",
  categories: ["Biryani", "South Indian", "Coffee", "Chettinad", "Grills", "Desserts"],
  fees: {
    delivery: 39,
    freeDeliveryAbove: 499,
    platform: 5,
    gstPercent: 5
  },
  orders: {
    prefix: "FZ",
    start: 52000
  },
  payment: "UPI",
  // The routes the Server card lists. Server steps name one by id.
  api: [
    { id: "search", method: "GET", path: "/api/restaurants" },
    { id: "orders", method: "POST", path: "/api/orders" },
    { id: "location", method: "POST", path: "/api/riders/location" },
    { id: "updates", method: "WS", path: "order:update" }
  ],
  demoCart: [
    { itemId: "r1i1", qty: 1 },
    { itemId: "r1i5", qty: 1 }
  ],
  seedOrders: [
    { id: "FZ-51999", shop: "Kolam Creamery", total: 218, status: "DELIVERED" },
    { id: "FZ-52000", shop: "Anna Nagar Tiffin House", total: 305, status: "DELIVERED" }
  ]
};
