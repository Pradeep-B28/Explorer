# Student Explainer: How Full Stack Apps Work

Welcome to Explorer. This guide breaks down what is happening behind the scenes inside modern web and mobile applications.

---

## 1. Frontend vs. Backend: The Great Divide

Every full stack web application is split into two halves:

### The Frontend (Runs on Your Device)
- **Where it lives**: Right inside your web browser or mobile phone app.
- **What it includes**:
  - **Layer 1: Screen (HTML)** — The visible structure: buttons, input fields, cards, and images.
  - **Layer 2: Styling (CSS)** — The aesthetics: colors, padding, typography, animations, and responsive grids.
  - **Layer 3: Logic (JavaScript)** — The client responsiveness: event listeners, quantity counters, search debouncing, and local state.
- **Key trait**: Runs instantly without waiting for a server. Anyone can inspect or modify frontend code in their browser's Developer Tools.

### The Backend (Runs on a Remote Server)
- **Where it lives**: Secure computers (servers) in remote data centers.
- **What it includes**:
  - **Layer 4: Server (Node.js API)** — The gatekeeper: authenticating users, checking business rules, verifying catalog pricing, and handling incoming HTTPS requests.
  - **Layer 5: Database (PostgreSQL)** — The vault: relational tables permanently storing accounts, menus, and orders on persistent disks.
- **Key trait**: Protected and untrusted by outsiders. Holds the true source of business rules and permanent data.

---

## 2. The Internet Gap

In Explorer, notice the physical gap with the cloud icon between **Layer 3 (Logic)** and **Layer 4 (Server)**. This is the **Internet Gap**.

When you tap "Place order" on your phone:
1. Your phone converts the request into binary packets.
2. The packet travels over radio waves (Wi-Fi or 5G cellular) to a cell tower.
3. It speeds through fiber-optic cables and internet routers across hundreds or thousands of miles.
4. It arrives at the server data center.

Because packets take time to travel (latency) and connections can drop, great full stack developers design apps to:
- Handle temporary offline states gracefully.
- Update local UI immediately for simple actions (like adding an item).
- Show clear loading spinners while waiting for remote confirmation.

---

## 3. Why the Server Never Trusts a Price

One of the most important security rules in web development is: **Never trust the client.**

Because frontend JavaScript runs directly on the user's phone or computer, a malicious user could open Chrome DevTools, edit the memory, and change the price of a ₹289 Biryani to ₹1 before tapping "Place order".

If the backend server accepted the client's submitted price:
```javascript
// BAD BACKEND CODE (Vulnerable to fraud)
app.post("/api/orders", (req, res) => {
  const { items, totalPrice } = req.body;
  chargeUser(totalPrice); // Attacker charged only ₹1!
});
```

Instead, real production servers completely ignore prices sent by the frontend:
```javascript
// SECURE BACKEND CODE (What real servers do)
app.post("/api/orders", async (req, res) => {
  const { items } = req.body; // e.g. [{ id: "r1i1", quantity: 1 }]
  
  // 1. Fetch real, immutable prices from the database
  const catalogItem = await db.query("SELECT price FROM dishes WHERE id = $1", [items[0].id]);
  
  // 2. Calculate the true price on the server
  const trueTotal = catalogItem.price * items[0].quantity + DELIVERY_FEE + TAX;
  
  // 3. Charge the true total (₹388)
  chargeUser(trueTotal);
});
```

---

## 4. What is a Database Transaction? (The Order Flow)

When you place an order, multiple related changes must happen in the database:
1. Deduct money from the customer's wallet or verify card payment.
2. Check if the restaurant kitchen is open and accept the order.
3. Insert a new row into the `orders` table (`FZ-52001`).
4. Decrement the inventory count of the ordered dish.

What if the server crashes halfway through—after taking your money, but before creating the order row? Your money would vanish!

To prevent this, databases use **ACID Transactions**:
```sql
BEGIN TRANSACTION;

-- Step 1: Insert order row
INSERT INTO orders (id, restaurant_id, total, status)
VALUES ('FZ-52001', 'r1', 388, 'PLACED');

-- Step 2: Clear user cart
DELETE FROM cart_items WHERE user_id = 'u123';

-- Step 3: Record payment receipt
INSERT INTO payments (order_id, amount, status)
VALUES ('FZ-52001', 388, 'SUCCESS');

COMMIT;
```

If any single command fails, the database automatically triggers a **ROLLBACK**, undoing every change in the transaction. Either the entire order succeeds, or no change happens at all.

---

## 5. How the Code Per Layer Fits Together (The File Paths)

In Explorer's dock, tap **"See the full stack code"** or open the layer code tabs. Notice how every snippet has a real file path in the project tree:

| Layer | File Path | What Lives Inside |
|---|---|---|
| **1. Screen** | `public/order.html` | The semantic HTML skeleton of the checkout and confirmation screens. |
| **2. Styling** | `public/styles/order.css` | The layout styles, brand colors, 14px card radiuses, and badge badges. |
| **3. Logic** | `public/js/checkout.js` | Client-side JavaScript: listening to taps, updating quantities, and initiating requests. |
| **4. Server** | `server/routes/orders.js` | Node.js / Express router: validating authentication, verifying item prices, and handling errors. |
| **5. Database** | `db/orders.sql` | PostgreSQL schema and transactional SQL queries storing the order on disk. |

All five files live in the same Git repository. As a full stack engineer, you write and maintain all five tiers together to create complete, working software products.

---

## 6. Student Extension Challenges

Try building these three real-world extensions:

### Challenge 1: Add a "Remove from Cart" Flow (Data-Only Task)
- Define a new journey in `content/apps/foodzy/journeys.js` with `id: "remove"`.
- Trace the steps: Screen tap on the minus button -> Logic layer decrements quantity -> Screen updates cart bar total.
- Run `node tools/verify-content.mjs` to test your data definition.

### Challenge 2: Build a "Break the Server" Switch (Error Handling Task)
- Simulate a network or server failure.
- When active, step 4 of the order flow returns an `HTTP 409 Conflict` or `HTTP 500 Internal Server Error`.
- Show how the error travels back up: Server returns error -> Logic layer catches exception -> Screen displays an error banner instead of the order confirmation.

### Challenge 3: Build a Real Search Server (Backend Node.js Project)
- Create a standalone Node.js script using Express:
  ```javascript
  import express from "express";
  import { RESTAURANTS } from "./content/apps/foodzy/restaurants.js";

  const app = express();
  app.get("/api/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase();
    const results = RESTAURANTS.filter(r => r.name.toLowerCase().includes(q));
    res.json(results);
  });
  app.listen(3001);
  ```
- Connect Foodzy's search input to fetch real results from `http://localhost:3001/api/search?q=biryani`.
