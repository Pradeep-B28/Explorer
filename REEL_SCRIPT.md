# Reel Recording Scripts (Demo Mode)

This document provides three complete scripts for recording video reels using Explorer's built-in Demo Mode (`?demo=1`).

Disclaimer: Foodzy, MPay, ChitChat, and Tripz are made-up apps for learning. They are not linked to any real company.

---

## Script 1: Vertical Reel (30 Seconds)

- **Target Duration**: 30 seconds
- **Format**: 1080 x 1920 (9:16 vertical)
- **URL**: `http://localhost:3000/?demo=1&flow=order&speed=2`

### Timeline & Shot List

| Timestamp | Visual Event | On-Screen Caption | Voiceover (Optional) |
|---|---|---|---|
| **0.0s - 2.0s** | Flat Foodzy cart screen (total ₹388). "Show me how it works" button presses. | **HOOK**: You tapped Place order. Here's everything that happened next. | You tapped Place order. Here is everything that happens next. |
| **2.0s - 3.5s** | Phone splits into 5 layers tilting 45 degrees in 3D. Luminous central beam appears. | 5 layers inside every app you use. | Your phone splits open into 5 hidden layers. |
| **3.5s - 5.5s** | Step 1 and 2: Button tap ring pulses. Packet moves up to Logic layer. | Layer 3 (Logic): JavaScript validates your cart. | First, JavaScript listens for your tap and checks your cart. |
| **5.5s - 9.5s** | Step 3 and 4: Packet travels down beam to Server layer. Terminal log displays `POST /api/orders`. | Layer 4 (Server): Node.js API checks rules and auth. | An HTTPS request shoots over the network to the Node.js API. |
| **9.5s - 13.5s** | Step 5: Packet reaches bottom layer. New row `TH-52001` flashes green in orders table. | Layer 5 (Database): Postgres permanently saves row TH-52001. | The database permanently writes your order into Postgres. |
| **13.5s - 17.5s** | Step 6 to 8: Packet travels back up to Screen. Confirmation screen shows order placed. | Layer 1 (Screen): Confirmation rendered with 32 min ETA. | The API confirms, and your screen updates with an ETA. |
| **17.5s - 21.0s** | Step 9: Delivery tracking opens with live delivery rider route on map. | Live delivery tracking starts. | Delivery tracking goes live on the map. |
| **21.0s - 24.0s** | Lesson card displays in side panel. | An order is a synchronized round-trip across all 5 layers. | An order is not just a UI click. It is a full round-trip. |
| **24.0s - 30.0s** | Full stack course CTA card slides up. Wrench Wise logo visible. | **CLOSING**: Learn to build all 5 layers at Wrench Wise. | Learn to build every layer of an app from scratch with Wrench Wise. |

---

## Script 2: Horizontal Video (60 Seconds)

- **Target Duration**: 60 seconds
- **Format**: 1920 x 1080 (16:9 landscape)
- **URL**: `http://localhost:3000/?demo=1&flow=search,order&theme=dark`

### Timeline & Shot List

| Timestamp | Visual Event | On-Screen Caption | Voiceover (Optional) |
|---|---|---|---|
| **0.0s - 2.5s** | Wide view of Foodzy app in dark theme. Smooth split into 3D exploded stack. | **HOOK**: Every app you use has 5 hidden layers. Watch a biryani order go through all of them. | Every app you use has 5 hidden layers. Watch a biryani order travel through all of them. |
| **2.5s - 6.0s** | Overview of all 5 layers with counter-rotated chips: Screen, Styling, Logic, Server, Database. | Screen (HTML), Styling (CSS), Logic (JS), Server (Node.js), Database (Postgres). | From HTML and CSS on your screen, to Node.js and Postgres on the backend. |
| **6.0s - 16.0s** | Flow 1: Search for biryani. Debounce timer pauses before sending request. | Search debounces keystrokes before querying the database. | Watch the search: JavaScript waits for typing to pause so it does not spam the database. |
| **16.0s - 24.0s** | Restaurant results appear. Tapping restaurant opens menu. | Results render live. Adding dish updates client state. | Results return and the menu displays instantly. |
| **24.0s - 36.0s** | Flow 2: Cart checkout. Tapping "Place order" sends packet descending through the beam. | Tapping Place order triggers an HTTPS POST request. | Now watch the order: your tap sends a data packet down through the central beam. |
| **36.0s - 46.0s** | Server verifies auth. Database table inserts row TH-52001 with total ₹388. | Database records order TH-52001 permanently. | The server validates security rules, and Postgres records the order permanently. |
| **46.0s - 54.0s** | Packet climbs back up. Confirmation screen updates and rider route starts on map. | Success response returns to frontend state. | A success response travels back up, and your delivery rider appears on the map. |
| **54.0s - 60.0s** | Panel shows full stack CTA card and program overview. | **CLOSING**: Build full stack apps like this with Wrench Wise. | This is what full stack developers build. Learn to build apps like this with Wrench Wise. |

---

## Script 3: Comment Bait Reel (15 Seconds)

- **Target Duration**: 15 seconds
- **Format**: 1080 x 1920 (9:16 vertical)
- **URL**: `http://localhost:3000/?demo=1&flow=order&theme=dark`

### Timeline & Shot List

| Timestamp | Visual Event | On-Screen Caption | Voiceover (Optional) |
|---|---|---|---|
| **0.0s - 2.0s** | Phone explodes into 5 layers. Video freezes during the 3D intro pulse. | **HOOK**: Which layer saves your order? Comment 1 to 5. | Quick quiz: which layer actually saves your food order? |
| **2.0s - 6.0s** | Camera zooms across the 5 layer chips: 1. Screen, 2. Styling, 3. Logic, 4. Server, 5. Database. | 1. Screen (HTML) / 2. Styling (CSS) / 3. Logic (JS) / 4. Server (Node) / 5. Database (Postgres) | 1: Screen, 2: Styling, 3: Logic, 4: Server, or 5: Database? |
| **6.0s - 10.0s** | Video unfreezes: packet travels down to Layer 5. Green row TH-52001 inserts into Postgres table. | Answer: Layer 5 (Database)! It stores rows permanently. | It is Layer 5, the Database! It saves orders as permanent rows in Postgres. |
| **10.0s - 15.0s** | Final CTA card slide-up with Wrench Wise logo. | **CLOSING**: Master all 5 layers with Wrench Wise. | Master all 5 layers in the Certification Program in AI-Powered Full Stack Development at Wrench Wise. |

---

## Recording Guidelines

1. **Resolution**:
   - Vertical: 1080 x 1920 (use Chrome DevTools mobile emulation with Pixel 7 or iPhone 14 Pro max settings).
   - Landscape: 1920 x 1080 (full desktop window).
2. **Deterministic repeatability**:
   - Order ID is always `TH-52001`.
   - Time stamps always start at `[10:42:05]`.
   - Initial cart is always the demo cart (`₹388`).
3. **No telemetry**:
   - Analytics are disabled automatically in demo mode (`?demo=1`).
