> **v2.0.0: see UPGRADE_BRIEF.md. Where they differ, UPGRADE_BRIEF.md wins.**

# Explorer: Project Brief

Read this whole file before you write any code. Then read `content/SCHEMA.md`. Work in the phases in Section 11, and stop after each one with a Phase Report.

I am not from a tech background. Explain things in plain words.

---

## 1. What we are building

**Explorer** is a website by Wrench Wise. Visitors use a real-looking, made-up food delivery app called **Foodzy**. Then they tap **"Show me how it works"** and the app splits into 5 floating 3D layers: **Screen, Styling, Logic, Server and Database**. When they do something in the app (add a dish, search, place an order, track it), a glowing packet travels through the layers, step by step, with a plain English line and a few lines of real-looking code at each stop.

It sells the **Certification Program in AI-Powered Full Stack Development** with one message: "This is what a full stack developer builds. You'll build one."

**Version 1** has one live app (Foodzy) and 4 flows: Add to cart, Search, Place an order, Track your order. The home screen also shows 3 "Coming soon" apps (MPay, ChitChat, Tripz). Adding them later must not need changes to the core code (Section 3).

**Who uses it:** people who see our reels (mostly on phones), people at our free live sessions, and leads our sales team sends it to. Many have never written code.

**Everything about Foodzy is made up:** its name, restaurants, dishes, rider and customer. It must look like a real app, but never like any real company's app.

When there is a trade-off, follow this order:
1. The exploded view and the travelling packet look premium and run smoothly.
2. Every bill, search result, order number and step text is exactly right (Section 10).
3. It runs smoothly on a mid-range Android phone.
4. Foodzy feels like a real app.
5. The WhatsApp and share buttons work in one tap.
6. It is easy to upgrade (Section 3).
7. Everything else.

---

## 2. Hard rules

1. **Code.** Plain HTML, CSS and JavaScript (ES modules) only. No frameworks, libraries, CDNs, npm packages or web fonts. No animation libraries: build motion with CSS and one `requestAnimationFrame` loop. The only image files are the logo, the link preview image, app icons and the optional food photos (6D). Draw everything else in code (icons as inline SVG, the map, the layer art).
2. **Front-end only.** No backend, database, API keys, AI calls or accounts. The Server and Database layers are a show. The code in the panel is example code to read. It never runs.
3. **Locked files.** Never edit anything in `content/`, `js/engine/` or `tools/`. At the start of every phase, run `node tools/verify-content.mjs`. It must end with `RESULT: ALL PASS`. If you think content or an engine rule is wrong, stop and tell me. Do not fix it yourself.
4. **One engine.** Only the engine files calculate bills, search results, order numbers, tracking minutes, rupee amounts, journey values, filled step text and step timing. Every other file calls them. Never copy their logic.
5. **Storage.** `localStorage` may hold only `tea-theme` and `tea-progress` (the flows a visitor has watched). `sessionStorage` may hold only `tea-intro-seen` (the loader). Wrap every read and write in try and catch, and make the site work fine when storage is blocked.
6. **No personal data.** The site never asks for a name, phone number or email. Never send what someone types (like a search) to analytics.
7. **External scripts.** Only GA4 and the Meta Pixel, and only when their IDs are set in `config.js`. Never load them with `?test=1`, `?demo=1` or `?present=1`.
8. **Tone.** Calm and clear. Never promise a job, an interview or a result. Never use these anywhere a user can see them: stupid, dumb, idiot, noob, loser, useless, "take your job", "replace you", guarantee, placement, salary, lakh, "get hired", "seats left", or any countdown.
9. **Program names.** Always the full name from `config.js`. Never shorten it.
10. **Writing style.** All UI text and docs are in plain English with short sentences. No emojis. No em dashes (the long dash).
11. **Safety.** Never use `innerHTML` or `insertAdjacentHTML` with changing values. Code, packets and search words are shown with text nodes and `textContent` only, including syntax highlighting.
12. **Hidden means hidden.** `base.css` must include `[hidden] { display: none !important; }`. (In an earlier project, a CSS rule kept a "hidden" debug panel visible on the live site.)
13. **No debug output live.** No debug panels, test overlays or `console.log` in the live site. Test output appears only with `?test=1`.
14. **File size.** One job per file, under about 350 lines. Start every JS file with a 3-line comment: what it does, what it uses, what uses it.
15. **Phases.** At the end of every phase, stop and give a Phase Report (Section 12). Do not start the next phase until I say so.
16. **Stubborn bugs.** If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
17. **My actions.** When you need me to do something (click, log in, approve), give numbered click-by-click steps.
18. **Commands.** Before running a terminal command, tell me in one line what it does.
19. **Branding.** Wrench Wise only. Foodzy, MPay, ChitChat, Tripz, the restaurants, the rider and the customer are made up and stay exactly as written in `content/`. No real company names, logos or brand colours anywhere, and never compare Foodzy to a real app in the UI or docs. The footer says these apps are made up (Section 8).

---

## 3. Built to upgrade

We have rebuilt earlier apps to add features. This one must be easy to grow. **Adding an app or a flow should feel like adding data and a few new files, not rewriting code.**

1. **One settings file.** `config.js` holds every business setting. Changing the WhatsApp number, the program, analytics IDs, speeds, limits or features must never need a code change anywhere else.
2. **One text file.** `js/copy.js` exports `COPY` (every word the visitor sees, except content) and `t(key, values)`. Group keys by screen. `t()` fills `{name}` values. When a value named `n` is 1 and a key ending in `.one` exists, `t()` uses that key. A Tamil version later is a new `copy.ta.js`, not a rewrite. The content check reads `copy.js` once it exists.
3. **Content as data.** Layers, apps, restaurants and journeys live in `content/`, follow `SCHEMA.md` and are listed in `content/index.js`. The site reads them only through `js/content.js`. A new Foodzy flow is a new journey in `journeys.js` plus one action in the app.
4. **Apps are plug-ins.** Each app lives in `js/apps/<id>/` and is listed in `js/apps/registry.js`. The site shell, the exploded view, the packet and the player never import Foodzy directly. An app's `index.js` exports:
   - `mount(screenEl, ctx)`: draws the app into the phone screen and returns `{ unmount() }`
   - `doItForMe(journeyId)`: sets up what the flow needs, then performs the action as if tapped
   - `wireframeTargets()`: the elements the Styling layer outlines (6F)
   - `stateLine()`: one short line for the Logic layer, like "cart: 2 items"
5. **How an app starts a flow.** When the visitor does a flow's action, the app emits `journey:request` on `js/events.js` with `{ journeyId, values, commit }`. `values` comes from `journeyValues()` in the engine. `commit` is a function that makes the visible change (re-renders the screen). The player calls `commit()` once, when the step with `commit: true` starts. When explain mode is off, the app calls `commit()` itself straight away and no flow plays.
6. **Screens are modules.** Site screens live in `js/screens/`, Foodzy screens in `js/apps/Foodzy/screens/`. Each exports `mount` and `unmount`.
7. **Events, not imports, between features.** Features talk through `js/events.js` (`on`, `off`, `emit`). Analytics listens to events and never reaches into other files.
8. **Feature switches.** Every optional feature checks its switch in `config.features`. Off means fully hidden, with no errors.
9. **Self-test grows.** Every new feature adds its checks to `selftest.js`.
10. **Versions.** `CHANGELOG.md` gets an entry for every release. `config.version` matches it.

**A new app later (for example MPay)** will be: `content/apps/MPay/` and `js/engine/MPay/` (I prepare and test these with Claude first, then lock them), `js/apps/MPay/` (you build the screens), one line in `content/index.js` and one line in `js/apps/registry.js`, and its status set to `live` in `content/apps.js`. Nothing else changes. Section 6 must keep this possible.

---

## 4. Tech setup and file structure

- ES modules need a local server. Use `npx --yes serve .` from the project folder (it only runs the folder, nothing is added to the project), or Antigravity's built-in preview.
- Test in the browser at 390 x 844 (phone) and 1440 x 900 (laptop).

```
the-exploded-app/
  index.html
  config.js                 given. Section 5
  manifest.json
  og-image.png              made in Phase 5
  .gitignore                node_modules/, .DS_Store, Thumbs.db
  assets/
    logo.png                I add this
    food/                   optional restaurant photos (6D)
    icons/                  app icons
  content/                  LOCKED. SCHEMA.md explains every field
  tools/                    LOCKED. verify-content.mjs
  js/
    engine/                 LOCKED
      template.js           fills {placeholders}
      journey.js            prepare(), hops(), travelMs(), stepMs(), totalMs()
      money.js              formatINR()
      Foodzy/
        cart.js             emptyCart, addItem, removeItem, replaceWith, cartFrom, itemCount, bill
        search.js           search()
        orders.js           orderId(), trackingEta()
        values.js           journeyValues()
    main.js                 starts everything, reads the URL modes
    events.js               on, off, emit
    copy.js                 COPY and t(). Section 8
    content.js              the only file that imports content/
    store.js                safe localStorage and sessionStorage
    progress.js             flows watched (tea-progress)
    links.js                WhatsApp, program and share links with UTM
    analytics.js            Section 9
    selftest.js             ?test=1. Section 10
    router.js               #/ and #/app/<id>
    motion.js               the one animation loop and the reduced motion check
    player.js               plays a prepared journey: clock, pause, next, previous, speed, commit
    screens/
      home.js               hero, layers strip, app picker
      stage.js              header, phone, exploded view and panel for one app
    ui/
      loader.js
      phone.js              phone frame, status bar, scaling
      exploded.js           the 3D stack, layer cards, chips, beam
      packet.js             the travelling packet
      layers/
        styling.js          the live wireframe
        logic.js            event, state, render nodes
        server.js           the request log
        database.js         the table view
      panel.js              intro, flow list, step card, controls, flow end
      codeview.js           code with highlighting (text nodes only)
      cta.js
      share.js
      toast.js
      dialog.js
    apps/
      registry.js           app id to module
      Foodzy/
        index.js            mount, doItForMe, wireframeTargets, stateLine
        state.js            cart, search, orders and screen state (uses the engine)
        screens/            home.js, restaurant.js, cart.js, placed.js, track.js
        ui/                 card.js, dish.js, foodimage.js, map.js, cartbar.js
  styles/
    tokens.css  base.css  site.css  phone.css  exploded.css  panel.css  Foodzy.css
```

**Using the engine**
- `journeyValues(journeyId, ctx, { app, restaurants }, t)` builds the values for a flow. Read the comment at the top of `values.js` for what `ctx` holds for each flow. For an order, build the values **before** the cart is cleared.
- `prepare(journey, layers, values, speed)` returns the filled steps. Each step has `from`, `to` (layer index, 0 is Screen), `distance`, `travel` (ms) and `duration` (ms, travel included). When the speed changes during a flow, call `prepare()` again and carry on from the current step.
- `search(restaurants, query, config.limits.searchMinChars)` returns `{ active, results }`. When `active` is false, show every restaurant.
- `addItem()` can return `reason: "other-shop"` (show the new cart dialog) or `"max-qty"` (show a toast).
- `bill(cart, restaurants, app.fees)` returns every line of the bill. Show its numbers as they are.

**Drawing the phone.** The phone screen is drawn at exactly `config.phone` (360 x 760), then scaled with a CSS `transform` to fit. Never resize it to fit. The exploded stack is scaled the same way, as one block.

**One animation loop** for motion that needs JavaScript (the packet, the beam, the hero), using `requestAnimationFrame` with delta time capped at 0.05 s. CSS transitions are fine for simple motion. Pause everything when the tab is hidden.

**The player takes a clock.** `player.js` must accept a clock (`now()` and a way to schedule) so the self-test can run a whole flow instantly with a fake clock (Section 10, check j).

---

## 5. config.js

`config.js` is already in the folder. Keep its structure and comments. You may change only:
- `salesWhatsApp`, when I give you the number
- `siteUrl`, in Phase 6

What each setting does:
- `salesWhatsApp`: digits only, country code first, 11 to 15 digits. If empty or not in that format, hide the WhatsApp button and make "See the program" the main button.
- `whatsAppText`: the prefilled message. `{flows}` is the titles of the flows watched, joined with ", ". `{program}` is `program.name`.
- `program`: the full name and its page on wrench-wise.com (`""` means the main site).
- `website` and `utm`: build every link to wrench-wise.com, adding `utm_content` (`home`, `cta`, `footer` or `share`).
- `analytics`: an empty ID switches that tracker off.
- `speeds`, `defaultSpeed`: the speed buttons in the panel.
- `limits`: `searchMinChars`, `searchDebounceMs` (live filtering when explain mode is off), `maxQtyPerItem`, `introHoldMs` (how long the layer intro stays).
- `phone`: the size the phone screen is drawn at.
- `features`: switches.

---

## 6. Features

### Must have

**A. Loader**
- Shows on the first visit of a session only (`tea-intro-seen`), never in demo or test mode.
- 5 thin bars, one per layer colour, slide in from alternate sides and stack into a phone outline. Then the Wrench Wise logo fades in and the whole loader fades out. Under 1.2 seconds in total.
- If the page is ready earlier, still finish the animation, but never hold the page longer than 1.2 seconds.
- Reduced motion: a 150 ms fade.

**B. Home screen** (`#/`)
- **Background:** `--bg-grad`, a very faint 24px grid (`--brand` at 5% opacity) and two large soft glows (`--accent` at 8%) drifting slowly on 20 to 30 second loops.
- **Header:** Wrench Wise logo, theme button.
- **Hero, left:** eyebrow chip, title, subtitle, buttons "Open Foodzy" (primary, `--brand-grad`) and "How it works" (scrolls to the layers strip).
- **Hero, right:** a small drawn 5-layer stack (art, not the live app). Every 6 seconds the layers separate, a packet dot travels down the beam and back up, and they close again. On laptop it is tilted in 3D and follows the pointer by up to 5 degrees. Flat on phone.
- **Layers strip:** 5 chips in stack order, each with its layer dot, name, tech and `oneLine`.
- **App picker:** cards from `content/apps.js` in order. Live app: name, kind, teaser, "Open" button. Coming soon: greyed, a "Coming soon" chip, teaser, not clickable (`aria-disabled="true"`).
- **Footer:** Section 8 keys `footer.*`, and a link to wrench-wise.com with `utm_content=footer`.

**C. Stage** (`#/app/Foodzy`)
- **Header:** "All apps" back link, app name, theme button.
- **Laptop (900px and wider):** stage on the left, panel on the right (420px, sticky). The stage holds the phone, which becomes the exploded stack.
- **Phone (under 900px):** the phone fills the width. The panel becomes a bottom sheet: collapsed it shows the step title and controls, and a drag handle or tap opens it to show the code and packet.
- The "Show me how it works" button sits below the phone, full width on phone. When explain mode is on, it changes to "Put it back together".

**D. Foodzy (must feel like a real app)**
- Its own look, inside the phone only: `--Foodzy` tokens (Section 7), rounded cards, a drawn status bar (time 10:42, signal, battery).
- **Home:** location row (pin icon, "Home", `user.area`, avatar circle with the customer's initial), search bar, offer banner (`offerBanner` with `{freeAbove}` from `formatINR`), category chips (tapping one searches for that word), "Restaurants near you" list.
- **Restaurant card:** photo (16:9, 14px radius), name, rating chip (star icon, `--rating`), "{n} mins", cuisine, area, "₹{price} for two", "Pure veg" tag when `pureVeg`.
- **Search:** typing filters the list live when explain mode is off (debounced). Enter, the search icon or a category chip submits. Results header, the count, and under each card "Dishes: ..." from the engine's `dishes` (first 2, then "and {n} more"). A clear button. No results: the empty state from Section 8.
- **Restaurant screen:** back arrow, name, cuisine, area, rating, time, an offer strip, then the menu. Each dish: the Indian veg or non-veg mark (green square with a dot, or red square with a triangle), "Bestseller" tag, name, price, description (2 lines), a drawn thumbnail with the ADD button overlapping its bottom edge. In the cart it becomes a stepper (minus, count, plus).
- **Cart bar:** slides up from the bottom when the cart is not empty: `cart.bar` on the left, "View cart" on the right.
- **Cart screen:** restaurant name and area, the lines with steppers and line totals, "Bill details" (item total, delivery fee, platform fee, GST and restaurant charges, then "To pay"). When delivery is free, show the delivery fee struck through with "FREE". "Delivering to" with the address, "Pay with UPI", and a footer with the total and a full-width "Place order" button. Empty state when the cart is empty.
- **New cart dialog:** when `addItem` returns `other-shop`. "Keep my cart" or "Start new cart" (`replaceWith`).
- **Order placed:** a drawn tick, "Order placed", the order number, "{shop} is preparing your food", "Arriving in {n} mins", buttons "Track order" and "Back to home". Order numbers come from `orderId()` with a counter that starts at 1 per visit.
- **Tracking:** a drawn SVG map (land, a few roads, a curved route from the restaurant pin to the home pin), the rider marker, a status chip, minutes left from `trackingEta()`, a rider card ("{name} is on the way", a call button that shows the demo toast), and a 4-step status line (Placed, Preparing, On the way, Delivered). When the change is committed, the status becomes On the way and the rider glides along the route (points from `getPointAtLength`, 900 ms per segment).
- **Demo-only buttons** (call, profile, offers) show the demo toast.
- **Food photos:** a restaurant card shows `assets/food/<image>` if the file exists (`loading="lazy"`, `decoding="async"`, `object-fit: cover`). If it is missing or fails, draw the fallback: a warm gradient picked by the restaurant's position in the list, a drawn plate icon and the restaurant's first letter. Dish thumbnails are always drawn (veg or non-veg tint and a plate icon). Photos, if added, are 800 x 450, under 120 KB, from Antigravity's image tool or a free stock site, never from a real restaurant or delivery app. The site must look finished without them.

**E. Explain mode and the exploded view (the heart of this project)**
- **Explode.** "Show me how it works" turns explain mode on. The phone frame fades out and the screen splits into 5 layer cards, each the size of the phone screen. In 900 ms (`--ease-out`, 70 ms stagger), the stack turns to `rotateX(var(--tilt-x)) rotateZ(var(--tilt-z))` and the layers spread along the Z axis: layer `i` sits at `translateZ((2 - i) * var(--gap-z))`, so Screen is on top and Database at the bottom. `transform-style: preserve-3d` on the stack.
- **Layer cards:** 24px radius, 1px border in the layer colour at 40%, `--layer-card` fill, `--shadow-xl`. No `backdrop-filter`. Each has a chip at its left edge (layer dot, name, tech) that is counter-rotated so it always faces the viewer.
- **The beam:** a thin vertical line through the centres of all 5 layers, a soft gradient from `--accent` to `--brand` with a faint glow. The segment the packet is crossing brightens.
- **Intro:** after the explode, the chips pulse in turn from Screen to Database (250 ms apart) and the panel shows `stage.intro.*` for `limits.introHoldMs`, then the flow list.
- **The Screen layer stays live.** It is the real Foodzy screen, and taps work while exploded. When the pointer rests on the Screen layer for 400 ms on laptop, the whole stack eases to the gentler `--tilt-x-soft` so tapping is easier, and eases back when the pointer leaves.
- **Hover a layer** (laptop): it lifts by 12px on Z and shows its `more` text as a tooltip. Clicking a chip shows that layer's card in the panel.
- **Active layer** during a step: border at full layer colour, a soft glow in the layer colour at 35%, other layers at 55% opacity. 300 ms transitions.
- **Put it back together:** reverses in 700 ms and turns explain mode off. Any flow playing is closed.
- **Phone layout (under 900px):** no rotateZ. The live Screen layer is at the top at 0.86 scale. Below it, the other 4 layers are compact cards (about 120px tall, `rotateX(18deg)` for depth) in a column, joined by a beam on their left. The page scrolls smoothly to keep the active layer in view.
- **Reduced motion:** no tilt, no spread animation. Laptop shows the layers as a flat column beside the phone. Phone shows the same column as above, flat. The packet fades between layers instead of travelling.
- **Scale:** the whole stack is scaled as one block so it fits the stage with 24px to spare. It must never cause sideways scrolling.

**F. What each layer shows**
- **Screen:** the live app.
- **Styling:** a live wireframe of the current Foodzy screen. Read `wireframeTargets()`, measure each element against the phone screen (divide by the scale), and draw outline boxes at the same spots. Below, a row of Foodzy colour swatches and a type sample ("Aa 20 / 15 / 13"). Redraw after each commit and screen change. During a Styling step, the boxes flash in `--layer-styling` and the first line of the step's code shows as a chip.
- **Logic:** three nodes in a row, "Event", "State", "Render", joined by arrows, and a small readout with `stateLine()`. During a Logic step the nodes light up in order (150 ms apart) and the readout updates.
- **Server:** a dark request log (code colours, monospace). It starts with "api.Foodzy.example ready on port 3000" and "Waiting for requests". Each Server step adds its `log` line with a time stamp (hh:mm:ss) and types it in. Keep the last 6 lines.
- **Database:** a table view with tabs "restaurants" and "orders". The restaurants table lists every restaurant (id, name, rating). The orders table starts with `seedOrders` and keeps every order placed in the visit. During a Database step, switch to `db.table` and show `db.columns`: `select` highlights the row whose first value matches `db.row[0]`, `insert` slides the new row in at the bottom with a `--fixed-soft` flash, `update` flips the changed cells with a highlight.

**G. The packet**
- A pill about 120px wide: a glowing dot and the step's `packet.label` in monospace 12px, `--surface` fill, a border in the colour of the layer it is heading to, and an `--accent` glow.
- It travels along the beam from layer `from` to layer `to` in `travel` ms (`--ease`). On arrival, a ring pulses out from the layer (scale 1 to 1.6, fade out, 400 ms). When `distance` is 0 it pulses in place. The first step: the packet appears at its layer.
- It is a real 3D element inside the stack (moving on Z), drawn by the one animation loop. On phone it moves along the column beam.

**H. The player and the panel**
- **Before explain mode:** the panel shows `panel.intro.*`, the 5 layers list and the "Show me how it works" button.
- **Flow list:** a card for each journey: title, `tryThis`, a "Watched" tick if done, and "Do it for me" (when `features.doItForMe`). A visitor can start a flow by doing it in the app or with "Do it for me".
- **Do it for me:** calls the app's `doItForMe(journeyId)`. It sets up what the flow `needs` (for `order`: the demo cart and the cart screen. For `track`: if no order exists, it places one quietly with the demo cart, without playing the order flow, then opens the placed screen). Then it shows a tap ring on the button and performs the action.
- **Playing:** the header shows the flow title and a progress bar with one segment per step in its layer colour. The step card shows the layer chip, `panel.step`, the title, the `say` line, the code (`codeview.js`, typed in at about 18 ms per character, never more than 600 ms per step) and the packet data as indented JSON. Controls: Previous, Play or Pause, Next, speed buttons from `config.speeds`, Replay, Close.
- **Timing:** each step lasts its `duration`. The packet travels first, then the text and code show. With `features.autoPlay` on, the next step starts when the time is up. Pause freezes everything, including the packet.
- **Commit:** the player calls the flow's `commit()` exactly once, when the commit step starts. If the visitor uses Next past it, call it then. Previous never undoes it.
- **While a flow plays,** taps on the Screen layer are blocked. A tap shows the `panel.busy` toast.
- **Keyboard:** Space plays or pauses, the arrow keys go back and forward, Escape closes the flow (only when focus is not in a text field).
- `aria-live="polite"` announces each step's title and `say` line.
- When a flow is closed early, nothing is marked watched.

**I. Flow end and CTA**
- The flow's `lesson` shows under `flow.end.title`. The flow is saved as watched in `tea-progress`.
- The CTA card slides up (300 ms): `cta.title`, `cta.body`, the WhatsApp button (or "See the program" when there is no number), "See the program" as a text link, "Try another flow", and `cta.progress`. After all 4 flows, show `cta.all` and make the share button bigger.
- No forms. Nothing is gated.

**J. Sharing**
- "Share" uses the Web Share API with `share.text` and the site link (`utm_content=share`). If that is not available, copy the link and show `share.copied`.
- Link preview tags: title, description, `og:image` (`og-image.png`, 1200 x 630: the exploded stack art, the title and the Wrench Wise logo), `og:url`, `twitter:card`.

**K. Demo mode** (`?demo=1`, `features.demoMode`), for recording reels
- Parameters: `flow` (one id, or several joined by commas, or `all`), `theme` (`light` or `dark`), `speed` (one of `config.speeds`).
- No loader, no analytics, nothing saved. A small Wrench Wise logo in the top left corner. Only the stage and the panel, sized to fill the screen in portrait or landscape.
- Everything is the same every time: order TH-52001, log time stamps start at 10:42:05, the cart is the demo cart.
- Sequence: the flat app for 1.5 s (for `order`, already on the cart screen with the demo cart) then the "Show me how it works" button gets a visible press, the explode and intro, then each flow by "Do it for me" with 1 s between flows, then the lesson for 2 s, then the CTA card, which stays.
- Write the exact seconds of each moment in `REEL_SCRIPT.md`.

**L. Themes, motion and access**
- Light and dark theme (Section 7). Foodzy follows the site theme.
- Every rule in Section 7's motion and reduced motion lists.
- Keyboard use everywhere, visible focus rings (2px `--accent`), tap targets at least 44px, contrast at least 4.5 to 1 for text.

**M. Analytics:** Section 9.

### Nice to have (only if time allows, in this order)
1. **Presenter mode** (`?present=1`, `features.presenterMode`), for our free live sessions on Zoom or Meet: code and the step text at 18px or more, keys 1 to 4 start that flow with "Do it for me", Space and the arrow keys control steps, no analytics, nothing saved, no WhatsApp button. The CTA says "Questions? Ask in the chat."
2. **Share image** (`features.shareImage`): a 1080 x 1920 PNG drawn on a canvas: the stack art, "I watched an order travel through all 5 layers of an app.", the site address and the logo. Shared with the Web Share API as a file, or downloaded.
3. **Keyboard map:** "?" opens a small list of shortcuts.
4. **Installable app:** `manifest.json` with app icons.

---

## 7. Visual style: matched to wrench-wise.com

These values were measured from the live wrench-wise.com site: emerald as the main brand colour, teal and cyan as accents, gray text, white cards and soft emerald-to-cyan gradients. The layer, Foodzy and code colours are added for this project.

**Colours.** Every colour is a CSS variable in `styles/tokens.css`. The first visit follows the device's light or dark setting. The theme button switches it and saves `tea-theme`.

**Site tokens**

| Token | Light (default) | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0F172A` |
| `--bg-grad` | `linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 45%, #ECFEFF 100%)` | `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` |
| `--surface` | `#FFFFFF` | `#1E293B` |
| `--surface-2` | `#F3F4F6` | `#334155` |
| `--border` | `#E5E7EB` | `#334155` |
| `--text` | `#111827` | `#F1F5F9` |
| `--text-2` | `#374151` | `#CBD5E1` |
| `--muted` | `#6B7280` | `#94A3B8` |
| `--brand` | `#059669` | `#10B981` |
| `--brand-strong` | `#047857` | `#34D399` |
| `--brand-soft` | `#D1FAE5` | `rgba(16,185,129,0.15)` |
| `--accent` | `#0891B2` | `#22D3EE` |
| `--warn` | `#B45309` | `#FBBF24` |
| `--fixed-soft` | `#D1FAE5` | `rgba(16,185,129,0.18)` |

**Brand gradient:** `--brand-grad: linear-gradient(90deg, #059669, #0D9488, #06B6D4)`. Use it for the primary buttons, the bar under the header and the CTA card's top edge.

**Layer tokens.** Use them for dots, borders, glows and progress segments. Chip text is always `--text` on the layer colour at 14%, never text in the layer colour itself.

| Token | Light | Dark |
|---|---|---|
| `--layer-screen` | `#059669` | `#34D399` |
| `--layer-styling` | `#7C3AED` | `#A78BFA` |
| `--layer-logic` | `#CA8A04` | `#FACC15` |
| `--layer-server` | `#0891B2` | `#22D3EE` |
| `--layer-database` | `#4F46E5` | `#818CF8` |
| `--layer-card` | `rgba(255,255,255,0.88)` | `rgba(30,41,59,0.88)` |
| `--beam` | `linear-gradient(180deg, #22D3EE, #10B981)` | same as light |

**Exploded view tokens**

| Token | Laptop | Phone (under 900px) |
|---|---|---|
| `--tilt-x` | `52deg` | `18deg` |
| `--tilt-z` | `-30deg` | `0deg` |
| `--tilt-x-soft` | `30deg` | `18deg` |
| `--gap-z` | `96px` | not used (column layout) |

**Foodzy tokens** (inside the phone only)

| Token | Light | Dark |
|---|---|---|
| `--Foodzy` | `#C2410C` | `#FB923C` |
| `--Foodzy-strong` | `#9A3412` | `#FDBA74` |
| `--Foodzy-soft` | `#FFF7ED` | `rgba(251,146,60,0.14)` |
| `--rating` | `#15803D` | `#16A34A` |
| `--veg` | `#15803D` | `#22C55E` |
| `--nonveg` | `#B91C1C` | `#F87171` |
| `--map-land` | `#F5F1E8` | `#1E293B` |
| `--map-road` | `#FFFFFF` | `#334155` |

**Code tokens** (the code panel and the Server log are dark in both themes, like a real editor)

| Token | Value |
|---|---|
| `--code-bg` | `#0B1220` (dark theme `#050A14`) |
| `--code-gutter` | `#64748B` |
| `--code-text` | `#E2E8F0` |
| `--tok-comment` | `#64748B` |
| `--tok-keyword` | `#67E8F9` |
| `--tok-string` | `#FDE68A` |
| `--tok-number` | `#FCA5A5` |
| `--tok-tag` | `#6EE7B7` |
| `--tok-attr` | `#FDBA74` |
| `--tok-prop` | `#93C5FD` |
| `--tok-punct` | `#94A3B8` |

Highlight `html`, `css`, `js` and `sql` with a small tokenizer in `codeview.js` (keywords, strings, numbers, tags, attributes, properties, punctuation). `text` is not highlighted.

**Fonts**
- Text: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Headings weight 800, letter spacing -0.01em. Body 400 to 500.
- Code, packets and the Server log: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace`.
- All numbers use `font-variant-numeric: tabular-nums`.

**Shapes:** buttons, pills and chips fully rounded (999px). Site cards 16px. Layer cards and the phone screen 24px. The phone frame 44px. Code panel 12px.

**Shadows** (light; in dark use the same shapes with `rgba(0,0,0,0.40)`)
- `--shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`
- `--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`
- `--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)`
- `--shadow-xl: 0 20px 40px -12px rgba(15,23,42,0.35)`

**Meta:** `theme-color` `#FFFFFF` (light) and `#0F172A` (dark) using media queries. In `manifest.json`: `theme_color` `#059669`, `background_color` `#FFFFFF`.

**Micro-interactions**
- Buttons: hover lifts 2px with `--shadow-md`, press scales to 0.97, 150 to 200 ms.
- Cards: hover lifts 3px with a stronger shadow. On laptop only, a soft `--accent` glow follows the pointer inside the card.
- Foodzy: ADD turns into the stepper with a 200 ms scale, the cart badge bumps (scale 1.3 at the middle, 300 ms), the cart bar slides up, screens slide sideways inside the phone (300 ms).

**Motion rules**
- Animate only `transform`, `opacity` and `clip-path`. Never width, height, top, left or margins.
- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` and `--ease: cubic-bezier(0.4, 0, 0.2, 1)`. Durations 150, 200, 300 and 500 ms, plus 700 ms (back together) and 900 ms (explode).
- Professional and calm. Small distances. Nothing bounces more than once.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no tilt, no pointer follow, no drifting glows, no explode animation (Section 6E). The packet fades between layers. Code and log lines show at once. Screens cross-fade in 150 ms.
- **Performance:** no `backdrop-filter` anywhere. `will-change: transform` only on the stack, the layers and the packet, and only while explain mode is on.

---

## 8. Words (copy.js)

Use exactly these. Values in braces are filled by `t()`. Keys ending in `.one` are used when `n` is 1. The 4 keys marked **engine** must be exactly as written, because the engine and the content check use them. Add any small labels you need in the same plain style, and list them in your Phase 1 report.

| Key | Text |
|---|---|
| `site.title` | Explorer |
| `site.description` | Use a real-looking app, then split it open and watch your order travel through every layer. |
| `home.eyebrow` | A Wrench Wise project |
| `home.title` | Every app you use has 5 hidden layers. |
| `home.subtitle` | Order food in a real-looking app. Then split it open and watch your order travel through every layer. |
| `home.open` | Open Foodzy |
| `home.how` | How it works |
| `home.layersTitle` | The 5 layers inside every app |
| `home.pickTitle` | Pick an app |
| `home.pickSub` | Every app here is made up for learning. More are coming. |
| `app.open` | Open |
| `app.soon` | Coming soon |
| `stage.back` | All apps |
| `stage.explode` | Show me how it works |
| `stage.together` | Put it back together |
| `stage.intro.title` | 5 layers. Every app has them. |
| `stage.intro.body` | Now use the app. Each tap travels through the layers. |
| `panel.intro.title` | Want to see inside? |
| `panel.intro.body` | Tap the button and this app splits into the 5 layers a full stack developer builds. |
| `panel.flowsTitle` | Try a flow |
| `panel.doIt` | Do it for me |
| `panel.watched` | Watched |
| `panel.step` | Step {n} of {total} |
| `panel.code` | The code |
| `panel.packet` | What travels |
| `panel.play` | Play |
| `panel.pause` | Pause |
| `panel.next` | Next |
| `panel.prev` | Back |
| `panel.replay` | Replay |
| `panel.close` | Close |
| `panel.speed` | Speed |
| `panel.busy` | Wait for this flow to finish, or close it. |
| `flow.end.title` | What this shows |
| `cta.title` | This is what a full stack developer builds. |
| `cta.body` | In the {program}, you'll build an app like this, every layer of it. |
| `cta.whatsapp` | Talk to us on WhatsApp |
| `cta.program` | See the program |
| `cta.another` | Try another flow |
| `cta.progress` | You've watched {n} of {total} flows. |
| `cta.all` | You've seen how a whole app works. |
| `share.button` | Share |
| `share.text` | I watched a food order travel through all 5 layers of an app. Try it: |
| `share.copied` | Link copied |
| `theme.toLight` | Switch to light theme |
| `theme.toDark` | Switch to dark theme |
| `demo.toast` | This is a demo app, so this button does nothing. |
| `footer.line` | Built by Wrench Wise to show what full stack developers build. |
| `footer.disclaimer` | Foodzy, MPay, ChitChat and Tripz are made-up apps for learning. They are not linked to any real company. |
| `footer.legal` | © 2026 Wrench Wise Edutech Private Limited |
| `Foodzy.home` | Home |
| `Foodzy.searchPlaceholder` | Search for dishes or restaurants |
| `Foodzy.nearYou` | Restaurants near you |
| `Foodzy.resultsFor` | Results for "{query}" |
| `search.count` | **engine** {n} restaurants |
| `search.count.one` | **engine** {n} restaurant |
| `Foodzy.noResults` | No matches for "{query}". Try biryani or coffee. |
| `Foodzy.dishes` | Dishes: {list} |
| `Foodzy.andMore` | and {n} more |
| `Foodzy.mins` | {n} mins |
| `Foodzy.forTwo` | {price} for two |
| `Foodzy.pureVeg` | Pure veg |
| `Foodzy.bestseller` | Bestseller |
| `Foodzy.add` | ADD |
| `Foodzy.menu` | Menu |
| `cart.bar` | **engine** {n} items, {total} |
| `cart.bar.one` | **engine** {n} item, {total} |
| `Foodzy.viewCart` | View cart |
| `Foodzy.cartTitle` | Your cart |
| `Foodzy.billTitle` | Bill details |
| `Foodzy.itemTotal` | Item total |
| `Foodzy.delivery` | Delivery fee |
| `Foodzy.free` | FREE |
| `Foodzy.platform` | Platform fee |
| `Foodzy.gst` | GST and restaurant charges |
| `Foodzy.toPay` | To pay |
| `Foodzy.deliverTo` | Delivering to |
| `Foodzy.payWith` | Pay with {method} |
| `Foodzy.placeOrder` | Place order |
| `Foodzy.emptyCart` | Your cart is empty. Add something tasty. |
| `Foodzy.newCart.title` | Start a new cart? |
| `Foodzy.newCart.body` | Your cart has dishes from {shop}. Start a new cart with this dish instead? |
| `Foodzy.newCart.keep` | Keep my cart |
| `Foodzy.newCart.start` | Start new cart |
| `Foodzy.maxQty` | You can add up to {n} of one dish. |
| `Foodzy.placed` | Order placed |
| `Foodzy.orderNo` | Order {id} |
| `Foodzy.preparing` | {shop} is preparing your food. |
| `Foodzy.arriving` | Arriving in {n} mins |
| `Foodzy.track` | Track order |
| `Foodzy.backHome` | Back to home |
| `Foodzy.status.placed` | Placed |
| `Foodzy.status.preparing` | Preparing |
| `Foodzy.status.onTheWay` | On the way |
| `Foodzy.status.delivered` | Delivered |
| `Foodzy.riderOnWay` | {name} is on the way |
| `Foodzy.minsAway` | {n} mins away |

In `copy.js`, the 4 engine keys are written without the word "engine", for example `"cart.bar": "{n} items, {total}"`.

---

## 9. Analytics

Load only when the ID is set, and never in test, demo or presenter mode.

- **GA4** (`config.analytics.ga4Id`): `page_view` on load. `app_open` (`app`), `explode_open` (`app`), `flow_start` (`flow`, `how`: `tap` or `do_it`), `flow_complete` (`flow`), `cta_whatsapp` (`flow`), `cta_program` (`flow`), `share` (`method`: `native` or `copy`).
- **Meta Pixel** (`config.analytics.metaPixelId`): `PageView` on load. The standard `Lead` event on the WhatsApp click. Custom event `FlowCompleted` (`flow`).
- Send nothing else. **Never the search words or anything else a visitor types.**
- `flow_start` against `flow_complete` per flow shows where people stop watching. See `UPGRADE_GUIDE.md`.

---

## 10. Self-test (`?test=1`)

`?test=1` runs every check below in the browser, through the site's own files (`content.js`, `copy.js`, `links.js`, `store.js`, `player.js`), and shows a table of PASS or FAIL with expected and actual values, then `RESULT: ALL PASS` or the number of failures. Nothing is saved and no analytics load. Every value must match exactly. `node tools/verify-content.mjs` checks the same engine values and must also pass.

| Check | Expected |
|---|---|
| **a. Content** | 5 layers (screen, styling, logic, server, database), 4 apps (1 live), 6 restaurants, 31 dishes, 4 journeys: add, search, order, track |
| **b. Words** | `t("cart.bar", { n: 1, total: "₹289" })` is `1 item, ₹289`. `t("cart.bar", { n: 3, total: "₹520" })` is `3 items, ₹520`. `t("search.count", { n: 1 })` is `1 restaurant`. `t("search.count", { n: 3 })` is `3 restaurants` |
| **c. Bills** [item total, delivery, platform, GST, total] | Demo cart (r1i1, r1i5): [328, 39, 5, 16, 388]. r1i1 and r1i2: [678, 0, 5, 34, 717]. r2i5 twice: [90, 39, 5, 5, 139]. Empty: [0, 0, 0, 0, 0] |
| **d. Cart rules** | Adding r2i1 to a cart with r1i1 gives `other-shop`. An 11th r1i1 gives `max-qty`. Removing the only dish gives an empty cart with `shopId` null |
| **e. Search** (ids in order) | biryani [r1]. "  BIRYANI " [r1]. biry [r1]. ani []. coffee [r3, r2]. chicken [r1, r4, r5]. pepper chicken [r4]. filter [r3, r2]. mylapore [r3]. South Indian [r2, r4]. xyz []. "b" is not active |
| **f. Numbers** | Order 1 is TH-52001, order 12 is TH-52012. Tracking minutes: 32 gives 19, 18 gives 11, 5 gives 4. Money: 0 is ₹0, 388 is ₹388, 1000 is ₹1,000, 100000 is ₹1,00,000, 1234567 is ₹12,34,567 |
| **g. Journey values** | Built with `journeyValues()` from the demo state, each equals that journey's `demoValues` in `content/apps/Foodzy/journeys.js` |
| **h. Journey timing** | Total ms at 1x [add, search, order, track]: [8000, 17600, 21000, 14000]. At 2x: [4000, 8800, 10500, 7000]. Order layer per step: [0, 2, 3, 3, 4, 3, 2, 1, 0]. Order travel ms at 1x: [0, 460, 340, 0, 340, 340, 340, 340, 340] |
| **i. Step text** | Order step 9: `Order TH-52001 is placed. Marina Biryani Co. is cooking, and it should reach you in about 32 minutes.` Order step 5 database row: ["TH-52001", "Marina Biryani Co.", 388, "PLACED"] |
| **j. Player** | With a fake clock, playing the order flow at 2x: `commit()` is called exactly once, at 8400 ms, the flow ends at 10500 ms on step 9, and Pause at 3000 ms followed by 5000 ms of waiting leaves it on step 3 |
| **k. Links** | With test number `919876543210` and flows ["Place an order"], the WhatsApp link starts with `https://wa.me/919876543210?text=` and its decoded text is `Hi, I tried Explorer and watched: Place an order. I want to know more about the Certification Program in AI-Powered Full Stack Development.` With an empty number the WhatsApp link is null. The program link is `https://wrench-wise.com/?utm_source=exploded-app&utm_medium=web-project&utm_campaign=exploded-app&utm_content=cta` |
| **l. Storage blocked** | With storage that throws on every call, marking a flow watched still works for the visit and nothing crashes |
| **m. Text** | Every `COPY` value has no long dash, no emoji (the © sign is fine) and none of the banned words |

---

## 11. Phases

Total target is about 9 hours. Take the time needed to get each phase right.

### Phase 0: Setup and checks (target 20 min)
- Run `node --version`, then `node tools/verify-content.mjs`.
- `git init`, add `.gitignore`.
- Create the folders from Section 4, `styles/tokens.css` with every token from Section 7, `styles/base.css`, and an `index.html` shell with the header and footer.
- Start the local server.
- **Report:** the Node version, the full content check output, and a screenshot of the shell page in both themes.

### Phase 1: Wiring and self-test (target 60 min)
- **Build:** `events.js`, `copy.js`, `content.js`, `store.js`, `progress.js`, `links.js`, `motion.js`, `player.js` (logic only, with the clock from Section 4), and `selftest.js` with checks a to m. Run `node tools/verify-content.mjs` again: it now checks `copy.js` too.
- **Report:** the full self-test table and the content check output. Every value must match Section 10. Do not continue with a mismatch. Explain it in plain words instead.

### Phase 2: Foodzy, flat (target 150 min)
- **Build:** `router.js`, `screens/stage.js` (without the exploded view), `ui/phone.js`, `ui/toast.js`, `ui/dialog.js`, `js/apps/registry.js` and everything in `js/apps/Foodzy/`. Every screen in 6D, working with the engine. Explain mode does not exist yet.
- **Report:** screenshots of home, search results for "biryani", a restaurant, the cart with the demo cart, order placed and tracking, at 390 x 844 and 1440 x 900, in both themes. Click steps for me to place an order. Confirm the bill on screen matches Section 10 check c.

### Phase 3: The exploded view (target 120 min)
This is the hardest and most important phase. Take extra care.
- **Build:** `ui/exploded.js`, the 4 layer art files in `ui/layers/`, `ui/packet.js` and the beam. Explode, intro, back together, hover, the gentler tilt over the Screen layer, the phone column layout and reduced motion. For testing, add a temporary button that sends the packet from Screen to Database and back. Remove it before the report.
- **Report:** screenshots of flat and exploded on laptop and phone, both themes. A short screen recording of the explode and a packet trip if you can. The frame rate during the explode and a packet trip with Chrome's CPU slowed down 4 times (it must stay above 50 fps). Confirm you could add a dish by tapping the exploded Screen layer.

### Phase 4: The player and the panel (target 90 min)
- **Build:** `ui/panel.js`, `ui/codeview.js`, the flow list, "Do it for me", the `journey:request` and `commit()` wiring, speeds, keyboard, `aria-live`, the flow end with the lesson, and blocking taps while a flow plays.
- **Report:** screenshots of the order flow at steps 3, 5 and 9 on laptop and phone. Confirm you played all 4 flows both by tapping in the app and by "Do it for me", at all 3 speeds, and that the self-test still passes.

### Phase 5: Home, CTA, sharing, demo mode and polish (target 90 min)
- **Build:** `ui/loader.js`, `screens/home.js`, `ui/cta.js`, `ui/share.js`, `analytics.js`, link preview tags and `og-image.png`, demo mode, then the Nice to Have items in order if time allows.
- **Final checks** (report each one):
  1. `node tools/verify-content.mjs` and `?test=1` both show ALL PASS.
  2. All 4 flows work by tap and by "Do it for me", in both themes, at 390 x 844 and 1440 x 900.
  3. With Chrome's CPU slowed down 4 times, the explode and the packet stay above 50 fps.
  4. Reduced motion follows every rule in Section 7.
  5. With site data blocked in the browser, everything still works.
  6. No errors and no `console.log` in the console.
  7. Searching for `<img src=x onerror=alert(1)>` shows it as plain text.
  8. The WhatsApp button opens with the prefilled text, and every wrench-wise.com link has its UTM tags.
  9. Lighthouse on phone: Performance 85 or more, Accessibility 95 or more.
  10. `?demo=1&flow=order&theme=dark&speed=1` plays the same way twice in a row.
- **Report:** screenshots of the home screen and the CTA on phone and laptop, the Lighthouse scores, and the 10 checks.

### Phase 6: Docs and deploy (target 45 min)
- **README.md:** what the site is, how to run it, the URL modes (`?demo=1`, `?test=1`, `?present=1`), and a short file map.
- **UPGRADE_GUIDE.md:**
  1. The rules from Section 3 in plain words
  2. How to add a new app, using MPay as the example (UPI payments: tap a person, pay, and follow the money to the receiver's bank), step by step, starting with "Ask Claude to prepare and test `content/apps/MPay/` and `js/engine/MPay/`"
  3. How to add a new Foodzy flow (for example "Apply a coupon")
  4. How to change the WhatsApp number, the program, the speeds and the analytics IDs
  5. How to read GA4: `flow_start` against `flow_complete` per flow
  6. How to run any future upgrade with Antigravity, including this ready-to-paste prompt:
     > Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/ or js/engine/ unless I ask. Keep the self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
  7. Upgrades this structure is ready for: MPay, ChitChat and Tripz, more Foodzy flows (apply a coupon, cancel an order), a "Break a layer" mode (switch the Server off and watch the order fail with an error at step 3), a Tamil version (`copy.ta.js`), and a real Node.js server for the search, as a separate student project
- **CHANGELOG.md:** a "1.0.0" entry listing what v1 includes.
- **STUDENT_EXPLAINER.md:** for students:
  - What each layer does, in plain words, with one example from Foodzy
  - Each flow's lesson, and why it matters in real apps
  - How this site is built, honestly: the Server and Database are simulated in the browser, and the code in the panel shows what real code looks like
  - 3 extension tasks: add a "Remove from cart" flow as data, add a "Break the server" switch that makes step 3 of the order flow fail with a 409 error and shows the error path through the layers, and build a real Node.js and Express search server that uses the same restaurant data
- **REEL_SCRIPT.md:** three scripts, each with a hook as on-screen text in the first 2 seconds, a shot list matched to demo mode timing, captions, optional voiceover lines and a closing line with Wrench Wise:
  - Vertical, 30 seconds (`?demo=1&flow=order&speed=2`): "You tapped Place order. Here's everything that happened next."
  - Horizontal, 60 seconds (`?demo=1&flow=search,order&theme=dark`): "Every app you use has 5 hidden layers. Watch a biryani order go through all of them."
  - Comment bait: freeze on the exploded intro, "Which layer saves your order? Comment 1 to 5."
  - The apps are made up. Captions never say they are real.
  - No emojis, no em dashes, none of the banned words
- **Deploy:**
  1. Help me push the folder to GitHub. I will give you my empty repository URL.
  2. Deploy it on Vercel as a static site, with no build command.
  3. Set `config.siteUrl`, `og:url` and `og:image` to the live address, then redeploy.
  4. Give click-by-click steps for anything I must do myself.
  5. Confirm the live site works on a phone-sized screen and that `?test=1` passes live.
  6. Tag the release `v1.0.0` and push the tag.
  7. Give me the live link and the demo links from `REEL_SCRIPT.md`.

---

## 12. Phase Report format

- **What I built** (3 to 5 bullets)
- **How to check it** (click steps)
- **Screenshots** (phone and laptop, where relevant)
- **Not working or cut,** explained in plain words
- **Time used** against the target

---

## 13. If something keeps breaking

- If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
- If I say "Park it", move that feature to a "Parked" list in the Phase Report and continue with the next phase.
- If I want to ship sooner, park in this order:
  1. Presenter mode and the keyboard map
  2. The share image
  3. The hero's 3D tilt and pointer follow
  4. The live wireframe in the Styling layer (keep the swatches and type sample)
  5. Typing animation for code and log lines (show them at once)

**Never park:**
- The exploded view, the packet, the beam and the 4 layer art panels
- All 4 flows, "Do it for me", the commit rule and the player controls
- Every Foodzy screen in 6D
- The CTA, the WhatsApp button and sharing
- The content check, the self-test and every value in Section 10
- Every rule in Section 3
- The tone, privacy and branding rules
- Light and dark theme
- Demo mode
- Reduced motion rules
- Deployment
