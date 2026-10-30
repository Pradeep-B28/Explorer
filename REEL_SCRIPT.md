# Reel Recording Scripts (Demo Mode)

This document provides three complete scripts for recording video reels using Explorer's built-in Demo Mode (`?demo=1`).

> **Disclaimer**: Foodzy, Mpay, Chitchat, and Tripz are made-up apps for learning. They are not linked to any real company.

---

## Script 1: Vertical Reel (30 Seconds) — Phone View

- **Target Duration**: 30 seconds
- **Format**: 1080 x 1920 (9:16 vertical, using mobile emulation)
- **Layout**: **Phone View** (sticky map strip + active Big Card)
- **URL**: `http://localhost:3000/?demo=1&flow=order&theme=dark&speed=2`

### Timeline & Shot List

| Timestamp | Visual Event | On-Screen Caption | Voiceover (Optional) |
|---|---|---|---|
| **0.0s - 2.0s** | Virtual phone on cart screen (total ₹388). "Show me how it works" button visibly presses. | **HOOK**: You tapped Place order. Here's everything that happened next. | You tapped Place order. Here is everything that happens next. |
| **2.0s - 3.5s** | Phone shrinks into the Screen tile as 4 other tiles slide out horizontally into the sticky 96px map strip. | 5 layers inside every app you use. | Your phone splits open into 5 full stack layers. |
| **3.5s - 6.5s** | Glowing packet dot moves along the bus to Logic. Big Card slides in showing the JavaScript state pipeline and client validation. | Layer 3 (Logic): JavaScript validates cart and calculates totals. | First, JavaScript validates your cart and calculates totals. |
| **6.5s - 10.5s** | Packet crosses the Internet Gap (cloud icon) to Server. Big Card updates with real-time Node.js API logs (`POST /api/orders`). | Layer 4 (Server): Node.js API checks rules and pricing. | The request crosses the internet to the server to check security and prices. |
| **10.5s - 14.5s** | Packet reaches Database. Big Card displays Postgres table inserting row `FZ-52001` with total ₹388. | Layer 5 (Database): Postgres permanently saves order FZ-52001. | The database executes a transaction and permanently records order FZ-52001. |
| **14.5s - 19.5s** | Packet travels back across the bus to Screen. Confirmation screen renders with 32 min ETA, then switches to live delivery route map. | Layer 1 (Screen): Confirmation and live rider route. | The server confirms, your order is placed, and live rider tracking begins. |
| **19.5s - 24.0s** | Flow end cards slide up: Lesson card ("An order is a synchronized round-trip across all 5 layers"). | An order is a synchronized round-trip across all 5 layers. | An order is not just a UI click. It is a full round-trip across 5 layers. |
| **24.0s - 30.0s** | Full stack course CTA card with WhatsApp button. Wrench Wise logo visible. | **CLOSING**: Learn to build all 5 layers at Wrench Wise. | Learn to build every layer of an app from scratch with Wrench Wise. |

---

## Script 2: Horizontal Video (60 Seconds) — Laptop Split View

- **Target Duration**: 60 seconds
- **Format**: 1920 x 1080 (16:9 landscape desktop)
- **Layout**: **Laptop View** (5 cards side by side, group brackets, bus, dock)
- **URL**: `http://localhost:3000/?demo=1&flow=search,order&theme=dark`

### Timeline & Shot List

| Timestamp | Visual Event | On-Screen Caption | Voiceover (Optional) |
|---|---|---|---|
| **0.0s - 3.0s** | Wide view of Foodzy in dark theme. Smooth FLIP split opens into 5 side-by-side cards. | **HOOK**: Every app has 5 layers. Watch a biryani order travel through all of them. | Every app you use has 5 layers. Watch an order travel through all of them side by side. |
| **3.0s - 7.0s** | Camera sweeps across group brackets: Frontend (Screen, Styling, Logic) and Backend (Server, Database) separated by the Internet Gap. | Frontend (on your phone) + Backend (on the server). | Frontend on your phone, backend on the server, connected across the internet. |
| **7.0s - 17.0s** | Flow 1: Search for biryani. Packet moves between Screen and Logic as debounce timer waits for typing to pause. | Search debounces keystrokes to prevent database overload. | Watch the search: JavaScript debounces keystrokes so typing does not spam the database. |
| **17.0s - 26.0s** | Restaurant cards update live. Menus open and dish is added to cart (`1 item, ₹289`). | Adding items updates local client state instantly. | Adding an item updates state right on your device without waiting for the server. |
| **26.0s - 38.0s** | Flow 2: Checkout. "Place order" sends glowing packet along the bus from Screen through Logic, jumping the Internet Gap to Server. | Tapping Place order triggers an HTTPS POST request. | When you place an order, a data packet crosses the internet to the backend API. |
| **38.0s - 48.0s** | Server verifies auth and menu pricing. Database table inserts row `FZ-52001` with total ₹388. | Database executes atomic SQL transaction. | The server validates the prices, and Postgres records order FZ-52001 in a database transaction. |
| **48.0s - 54.0s** | Packet returns to Screen. Order placed screen renders and live delivery rider navigates the vector map. | Response confirms order and tracking starts. | Confirmation returns to your phone, and your delivery rider appears live on the map. |
| **54.0s - 60.0s** | Dock reveals lesson, "See the full stack code" sheet, and program CTA. | **CLOSING**: Build full stack apps like this with Wrench Wise. | This is what full stack developers build. Learn to build apps like this with Wrench Wise. |

---

## Script 3: Comment Bait Reel (15 Seconds) — Phone View

- **Target Duration**: 15 seconds
- **Format**: 1080 x 1920 (9:16 vertical)
- **Layout**: **Phone View**
- **URL**: `http://localhost:3000/?demo=1&flow=order&theme=dark`

### Timeline & Shot List

| Timestamp | Visual Event | On-Screen Caption | Voiceover (Optional) |
|---|---|---|---|
| **0.0s - 2.5s** | Phone splits into the 5 layer tiles in the map strip. Video freezes with question prompt. | **HOOK**: Which layer actually saves your food order? Comment 1 to 5. | Quick quiz: which layer actually saves your food order? |
| **2.5s - 6.5s** | Highlight sweeps across tiles: 1. Screen, 2. Styling, 3. Logic, 4. Server, 5. Database. | 1. Screen / 2. Styling / 3. Logic / 4. Server / 5. Database | 1: Screen, 2: Styling, 3: Logic, 4: Server, or 5: Database? |
| **6.5s - 10.5s** | Video unfreezes: packet travels to Layer 5. Big Card reveals Postgres table inserting row `FZ-52001`. | Answer: Layer 5 (Database)! It stores orders permanently on disk. | It is Layer 5, the Database! It permanently writes order FZ-52001 to disk. |
| **10.5s - 15.0s** | Final CTA card slide-up with Wrench Wise logo and certification link. | **CLOSING**: Master all 5 layers with Wrench Wise. | Master all 5 layers in the Certification Program in AI-Powered Full Stack Development at Wrench Wise. |

---

## Recording Guidelines

1. **Resolution Settings**:
   - **Vertical**: 1080 x 1920 (simulate mobile viewport 390 x 844 at 2.77x device scale or use Pixel 7 emulation in Chrome DevTools).
   - **Horizontal**: 1920 x 1080 (standard desktop browser window).
2. **Deterministic Behavior**:
   - Order ID is always sequential: `FZ-52001`.
   - Initial demo cart contains 2 items totaling `₹328` (grand total `₹388`).
   - Timestamps and animations execute identically on every run.
3. **Telemetry & Privacy**:
   - External analytics scripts (GA4 and Meta Pixel) are automatically disabled in demo mode (`?demo=1`).
