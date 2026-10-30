# Student Explainer: How Full Stack Apps Work

Welcome to Explorer. This guide breaks down what is happening behind the scenes inside modern web and mobile applications.

---

## 1. What Each Layer Does

Every full stack web application is composed of 5 distinct layers:

### Layer 1: Screen (HTML)
- **Role**: What you see and tap on your device.
- **Technology**: HTML DOM elements (buttons, images, forms, cards).
- **Foodzy Example**: The "ADD" button next to Chicken Dum Biryani, and the order tracking screen showing the delivery time.

### Layer 2: Styling (CSS)
- **Role**: How the application looks, feels, and moves.
- **Technology**: CSS properties, CSS variables, and layout systems (Flexbox, Grid).
- **Foodzy Example**: The emerald green brand color, the rounded 14px restaurant cards, the red non-veg food badge, and the smooth slide of the cart bar.

### Layer 3: Logic (JavaScript)
- **Role**: What happens immediately when you tap or type.
- **Technology**: Client-side JavaScript.
- **Foodzy Example**: When you tap "+", client-side JavaScript listens for the click event, updates the cart quantity from 1 to 2, calculates the new bill total, and instructs the screen to re-render.

### Layer 4: Server (Node.js API)
- **Role**: The gatekeeper and rule checker on the internet.
- **Technology**: Backend API runtime (e.g. Node.js with Express or Fastify).
- **Foodzy Example**: When placing an order, client-side JavaScript cannot be trusted alone. The server validates your authentication token, checks restaurant operating hours, and recalculates the final bill to prevent fraud before placing the order.

### Layer 5: Database (PostgreSQL)
- **Role**: Where data is permanently stored so it is never lost.
- **Technology**: Relational database (e.g. PostgreSQL, SQL tables).
- **Foodzy Example**: The orders table inserts a new row containing `order_id` (TH-52001), `restaurant_name`, `total` (₹388), and `status` ("PLACED"). Even if you close your browser or turn off your phone, your order remains safe.

---

## 2. The 4 Flow Lessons (Why They Matter in Real Production Apps)

### Flow 1: Add to Cart
- **Lesson**: Adding an item updates local client state immediately. The network is not called for every tap.
- **Why it matters**: If an app called a remote server on every single tap of "+" and "-", tapping would feel sluggish and drop off when cellular connections stutter. Keeping temporary cart state in local client memory makes user interfaces fast and responsive.

### Flow 2: Search Dishes
- **Lesson**: Search waits for typing to pause (debouncing) so the app does not send a request for every keystroke.
- **Why it matters**: If 100,000 users type "biryani" (7 letters) without debounce, the servers receive 700,000 search queries. Debouncing waits 300 ms after the user stops typing, reducing server traffic by up to 85%.

### Flow 3: Place an Order
- **Lesson**: An order is a synchronized round-trip across all 5 layers: from Screen click to Database insertion and back.
- **Why it matters**: An order cannot exist merely in frontend UI state. It must travel securely over HTTPS to the backend server, execute an ACID transaction in the database, and receive an HTTP 201 Created confirmation before showing the success screen.

### Flow 4: Track an Order
- **Lesson**: Delivery tracking reads live status from the database and animates location changes on the map.
- **Why it matters**: Live tracking transforms static database state into dynamic user experiences. Real apps poll APIs or receive WebSocket events from the driver's phone, updating the database and moving the rider marker smoothly along vector map coordinates.

---

## 3. How Explorer is Built (Honest Technical Architecture)

In this project, we prioritize transparency:

1. **Frontend only**: Explorer runs entirely in your web browser. There is no live remote Node.js server or cloud PostgreSQL database running in the background.
2. **Realistic simulation**:
   - The **Server layer** simulates a real Node.js and Express REST API, printing realistic HTTP headers, endpoints, and timestamps.
   - The **Database layer** simulates a PostgreSQL relational database with tables and rows, demonstrating queries (`SELECT`, `INSERT`, `UPDATE`).
3. **Real production code**: The code shown in the side panel is written exactly as real full stack engineers write it in production systems.

---

## 4. Student Extension Challenges

Try building these three real-world extensions:

### Challenge 1: Add a "Remove from Cart" Flow (Data-Only Task)
- Define a new journey in `content/apps/Foodzy/journeys.js` with `id: "remove"`.
- Trace the steps: Screen tap on the minus button -> Logic layer decrements quantity -> Screen updates cart bar total.
- Run `node tools/verify-content.mjs` to test your data definition.

### Challenge 2: Build a "Break the Server" Switch (Error Handling Task)
- Add a toggle in the UI that simulates server failure.
- When active, step 3 of the order flow returns an `HTTP 409 Conflict` or `HTTP 500 Internal Server Error`.
- Show how the error travels back up through the layers: Server returns error -> Logic layer catches exception -> Screen displays an error banner instead of the order confirmation.

### Challenge 3: Build a Real Search Server (Backend Node.js Project)
- Create a standalone Node.js script using Express:
  ```javascript
  import express from "express";
  import { RESTAURANTS } from "./content/apps/Foodzy/restaurants.js";

  const app = express();
  app.get("/api/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase();
    const results = RESTAURANTS.filter(r => r.name.toLowerCase().includes(q));
    res.json(results);
  });
  app.listen(3001);
  ```
- Connect Foodzy's search input to fetch real results from `http://localhost:3001/api/search?q=biryani`.
