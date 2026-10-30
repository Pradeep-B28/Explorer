# Upgrade Guide

This guide explains how to grow and maintain Explorer without breaking existing features.

---

## 1. Architectural Rules

Explorer follows 10 core engineering rules:

1. **One settings file**: `config.js` controls every business setting. Changing WhatsApp numbers, course names, analytics IDs, speeds, or feature toggles never requires touching other files.
2. **One text file**: `js/copy.js` stores every string the visitor sees (outside of data files). Strings are grouped by screen and retrieved via `t(key, values)`.
3. **Content as data**: Layers, apps, and journeys live in `content/` as pure data. Application code reads content solely via `js/content.js`.
4. **Apps are plug-ins**: Each app lives in its own folder under `js/apps/<id>/` and is registered in `js/apps/registry.js`. The site shell, 3D stack, packet, and player never import an app directly.
5. **Decoupled flow trigger**: When a user completes an action, the app emits `journey:request` on `js/events.js` with `{ journeyId, values, commit }`. When explain mode is off, the app runs `commit()` immediately. When explain mode is on, the step player runs `commit()` at the designated step.
6. **Screens are self-contained modules**: Each screen exports `mount` and `unmount` functions.
7. **Event-driven communication**: Features talk via `events.js` (`on`, `off`, `emit`). Components never reach into other modules directly.
8. **Feature switches**: Optional features check `config.features`. Setting a feature to false hides it completely without errors.
9. **Self-test grows with features**: Any new feature or engine logic must add automated checks to `js/selftest.js`.
10. **Strict versioning**: Releases are tracked in `CHANGELOG.md` and mirrored in `config.version`.

---

## 2. Adding a New App (Example: MPay)

Follow these steps to add a new app like MPay (a UPI payments demo app):

### Step 1: Prepare and test the data
Ask Claude to prepare and test `content/apps/MPay/` and `js/engine/MPay/`.
- `content/apps/MPay/app.js`: App metadata, mock balance, recent contacts.
- `content/apps/MPay/journeys.js`: Journeys such as "Send money to a friend".
- `js/engine/MPay/`: Pure logic functions calculating balance, PIN validation, and bank transfer routing.
- Run `node tools/verify-content.mjs` to confirm all data definitions pass.

### Step 2: Build the UI implementation
Create the folder `js/apps/MPay/`:
- `js/apps/MPay/index.js`: Export `mount(screenEl, ctx)`, `doItForMe(journeyId)`, `wireframeTargets()`, and `stateLine()`.
- `js/apps/MPay/state.js`: Manage balance, active recipient, and PIN entry state.
- `js/apps/MPay/screens/`: Screens for contact list, payment keypad, processing, and success receipt.
- `styles/MPay.css`: Dedicated styling for MPay inside the phone frame.

### Step 3: Register the app
1. In `content/apps.js`, update MPay's status from `"soon"` to `"live"`.
2. In `content/index.js`, import and export MPay content.
3. In `js/apps/registry.js`, register the MPay module loader:
   ```javascript
   registerApp("MPay", () => import("./MPay/index.js"));
   ```

### Step 4: Add self-test checks
Add tests in `js/selftest.js` verifying MPay transfer math and journeys.

---

## 3. Adding a New Foodzy Flow (Example: "Apply a coupon")

1. **Add the journey definition**: In `content/apps/Foodzy/journeys.js`, add a new journey object with `id: "coupon"`, `title: "Apply a coupon"`, `tryThis: "Enter WELCOME50 in the cart"`, `steps`, and `lesson`.
2. **Add demo values**: In `js/engine/Foodzy/values.js`, update `journeyValues()` to handle `"coupon"`.
3. **Emit the request**: In `js/apps/Foodzy/screens/cart.js`, when the user enters a coupon code and taps Apply:
   - Prepare values with `journeyValues("coupon", ctx, { app, restaurants }, t)`.
   - Emit `journey:request` with `{ journeyId: "coupon", values, commit }`.
4. **Implement Do It For Me**: In `js/apps/Foodzy/index.js`, add `case "coupon"` inside `doItForMe()` to navigate to the cart, fill the coupon field, and click Apply.
5. **Verify**: Run `node tools/verify-content.mjs` and check in the browser.

---

## 4. Business Settings in config.js

All marketing and business variables are located in `config.js`:

- **Change WhatsApp sales number**: Edit `salesWhatsApp`. Use country code first, digits only (11 to 15 digits). For example: `"917550077725"`. To hide the WhatsApp button, leave it empty: `""`.
- **Change program details**: Edit `program.name` and `program.page`.
- **Adjust player speeds**: Edit `speeds: [0.5, 1, 2]` and `defaultSpeed: 1`.
- **Set Analytics IDs**:
  - GA4: Set `analytics.ga4Id` (e.g. `"G-XXXXXXXXXX"`).
  - Meta Pixel: Set `analytics.metaPixelId` (e.g. `"1504538090837971"`).

---

## 5. Reading GA4 Funnels

Explorer dispatches clean semantic events:
- `app_open`: Triggered when an app stage mounts (`{ app }`).
- `explode_open`: Triggered when explain mode is turned on (`{ app }`).
- `flow_start`: Triggered when a journey starts (`{ flow, how }` where `how` is `tap` or `do_it`).
- `flow_complete`: Triggered when a journey finishes all steps (`{ flow }`).
- `cta_whatsapp`: Triggered when the visitor clicks the WhatsApp chat button.
- `cta_program`: Triggered when the visitor clicks the program course link.
- `share`: Triggered on share actions (`{ method }` where `method` is `native` or `copy`).

**Drop-Off Analysis**:
Compare `flow_start` against `flow_complete` per flow to identify where learners drop off. For example, if 100 users trigger `order` via `flow_start` and 78 reach `flow_complete`, the completion rate is 78%.

---

## 6. Prompt for Future Antigravity Upgrades

Copy and paste this prompt when initiating a new upgrade in Antigravity:

> Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/ or js/engine/ unless I ask. Keep the self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".

---

## 7. Upcoming Upgrades Ready for this Architecture

The codebase is built and pre-architected for:
1. **New Apps**: MPay (UPI payments), ChitChat (chat messaging), and Tripz (bus ticket booking).
2. **Additional Foodzy Journeys**: Apply coupon, cancel an active order, or reorder previous meal.
3. **Break a Layer Mode**: A toggle to simulate backend failures (e.g. turn off Server layer to show an HTTP 500 error journey path).
4. **Tamil Localization**: Create `js/copy.ta.js` with matching keys and toggle between languages.
5. **Real Search Backend**: Plug a standalone Node.js Express server into the Server layer for student backend exercises.
