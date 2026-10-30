// Foodzy's 6 made-up Chennai restaurants and their menus. Prices in rupees.
// Locked content. Images are optional files in assets/food/ (see SCHEMA.md).
// Used by content/index.js, js/engine/Foodzy/cart.js and search.js.

export const RESTAURANTS = [
  {
    id: "r1",
    name: "Marina Biryani Co.",
    cuisine: "Biryani, North Indian",
    area: "Triplicane",
    rating: 4.4,
    etaMin: 32,
    priceForTwo: 450,
    pureVeg: false,
    image: "marina-biryani.jpg",
    menu: [
      { id: "r1i1", name: "Chicken Dum Biryani", price: 289, veg: false, bestseller: true, desc: "Seeraga samba rice slow cooked with chicken and whole spices." },
      { id: "r1i2", name: "Mutton Biryani", price: 389, veg: false, bestseller: false, desc: "Tender mutton pieces layered with fragrant rice." },
      { id: "r1i3", name: "Veg Biryani", price: 219, veg: true, bestseller: false, desc: "Garden vegetables and rice cooked on dum." },
      { id: "r1i4", name: "Chicken 65", price: 199, veg: false, bestseller: true, desc: "Crisp, spicy fried chicken with curry leaves." },
      { id: "r1i5", name: "Onion Raita", price: 39, veg: true, bestseller: false, desc: "Cool curd with onion, the classic side." },
      { id: "r1i6", name: "Bread Halwa", price: 89, veg: true, bestseller: false, desc: "Sweet, rich and soaked in ghee." }
    ]
  },
  {
    id: "r2",
    name: "Anna Nagar Tiffin House",
    cuisine: "South Indian, Tiffin",
    area: "Anna Nagar",
    rating: 4.6,
    etaMin: 24,
    priceForTwo: 250,
    pureVeg: true,
    image: "anna-nagar-tiffin.jpg",
    menu: [
      { id: "r2i1", name: "Ghee Roast Dosa", price: 129, veg: true, bestseller: true, desc: "Thin, crisp and roasted in ghee." },
      { id: "r2i2", name: "Mini Idli Sambar", price: 99, veg: true, bestseller: false, desc: "Fourteen mini idlis soaked in hot sambar." },
      { id: "r2i3", name: "Pongal Vada", price: 119, veg: true, bestseller: true, desc: "Pepper pongal with one crisp medu vada." },
      { id: "r2i4", name: "Rava Kesari", price: 69, veg: true, bestseller: false, desc: "Soft semolina sweet with cashews." },
      { id: "r2i5", name: "Filter Coffee", price: 45, veg: true, bestseller: false, desc: "Strong decoction with frothy milk." }
    ]
  },
  {
    id: "r3",
    name: "Filter Kaapi Stop",
    cuisine: "Coffee, Snacks",
    area: "Mylapore",
    rating: 4.5,
    etaMin: 18,
    priceForTwo: 150,
    pureVeg: true,
    image: "filter-kaapi-stop.jpg",
    menu: [
      { id: "r3i1", name: "Filter Kaapi", price: 49, veg: true, bestseller: true, desc: "Served in a davara tumbler." },
      { id: "r3i2", name: "Masala Vada", price: 59, veg: true, bestseller: false, desc: "Crunchy chana dal fritters, four pieces." },
      { id: "r3i3", name: "Onion Bajji", price: 79, veg: true, bestseller: false, desc: "Onion rings in spiced gram flour batter." },
      { id: "r3i4", name: "Sukku Coffee", price: 59, veg: true, bestseller: false, desc: "Dry ginger and palm jaggery, no milk." },
      { id: "r3i5", name: "Elaneer Payasam", price: 99, veg: true, bestseller: true, desc: "Chilled tender coconut kheer." }
    ]
  },
  {
    id: "r4",
    name: "Pepper Lane Chettinad",
    cuisine: "Chettinad, South Indian",
    area: "Adyar",
    rating: 4.3,
    etaMin: 30,
    priceForTwo: 500,
    pureVeg: false,
    image: "pepper-lane.jpg",
    menu: [
      { id: "r4i1", name: "Pepper Chicken", price: 279, veg: false, bestseller: true, desc: "Dry roasted with black pepper and shallots." },
      { id: "r4i2", name: "Mutton Chukka", price: 349, veg: false, bestseller: false, desc: "Mutton tossed in Chettinad spices." },
      { id: "r4i3", name: "Kothu Parotta", price: 179, veg: false, bestseller: true, desc: "Shredded parotta with egg and salna." },
      { id: "r4i4", name: "Nattu Kozhi Rasam", price: 129, veg: false, bestseller: false, desc: "Country chicken soup with pepper." },
      { id: "r4i5", name: "Parotta, 2 pieces", price: 59, veg: true, bestseller: false, desc: "Flaky layered flatbread." }
    ]
  },
  {
    id: "r5",
    name: "Beach Road Grills",
    cuisine: "Arabian, Grills",
    area: "Besant Nagar",
    rating: 4.2,
    etaMin: 35,
    priceForTwo: 550,
    pureVeg: false,
    image: "beach-road-grills.jpg",
    menu: [
      { id: "r5i1", name: "Chicken Shawarma Roll", price: 149, veg: false, bestseller: true, desc: "Juicy chicken, garlic sauce and pickles." },
      { id: "r5i2", name: "Grilled Chicken Half", price: 329, veg: false, bestseller: false, desc: "Charcoal grilled with mayo and kubboos." },
      { id: "r5i3", name: "Falafel Wrap", price: 139, veg: true, bestseller: false, desc: "Crisp falafel with tahini and salad." },
      { id: "r5i4", name: "Hummus with Pita", price: 159, veg: true, bestseller: false, desc: "Smooth chickpea dip with warm pita." },
      { id: "r5i5", name: "Mint Lime Soda", price: 69, veg: true, bestseller: false, desc: "Fresh lime, mint and soda." }
    ]
  },
  {
    id: "r6",
    name: "Kolam Creamery",
    cuisine: "Desserts, Ice Cream",
    area: "T. Nagar",
    rating: 4.7,
    etaMin: 20,
    priceForTwo: 300,
    pureVeg: true,
    image: "kolam-creamery.jpg",
    menu: [
      { id: "r6i1", name: "Jigarthanda", price: 119, veg: true, bestseller: true, desc: "Milk, almond gum and ice cream, Madurai style." },
      { id: "r6i2", name: "Tender Coconut Ice Cream", price: 99, veg: true, bestseller: true, desc: "Real coconut pieces in every scoop." },
      { id: "r6i3", name: "Gulab Jamun, 2 pieces", price: 79, veg: true, bestseller: false, desc: "Warm and soaked in rose syrup." },
      { id: "r6i4", name: "Brownie Sundae", price: 169, veg: true, bestseller: false, desc: "Warm brownie, vanilla scoop and fudge." },
      { id: "r6i5", name: "Badam Milk", price: 89, veg: true, bestseller: false, desc: "Chilled almond milk with saffron." }
    ]
  }
];
