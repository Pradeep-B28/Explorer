# Reel Recording Script (Demo Mode)

This document provides the exact timeline, scene descriptions, and voiceover cues for recording short-form reels and demos using Explorer's built-in Demo Mode (`?demo=1`).

## 1. URL Configuration for Reels

| Reel Concept | Recommended URL | Resolution / Ratio |
|---|---|---|
| **Full Flow: Place an Order** | `http://localhost:3000/?demo=1&flow=order&theme=dark&speed=1` | 1080 x 1920 (9:16 Portrait) or 1920 x 1080 (16:9) |
| **All 4 Flows Walkthrough** | `http://localhost:3000/?demo=1&flow=all&theme=dark&speed=1` | 1920 x 1080 (16:9 Landscape) |
| **Quick Reel (2x Speed)** | `http://localhost:3000/?demo=1&flow=order&theme=dark&speed=2` | 1080 x 1920 (9:16 Vertical) |
| **Light Theme Featurette** | `http://localhost:3000/?demo=1&flow=order&theme=light&speed=1` | 1080 x 1920 (9:16 Vertical) |

---

## 2. Order Flow Timeline (`flow=order`, Speed 1x)

Deterministic seeds:
- **Order ID**: `TH-52001`
- **Starting Screen**: Foodzy Cart with Demo Cart (`₹388` total)
- **Log Starting Timestamp**: `[10:42:05]`
- **Wrench Wise Logo**: Pinned to top-left corner

| Time (Seconds) | Visual Event | What Happens On Screen | Suggested Voiceover / Caption |
|---|---|---|---|
| **0.0s – 1.5s** | Flat App Preview | Phone is shown flat on the Foodzy cart screen with items r1i1 & r1i5, total ₹388. | *"Ever wonder what actually happens when you tap 'Place Order'?"* |
| **1.5s – 1.7s** | Explode Button Press | "Show me how it works" button receives a visible press animation. | *"Let's crack open the phone..."* |
| **1.7s – 2.6s** | 3D Exploded Split | Phone splits into 5 layers tilting 45° in 3D: Screen, Styling, Logic, Server, Database. | *"...and see the 5 hidden layers every full stack developer builds."* |
| **2.6s – 3.2s** | Layer Intro Pulse | The 5 counter-rotated layer chips pulse sequentially along the luminous central beam. | *"From front-end HTML and CSS to back-end Node and Postgres."* |
| **3.2s – 4.0s** | Step 1: User Tap | "Do it for me" triggers. Screen layer shows button press ring on 'Place order'. | *"Step 1: Your tap triggers a UI event."* |
| **4.0s – 5.8s** | Step 2: Logic Validation | Packet travels to JavaScript layer. Client verifies cart items and calculates bill. | *"Step 2: Client JavaScript validates the cart."* |
| **5.8s – 8.2s** | Step 3: API Request | Packet traverses the beam to the Server layer. `POST /api/orders` appears in request log. | *"Step 3: An HTTPS request shoots over the network to the server API."* |
| **8.2s – 10.6s** | Step 4: Server Auth & Check | Server verifies authentication token and stock levels. | *"Step 4: The server validates rules and security."* |
| **10.6s – 13.0s** | Step 5: Database Insert | Packet descends to Database layer. New row `TH-52001` inserts with green highlight. | *"Step 5: The database permanently records the order row in Postgres."* |
| **13.0s – 15.4s** | Step 6: 201 Response | Server receives DB confirmation and crafts HTTP 201 Created JSON response. | *"Step 6: The API formats the response payload."* |
| **15.4s – 17.8s** | Step 7: State Update | Packet returns up to Logic layer. State machine commits and clears active cart. | *"Step 7: Frontend state updates with order details."* |
| **17.8s – 20.2s** | Step 8: DOM Render | Screen re-renders to the "Order Placed" confirmation screen with ETA 32 mins. | *"Step 8: HTML updates dynamically on your screen."* |
| **20.2s – 21.0s** | Step 9: Delivery Tracking | Order status transitions to tracking with live delivery rider route. | *"Step 9: Your food is cooking and tracking goes live!"* |
| **21.0s – 23.0s** | Lesson Card | Panel displays key takeaway: *"An order is not just a UI click—it's a synchronized round-trip across 5 layers."* | *"That's what full stack engineering really is."* |
| **23.0s+** | CTA Slide-Up | Course CTA card slides up: Certification Program in AI-Powered Full Stack Development. | *"Build apps like this from scratch at Wrench Wise."* |

---

## 3. Repeatability Checklist

1. Every run with `?demo=1&flow=order&theme=dark&speed=1` begins in the exact same cart state.
2. Order ID generated is always `TH-52001`.
3. Server log timestamps start strictly at `10:42:05`.
4. No network analytics or telemetry are loaded.
5. Storage is not modified (`localStorage` / `sessionStorage` remain clean).
