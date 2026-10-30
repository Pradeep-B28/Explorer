// Foodzy: a made-up food delivery app. Its name, user, fees and order settings.
// Locked content. Not linked to any real company.
// Used by content/index.js, js/engine/Foodzy/cart.js and orders.js (through content.js).

export const APP = {
  id: "Foodzy",
  name: "Foodzy",
  domain: "Foodzy.example",
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
    prefix: "TH",
    start: 52000
  },
  payment: "UPI",
  demoCart: [
    { itemId: "r1i1", qty: 1 },
    { itemId: "r1i5", qty: 1 }
  ],
  seedOrders: [
    { id: "TH-51999", shop: "Kolam Creamery", total: 218, status: "DELIVERED" },
    { id: "TH-52000", shop: "Anna Nagar Tiffin House", total: 305, status: "DELIVERED" }
  ]
};
