# Explorer: Upgrade Brief (v2.0.0)

Read this whole file before you change anything. Then read `content/SCHEMA.md`. Every rule in `PROJECT_BRIEF.md` still applies. **Where this file says something different, this file wins.** Work in the phases in Section 16, and stop after each one with a Phase Report.

I am not from a tech background. Explain things in plain words.

---

## 1. Why we are upgrading

v1 works, but it does not show what it promises. From my screen recording:

1. **The layers sit on top of each other.** The Screen layer covers the other four, so you never see the Styling, Logic, Server or Database work.
2. **The packet is hard to see.** It looks like a thin line.
3. **The labels are tiny,** and the tilt makes all text hard to read.
4. **The stack overlaps the "Put it back together" button.**
5. **The cart bar and the flow disagree.** After adding Chicken Dum Biryani, the cart bar says ₹347 ("To pay") while the flow says ₹289. The cart bar must show the item total.
6. **The panel is cramped.** The code box scrolls sideways, the header buttons crowd each other, and half the screen is empty.
7. **The food looks fake.** Big letters instead of food photos.
8. **The home page is plain.**

**The big change:** when the app splits, the 5 layers sit **side by side**, each one fully visible and showing its own work, joined by a wire the packet travels along. The code moves to a wide dock under the row, with much more code per layer.

---

## 2. What v2 looks like

**Laptop** (the split view):

```
 Explorer                                                        [share] [theme]
 ---------------------------------------------------------------------------------
     Frontend: runs on your phone          Full stack means both     Backend: runs on a server
 +----------+ +-----------+ +-----------+   .  .  .  +-----------+ +-----------+
 |  SCREEN  | |  STYLING  | |   LOGIC   |   (cloud)  |  SERVER   | | DATABASE  |
 |  (live   | | wireframe | | Event     |  Internet  | routes    | | orders    |
 |   phone) | | swatches  | |  > State  |            | log lines | | table     |
 |          | | type      | |  > Render |            |           | |           |
 +----o-----+ +-----o-----+ +-----o-----+            +-----o-----+ +-----o-----+
 =====*============================[ request ]==============*==================== bus
 ---------------------------------------------------------------------------------
 | Step 3 of 9  SERVER      | server/routes/orders.js        js | What travels      |
 | The server checks        |  1 router.post("/api/orders", ...  | { "loggedIn": ... |
 | everything               |  2   const { shopId, items } = ... |                   |
 | The server checks you... |  ...                               | [Back][Pause][Next]|
 ---------------------------------------------------------------------------------
```

**Phone** (the map strip and one big card):

```
 +------------------------------------+
 | [Scr]-[Sty]-[Log] ~ [Srv]-[DB]      |  map strip, always visible
 | ==========*========================|  the packet moves here
 +------------------------------------+
 |  SERVER  Node.js API                |  the active layer, big
 |  POST /api/orders   (lit)           |
 |  10:42:07  POST /api/orders  checks |
 |  Step 3 of 9                        |
 |  The server checks everything       |
 |  [ code, wraps, line numbers ]      |
 +------------------------------------+
 | [Back]   [Pause]   [Next]   1x      |  controls, stuck to the bottom
 +------------------------------------+
```

---

## 3. Upgrade rules

1. **Branch.** Work on a new git branch called `upgrade-explorer`. Never push to `main` until I reply "Ship it".
2. **Locked folders.** Replace `content/`, `js/engine/` and `tools/` with the folders from my zip. Delete `content/apps/thattu/` and `js/engine/thattu/`. From now on, the locked-files rule covers them exactly as before.
3. **Old links keep working.** `#/app/thattu` redirects to `#/app/foodzy`. All `?demo=1` parameters stay the same.
4. **Storage keys stay** (`tea-theme`, `tea-progress`, `tea-intro-seen`), so returning visitors keep their theme and progress.
5. **No dead code.** The v1 3D stack (`ui/exploded.js` and its CSS) is removed once the split view replaces it.
6. **Everything in `PROJECT_BRIEF.md` Section 2 still applies,** including no libraries, no `innerHTML` with changing values, no long dashes, no emojis, and the banned words.

---

## 4. Renames and settings

| Before | After |
|---|---|
| The Exploded App | **Explorer** (page title, header, manifest, link preview, README) |
| Thattu | **Foodzy** |
| Kaasu | **Mpay** |
| Pesu | **Chitchat** |
| Payanam | **Tripz** |
| `js/apps/thattu/` | `js/apps/foodzy/` |
| copy keys `thattu.*` | `foodzy.*` |
| CSS tokens `--thattu*` | `--foodzy*` |
| `#/app/thattu` | `#/app/foodzy` (old link redirects) |
| Order numbers TH-52001 | FZ-52001 (comes from content) |

**config.js:** change only these values, and keep everything else:
- `version`: `"2.0.0"`
- `whatsAppText`: `"Hi, I tried Explorer and watched: {flows}. I want to know more about the {program}."` (the content check tests this)
- In `features`, add `tryItYourself: true` and `allCode: true`.

---

## 5. What changed in the locked files

**content/**
- Every name above is renamed. `CONTENT_VERSION` is `2.0.0`.
- Every dish now has `image` (always `<dish id>.jpg`).
- `app.api` lists the routes the Server card shows. Every Server step has a `route` (one of those ids).
- **Much more code.** Each step's code is now 3 to 14 lines (it was 1 to 5), and each has `code.file`, the made-up file it lives in, such as `server/routes/orders.js`. Server steps may use `lang: "http"` with the file `HTTP response`. `text` is gone.
- The Add to cart flow has a new value, `priceLabel`.

**js/engine/**
- The folder `thattu/` is now `foodzy/`.
- `values.js`: `journeyValues()` adds `priceLabel`. **New `cartBarLabel(cart, data, t)`.** The cart bar on screen must use it. That fixes the ₹347 bug, because the flow and the cart bar now use the same function.
- `journey.js`: `prepare()` now passes `code.file` and `route` through. **New `latestCodeByLayer(steps, layers, upto)`** returns the most recent step for each layer. The dock's code tabs and the full stack code sheet use it.
- **New `layout.js`:** `layoutFor(width, height)` returns `"laptop"` or `"phone"`. `rowGeometry(width, height)` returns every size in the split view. `flatPhoneScale()` returns the phone's scale when it is on its own. Call them on every resize. Never hard-code those sizes.

**tools/verify-content.mjs** checks all of the above, plus the layout numbers in Section 15.

**The app plug-in interface** (`PROJECT_BRIEF.md` Section 3, rule 4) changes in one place: `stateLine()` is replaced by `stateSnapshot()`, which returns a small plain object for the Logic card, for example `{ screen: "cart", cart: { shop: "r1", items: 2, itemTotal: 328 }, lastOrder: null }`. Keep it under 8 keys.

---

## 6. The split view on laptop

### 6A. Size and layout
- Use the laptop view when `layoutFor()` says `"laptop"`. Otherwise use the phone view (Section 9).
- From the top: the header (64px), the group labels row, the card row, the bus (the wire), then the dock. Every size comes from `rowGeometry()`: `rowHeight`, `phoneScale`, `screenWidth`, `cardWidth` and `dockHeight`. `compact` is true when the window is under 820px tall (common on 1366 x 768 laptops), and the labels row, the spacing and the dock get smaller.
- Card order, left to right: **Screen, Styling, Logic**, the internet gap (80px), **Server, Database**. Gaps between the other cards are 24px.
- The whole view fits the window without scrolling at 1366 x 768 and larger. Only when `rowHeight` is at its minimum (340) may the page scroll a little.

### 6B. Before the split (flat)
- The phone stands on its own, at `flatPhoneScale()`, a little left of centre. On its right, the intro panel: `panel.intro.*`, the 5 layers listed with their icons and `oneLine`, and the "Show me how it works" button.

### 6C. The split
When the visitor taps "Show me how it works":
1. The intro panel fades out (200 ms).
2. The phone shrinks and moves into the Screen card's place (700 ms, `--ease-out`).
3. The other 4 cards start exactly on top of the phone, then slide out sideways into their places, one after another (70 ms apart), growing to their full size. Build this with FLIP: lay the cards out in their final places, measure them, start each with a `transform` that puts it over the phone, then animate the `transform` to none.
4. The wire draws itself left to right (500 ms, `stroke-dashoffset`), then the group labels and the internet gap fade in.
5. The dock rises from the bottom (300 ms) with the flow list.
6. Intro: each card's header glows in turn, Screen to Database, 250 ms apart.

"Put it back together" plays this in reverse in 700 ms and closes any flow.

### 6D. Group labels and the internet gap
- Above Screen, Styling and Logic: a thin bracket with `stage.frontend`. Above Server and Database: a bracket with `stage.backend`. Between them, a small pill: `stage.fullstack`.
- In the internet gap: a dashed vertical line, a drawn cloud icon and `stage.internet`. When the packet crosses it, a small lock icon shows on the packet for that hop (traffic is encrypted).

### 6E. The bus and the packet
- **Ports.** Each card has a 10px port circle at the middle of its bottom edge, with a short stub down to the bus.
- **The bus** is one horizontal line 24px below the cards, drawn in SVG, `--beam` gradient at 40% opacity. The stretch the packet is on brightens to full.
- **The route.** The packet goes from the start card's port down to the bus, along the bus, then up into the end card's port. Split the engine's `travel` time 20% down, 60% along, 20% up. When `distance` is 0, the packet pulses in place at that port.
- **The packet itself** is a pill 30px tall, up to 160px wide: a glowing dot, a small icon for its label, and `packet.label` in monospace 12px. `--surface` fill, a border in the colour of the layer it is heading to, and an `--accent` glow. Easy to see in both themes.
- Hovering the packet (laptop) shows its data as a small JSON tooltip.
- On arrival, a ring pulses out of the port (400 ms) and the card lights up.

### 6F. The active card
- While a step plays, its card lifts 6px, gets a border in its layer colour and a soft glow in that colour at 35%. The other cards drop to 60% opacity. 300 ms transitions.
- When the active card is the Screen card, it also scales up to 1.15 (from its bottom centre) so the change is easier to see, and back when the step ends.

### 6G. Try it yourself (`features.tryItYourself`)
- Each flow card in the dock has "Try it yourself" next to "Do it for me".
- It dims the row, moves the phone from its card to the flat position at `flatPhoneScale()`, and shows a banner above it: `panel.yourTurn` with the flow's `tryThis`. "Cancel" or Escape puts it back.
- When the visitor does the action, the phone flies back into its card and the flow plays. The other cards never move.
- A visitor can still tap the small phone in its card. That works too.

### 6H. Reduced motion
No fly, slide or lift. The split and the assembly are 150 ms cross-fades. The packet fades from port to port. Code and log lines show at once.

---

## 7. The layer cards (what each one shows)

**Every card:** a header with the layer icon (drawn SVG, Section 14), name in 16px weight 800, tech chip and `oneLine` in 13px. A footer with `card.last` (the last step's title on this layer in this flow) and a "View code" link that opens this layer's tab in the dock. Card radius 16px, `--surface` fill, `--shadow-lg`. Nothing inside a card ever overflows it: text truncates with an ellipsis, lists show only what fits.

**Screen:** the live Foodzy phone at `phoneScale`, plus a small `card.live` chip.

**Styling:** a live wireframe of the current Foodzy screen (from `wireframeTargets()`, measured and scaled to the card), a row of 5 Foodzy colour swatches and a type sample ("Aa 20 / 15 / 13"). During a Styling step, the boxes flash in `--layer-styling` and a chip shows the step's first CSS selector (the first code line, up to the `{`). Redraw after every commit and screen change.

**Logic:** three nodes, Event, State and Render, joined by arrows. Below them, a State panel that shows `stateSnapshot()` as indented JSON. During a Logic step the nodes light up in order (150 ms apart), the snapshot updates, and keys that changed flash with `--fixed-soft` for 600 ms.

**Server:** a "Routes" list from `app.api`, each with a method chip (GET in `--layer-server`, POST in `--layer-screen`, WS in `--layer-styling`) and the path. During a Server step, its `route` lights up. Below it, the dark request log (code colours, monospace 11.5px) that starts with `foodzy.serverReady` and `foodzy.serverWaiting` and keeps the last 5 lines, each with a time stamp. Each Server step types in its `log` line.

**Database:** tabs `restaurants` and `orders`, and the table. `restaurants` lists every restaurant (id, name, rating). `orders` starts with `seedOrders` and keeps every order placed in the visit. During a Database step: switch to `db.table`, show an operation chip (SELECT, INSERT or UPDATE), then `select` highlights the matching row, `insert` slides the new row in with a `--fixed-soft` flash, and `update` flips the changed cells with a highlight.

---

## 8. The dock (laptop)

The dock sits under the row, full width, `dockHeight` tall, `--surface` fill with a top border. It has 3 modes.

### 8A. Flow list
- `panel.flowsTitle` and the 4 flows as cards in one row: title, `tryThis`, a "Watched" tick if done, and the buttons "Try it yourself" and "Do it for me".
- "Put it back together" on the far right.

### 8B. Playing
Three columns:
- **Left (280px): the step.** The progress bar (one segment per step in its layer colour), the layer chip, `panel.step`, the title in 18px weight 800, and the `say` line in 15px.
- **Middle (the rest): the code.**
  - Tabs, one per layer, with the layer dot. A tab is disabled (`panel.notReached`) until the flow reaches that layer. The active step's tab is selected by itself. When paused, the visitor can open any reached tab.
  - Each tab shows `latestCodeByLayer()` for that layer: the file path like an editor tab, the language chip, a "Copy code" button, then the code with line numbers.
  - The code types in at about 12 ms per character, never more than 900 ms per step. With reduced motion it shows at once.
  - Monospace 13px, line height 18px (12px and 16px when `compact`). **It never scrolls sideways on a laptop.** If a long snippet does not fit the height, the code area scrolls up and down.
- **Right (260px): what travels and the controls.** `panel.packet` and the packet data as indented JSON. Below it: Back, Play or Pause, Next, the speed buttons as one segmented control, Replay and Close. Icon buttons with text labels, 40px tall.

### 8C. Flow end
Three columns again:
- **Left:** `flow.end.title` and the lesson.
- **Middle:** the CTA: `cta.title`, `cta.body`, the WhatsApp button (or "See the program" when there is no number) and "See the program" as a text link.
- **Right:** `cta.progress` (or `cta.all`), "Try another flow", "See the full stack code" and "Share".

### 8D. The full stack code sheet (`features.allCode`)
"See the full stack code" opens a large sheet (90% of the window, 16px radius, with a scrim). Its title is `panel.allCodeTitle`. It shows the flow's steps grouped by layer, in stack order: the layer header, then for each step on that layer its file path, title and full code. A "Copy" button per block. Close with the button, the scrim or Escape. On phones it is a full-screen sheet.

---

## 9. Phone layout: the map strip and one big card

Used when `layoutFor()` says `"phone"`: phones, tablets and small windows. Reels are recorded in this layout.

**Before the split:** the phone fills the width at `flatPhoneScale()`, with the "Show me how it works" button below.

**The split:** the phone shrinks up into the Screen tile, and the other 4 tiles slide out of it sideways into the strip (500 ms, 60 ms apart). Then the big card fades in below.

**The map strip** (sticky under the header, about 96px tall):
- 5 tiles side by side, each with the layer icon and the short name. The first 3 sit on a faint `--layer-screen` tint (Frontend), the last 2 on a faint `--layer-database` tint (Backend), with a small cloud icon in the gap between them.
- A thin bus under the tiles. The packet is a 12px glowing dot on it, moving with the same timing as on laptop.
- The active tile gets a border in its layer colour. Tapping a tile shows that layer's big card. A `panel.follow` pill then appears, and the next step returns to following the packet.

**The big card** (below the strip):
- The active layer's card at full width: its header and its work (Section 7). The Screen card is the live phone at `flatPhoneScale()`, and taps work.
- Under the work: `panel.step`, the title, the `say` line, then the code with its file path. On phones the code **wraps** (`white-space: pre-wrap`) with line numbers kept and a hanging indent, so nothing scrolls sideways. Then the packet data, folded by default ("What travels", tap to open).
- When the packet reaches a new layer, the big card slides to it (300 ms), from the right if the packet moved right, from the left if it moved left.

**Controls** stick to the bottom: Back, Play or Pause, Next and the speed control, 48px tall buttons.

**Flow list:** before a flow, a bottom sheet `panel.flowsTitle` with the 4 flows. Its buttons are "Try it yourself" (closes the sheet and shows the hint on the phone) and "Do it for me". **Flow end:** the lesson and the CTA as full-width cards, then the progress, "Try another flow", "See the full stack code" and "Share".

---

## 10. Foodzy fixes

1. **The cart bar** shows `cartBarLabel()`, always the item total. Self-test check n proves it.
2. **Photos.** Plain, realistic food photos are enough. Generate them with Antigravity's image tool: 6 restaurant photos in `assets/food/shops/` and 31 dish photos in `assets/food/dishes/`, with the exact names and sizes in `assets/food/PHOTOS.txt`. One consistent style: natural light, top-down or 45 degrees, no text, no logos, no faces. If the image tool can't make them, use a free stock site whose licence allows commercial use, and list each source in `assets/food/SOURCES.txt`. Restaurant cards use the shop photo. Dish rows use the dish photo as the thumbnail, with ADD overlapping its bottom edge. The drawn fallback stays for any photo that fails to load. `loading="lazy"` and `decoding="async"` on every photo.
3. **Looks like a real app:** a subtle shadow on cards, 14px radius, a sticky header inside the phone, the rating chip in `--rating` with a white star, prices in bold, a thin divider between dishes, and a "Bestseller" ribbon in `--foodzy-soft` with `--foodzy-strong` text.

---

## 11. Home page

It must look like a proper product page. Sections, top to bottom:

1. **Hero.** Left: eyebrow chip `home.eyebrow`, title `home.title` in 48px weight 800 (32px on phones), `home.subtitle`, buttons "Explore Foodzy" (primary) and "How it works". Right: a drawn preview that loops. A small phone splits into 5 cards side by side, a packet runs along the wire and back, and it joins up again (an 8 second loop). On laptop it tilts up to 4 degrees with the pointer. Flat and simpler on phones.
2. **Facts strip:** `home.fact1` to `home.fact3`, each with a small drawn icon.
3. **How it works:** 3 cards with numbers and drawn icons: `home.step1.*`, `home.step2.*`, `home.step3.*`.
4. **Frontend plus backend:** `home.stackTitle`, then the 5 layers as a row (a 2-column grid on phones) with icon, name, tech and `oneLine`, grouped under the Frontend and Backend brackets like the split view. Then `home.stackBody`.
5. **Pick an app:** the 4 apps from `content/apps.js`. Each card has its drawn app icon (Section 14) on a tile in its app colour, name, kind, teaser, and either "Open" or a "Coming soon" chip. Hover lifts the live card. Coming soon cards are greyed and not clickable.
6. **Program band:** a full-width band with `--brand-grad` at 8% behind it: `home.bandTitle`, `home.bandBody`, and the WhatsApp and "See the program" buttons (`utm_content=home`).
7. **Footer.**

Sections fade up as they scroll into view (300 ms, 12px, once). Reduced motion: no movement.

---

## 12. Header and polish

- **Header:** 64px, `--surface` at 92% opacity with a bottom border (no `backdrop-filter`). Left: the Explorer wordmark (the word "Explorer" in weight 800 with a small drawn split-layers mark), and on the stage, "All apps" and the app name. Right: Share (icon and text on laptop, icon only on phones) and the theme button as a **40px icon button** (sun or moon) with `theme.toLight` or `theme.toDark` as its accessible label and tooltip. 8px between buttons. Nothing ever overlaps.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48 and 64px only.
- **Buttons:** 40px tall (48px on phones), 16px side padding, never squeezed. Secondary buttons have a 1px `--border`.
- **Toasts** sit above the dock or the phone controls, never under them.
- Test at 1920 x 1080, 1536 x 864, 1440 x 900, 1366 x 768, 1024 x 768, 390 x 844 and 360 x 740.

---

## 13. Words (copy.js)

Rename every `thattu.*` key to `foodzy.*`. Change these values and add these keys. Everything else stays as in `PROJECT_BRIEF.md` Section 8. The 4 engine keys (`cart.bar`, `cart.bar.one`, `search.count`, `search.count.one`) do not change.

| Key | Text |
|---|---|
| `site.title` | Explorer |
| `site.description` | Use a real-looking app, then split it into its 5 layers and watch every tap travel from your phone to the server and back. |
| `home.title` | See inside the apps you use every day. |
| `home.subtitle` | Use Foodzy, a real-looking food app. Then split it into its 5 layers and watch every tap travel from your phone to the server and back. |
| `home.open` | Explore Foodzy |
| `home.fact1` | 5 layers, side by side |
| `home.fact2` | Real code at every step |
| `home.fact3` | No sign-up needed |
| `home.stepsTitle` | How it works |
| `home.step1.title` | Use the app |
| `home.step1.body` | Search, add dishes and place an order in Foodzy, a made-up food app. |
| `home.step2.title` | Split it open |
| `home.step2.body` | One tap splits the app into its 5 layers, side by side. |
| `home.step3.title` | Watch it travel |
| `home.step3.body` | Follow every tap from your phone to the server and the database, with the code at each stop. |
| `home.stackTitle` | Frontend plus backend is full stack |
| `home.stackBody` | A full stack developer builds all five layers. |
| `home.bandTitle` | Want to build apps like these? |
| `home.bandBody` | In the {program}, you build every layer yourself. |
| `stage.frontend` | Frontend: runs on your phone |
| `stage.backend` | Backend: runs on a server |
| `stage.fullstack` | Full stack means both |
| `stage.internet` | Internet |
| `panel.intro.body` | Tap the button and this app splits into the 5 layers a full stack developer builds, side by side. |
| `panel.tryIt` | Try it yourself |
| `panel.yourTurn` | Your turn: {hint} |
| `panel.cancel` | Cancel |
| `panel.notReached` | Not reached yet |
| `panel.copy` | Copy code |
| `panel.copied` | Copied |
| `panel.allCode` | See the full stack code |
| `panel.allCodeTitle` | Every line of code in this flow |
| `panel.follow` | Follow the packet |
| `card.last` | Last: {title} |
| `card.live` | Live. You can tap it. |
| `card.viewCode` | View code |
| `share.text` | I watched a food order travel through all 5 layers of an app, side by side. Try it: |
| `footer.disclaimer` | Foodzy, Mpay, Chitchat and Tripz are made-up apps for learning. They are not linked to any real company. |
| `foodzy.serverReady` | api.foodzy.example ready on port 3000 |
| `foodzy.serverWaiting` | Waiting for requests |

---

## 14. Visual changes

All tokens in `PROJECT_BRIEF.md` Section 7 stay, except:
- Rename `--thattu`, `--thattu-strong` and `--thattu-soft` to `--foodzy`, `--foodzy-strong` and `--foodzy-soft` (same values).
- Remove the exploded view tokens (`--tilt-x`, `--tilt-z`, `--tilt-x-soft`, `--gap-z`).
- Add app colours for the home page icons:

| Token | Value |
|---|---|
| `--app-foodzy` | `#C2410C` |
| `--app-mpay` | `#0369A1` |
| `--app-chitchat` | `#BE185D` |
| `--app-tripz` | `#0F766E` |

**Drawn icons** (inline SVG, 24 x 24, 1.75px stroke, round caps, `currentColor`):
- Layers: Screen (a phone outline), Styling (a paint brush), Logic (curly braces), Server (two stacked server boxes with dots), Database (a cylinder).
- Apps: Foodzy (a bowl with steam), Mpay (a wallet with a rupee sign), Chitchat (two speech bubbles), Tripz (a bus front).
- Others: cloud, lock, copy, play, pause, back, next, replay, close, share, sun, moon.

---

## 15. Self-test (`?test=1`) changes

Checks a to m from `PROJECT_BRIEF.md` Section 10 stay, with these new values:

| Check | Expected now |
|---|---|
| **a. Content** | The live app is `foodzy`. 5 layers, 4 apps (1 live), 6 restaurants, 31 dishes, 4 journeys |
| **f. Numbers** | Order 1 is FZ-52001, order 12 is FZ-52012 (money and tracking unchanged) |
| **g. Journey values** | The add flow's values now include `priceLabel: "₹289"` |
| **i. Step text** | Order step 9: `Order FZ-52001 is placed. Marina Biryani Co. is cooking, and it should reach you in about 32 minutes.` Order step 5 database row: ["FZ-52001", "Marina Biryani Co.", 388, "PLACED"] |
| **k. Links** | Decoded WhatsApp text: `Hi, I tried Explorer and watched: Place an order. I want to know more about the Certification Program in AI-Powered Full Stack Development.` |

New checks:

| Check | Expected |
|---|---|
| **n. Cart bar** | `cartBarLabel()` after adding r1i1 is `1 item, ₹289`, and for the demo cart `2 items, ₹328`. Then mount Foodzy into a hidden test container, add r1i1, and the cart bar's text contains `1 item, ₹289` |
| **o. Code per layer** | After the whole order flow, `latestCodeByLayer()` gives the files: Screen `public/order.html`, Styling `public/styles/order.css`, Logic `public/js/checkout.js`, Server `server/routes/orders.js`, Database `db/orders.sql`. After step 4 only: Screen order-1, Styling none, Logic order-2, Server order-4, Database none. Total code lines per flow [add, search, order, track]: [40, 87, 102, 68] |
| **p. Layout** [layout, compact, rowHeight, phoneScale, screenWidth, cardWidth] | 1920 x 1080: [laptop, false, 620, 0.768, 276, 301]. 1536 x 864: [laptop, false, 420, 0.505, 182, 288]. 1440 x 900: [laptop, false, 456, 0.553, 199, 260]. 1366 x 768: [laptop, true, 384, 0.458, 165, 250]. 1024 x 768, 1100 x 660 and 390 x 844 are phone |
| **q. No sideways scroll** | At the current window size, `document.documentElement.scrollWidth` is not more than the window width |

---

## 16. Phases

Total target is about 8 hours.

### Phase 0: Branch and swap the locked files (target 20 min)
- Commit everything, then create and switch to the branch `upgrade-explorer`.
- Replace `content/`, `js/engine/` and `tools/` with the zip's folders. Delete the old `thattu` folders. Copy in `UPGRADE_BRIEF.md` and `assets/food/PHOTOS.txt`.
- Make the `config.js` changes from Section 4.
- Run `node tools/verify-content.mjs`. It may fail only on `js/copy.js` text (old Thattu words). List those failures and do not fix them yet.
- **Report:** the branch name, the content check output, and the list of files that import from `js/engine/thattu/` or `content/apps/thattu/` (they will change in Phase 1).

### Phase 1: Renames, the cart bar fix and the self-test (target 60 min)
- **Build:** every rename from Section 4, the `copy.js` changes from Section 13, `stateSnapshot()`, `cartBarLabel()` on the cart bar, the `#/app/thattu` redirect, and the self-test changes from Section 15 (checks n, o and p, and q as a placeholder until Phase 2).
- **Report:** `node tools/verify-content.mjs` showing ALL PASS, the full self-test table, and a screenshot of the cart bar after adding Chicken Dum Biryani showing "1 item, ₹289".

### Phase 2: The split view on laptop (target 120 min)
This is the hardest and most important phase. Take extra care.
- **Build:** `ui/split.js` (layout from `rowGeometry()`, flat mode, the FLIP split and assembly), card shells with headers and footers, group labels, the internet gap, the bus, ports and the packet (Sections 6A to 6F and 6H). Remove `ui/exploded.js` and its CSS. For testing, add a temporary button that sends the packet from Screen to Database and back. Remove it before the report.
- **Report:** screenshots flat and split at 1536 x 864 and 1366 x 768 in both themes, a short screen recording of the split and a packet trip, and the frame rate during the split with Chrome's CPU slowed down 4 times (above 50 fps). Confirm nothing overlaps and nothing scrolls sideways at either size.

### Phase 3: The layer cards and the dock (target 120 min)
- **Build:** the 4 layer card contents (Section 7), the dock's 3 modes with code tabs and the full stack code sheet (Section 8), "Try it yourself" (6G) and the CTA in the dock.
- **Report:** screenshots of the order flow at steps 3, 5 and 9 at 1536 x 864, the full stack code sheet, and "Try it yourself" with the banner. Confirm all 4 flows work by tapping, by "Try it yourself" and by "Do it for me", at all 3 speeds.

### Phase 4: The phone view (target 90 min)
- **Build:** Section 9: the split into the strip, the map strip, the big card, the wrapping code, the sticky controls, the flow list sheet and the flow end.
- **Report:** screenshots at 390 x 844 and 360 x 740 of the strip with the Server card active, the Screen card, the code wrapping, and the flow end. A short screen recording of the whole order flow on a phone size. Confirm no sideways scrolling.

### Phase 5: Photos, home page and polish (target 90 min)
- **Build:** the 37 photos (Section 10), the Foodzy look fixes, the home page (Section 11), the header and polish (Section 12), the drawn icons, and an updated `og-image.png` showing the side by side layers.
- **Final checks** (report each one):
  1. `node tools/verify-content.mjs` and `?test=1` both show ALL PASS.
  2. All 4 flows work in both themes at every size in Section 12.
  3. Nothing overlaps and nothing scrolls sideways at any of those sizes.
  4. The split and the packet stay above 50 fps with Chrome's CPU slowed down 4 times.
  5. Reduced motion follows Section 6H.
  6. The cart bar and the Add to cart flow always show the same amount.
  7. No errors and no `console.log` in the console.
  8. `#/app/thattu` opens Foodzy.
  9. Lighthouse on phone: Performance 85 or more, Accessibility 95 or more (photos must stay small).
  10. `?demo=1&flow=order&theme=dark&speed=1` plays the same way twice in a row, in both layouts.
- **Report:** screenshots of the home page and the stage at 1536 x 864 and 390 x 844, the Lighthouse scores, and the 10 checks.

### Phase 6: Docs, preview and ship (target 40 min)
- **PROJECT_BRIEF.md:** add a short note at the very top: "v2.0.0: see UPGRADE_BRIEF.md. Where they differ, UPGRADE_BRIEF.md wins."
- **README.md:** the new name, the split view, the layouts, and the URL modes.
- **UPGRADE_GUIDE.md:** update the app plug-in interface (`stateSnapshot()`), the locked file list (`layout.js`) and the "add a new app" steps with Mpay as the example. Keep the ready-to-paste upgrade prompt.
- **CHANGELOG.md:** a "2.0.0" entry listing every change in this brief.
- **STUDENT_EXPLAINER.md:** add frontend and backend, the internet gap, why the server never trusts a price, what a database transaction is (the order flow), and how the code per layer fits together as one project (the file paths).
- **REEL_SCRIPT.md:** update for the new layouts. Vertical reels use the phone view (the strip), horizontal reels use the laptop view. Write the exact seconds again.
- **Preview:** push the branch, give me the Vercel preview link, and wait. When I reply "Ship it": merge into `main`, check the live site and `?test=1` live, tag `v2.0.0`, and push the tag.
- **Vercel project name:** if I want the live address renamed to Explorer, give me click-by-click steps. Do not change it yourself.

---

## 17. Reports and parking

Phase Reports use the format in `PROJECT_BRIEF.md` Section 12, and the "two fix attempts" rule still applies.

If I want to ship sooner, park in this order:
1. The full stack code sheet (keep the code tabs)
2. The home hero's loop animation (show a still drawing)
3. "Try it yourself" (keep "Do it for me" and tapping the small phone)
4. The packet's JSON tooltip and the "Copy code" buttons
5. Dish photos (keep the restaurant photos)

**Never park:**
- The side by side split, the bus, the packet and the internet gap
- The 4 layer card contents and the code tabs in the dock
- The phone view with the map strip
- The cart bar fix
- The content check, the self-test and every value in Section 15
- Light and dark theme, reduced motion, demo mode
- The tone, privacy and branding rules
- The branch and "Ship it" rule
