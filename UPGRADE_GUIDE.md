# Upgrade Guide

This guide explains how to grow and maintain Explorer without breaking existing features.

---

## 1. Architectural Rules

Explorer follows 10 core engineering rules:

1. **One settings file**: `config.js` controls every business setting. Changing WhatsApp numbers, course names, analytics IDs, speeds, or feature toggles never requires touching other files.
2. **One text file**: `js/copy.js` stores every string the visitor sees (outside of data files). Strings are grouped by screen and retrieved via `t(key, values)`.
3. **Content as data**: Layers, apps, and journeys live in `content/` as pure data. Application code reads content solely via `js/content.js`.
4. **Locked files**: Never edit anything in `content/`, `tools/`, or `js/engine/` (including `js/engine/layout.js`). At the start of every phase, run `node tools/verify-content.mjs`. It must end with `RESULT: ALL PASS`.
5. **Apps are plug-ins**: Each app lives in its own folder under `js/apps/<id>/` and is registered in `js/apps/registry.js`. The site shell, split view, bus, packet, and dock never import an app directly.
6. **Decoupled flow trigger**: When a user completes an action, the app emits `journey:request` on `js/events.js` with `{ journeyId, values, commit }`. When explain mode is off, the app runs `commit()` immediately. When explain mode is on, the step player runs `commit()` at the designated step.
7. **Screens are self-contained modules**: Each screen exports `mount` and `unmount` functions.
8. **Event-driven communication**: Features talk via `events.js` (`on`, `off`, `emit`). Components never reach into other modules directly.
9. **Feature switches**: Optional features check `config.features`. Setting a feature to false hides it completely without errors.
10. **Strict versioning**: Releases are tracked in `CHANGELOG.md` and mirrored in `config.version`.

---

## 2. The App Plug-In Interface

Every app registered in Explorer must export these standard lifecycle and introspection functions:

| Function | Signature | Purpose |
|---|---|---|
| `mount` | `mount(screenEl, ctx)` | Mounts the live application into the virtual phone screen element. Returns `{ unmount() }`. |
| `doItForMe` | `doItForMe(journeyId)` | Prepares any prerequisite state (e.g. populating cart) and simulates the trigger action. |
| `wireframeTargets` | `wireframeTargets()` | Returns an array of DOM elements on screen that the Styling wireframe highlights. |
| `stateLine` | `stateLine()` | Returns a short one-line string summarizing client state (e.g. `order: FZ-52001, status: PLACED`). |
| `stateSnapshot` | `stateSnapshot()` | Returns a small plain object snapshot for the Logic card (under 8 keys, e.g. `{ screen, cart, lastOrder }`). |

---

## 3. Adding a New App (Example: Mpay)

Follow these steps to add a new app like Mpay (a UPI payments demo app):

### Step 1: Prepare and test the data
Prepare `content/apps/mpay/` and `js/engine/mpay/`:
- `content/apps/mpay/app.js`: App metadata (id: `"mpay"`, name: `"Mpay"`, color: `"#0369A1"`, teaser, mock balance).
- `content/apps/mpay/journeys.js`: Journeys such as "Send money to a friend" (`id: "send"`).
- `js/engine/mpay/`: Pure calculation functions for balance deductions, PIN validation, and bank routing.
- Run `node tools/verify-content.mjs` to confirm all data definitions pass.

### Step 2: Build the UI implementation
Create the folder `js/apps/mpay/`:
- `js/apps/mpay/index.js`: Export `mount(screenEl, ctx)`, `doItForMe(journeyId)`, `wireframeTargets()`, `stateLine()`, and `stateSnapshot()`.
- `js/apps/mpay/state.js`: Manage balance, active recipient, and PIN entry state.
- `js/apps/mpay/screens/`: Screens for contact list, payment keypad, processing, and success receipt.
- `styles/mpay.css`: Dedicated styling for Mpay inside the phone frame.

### Step 3: Register the app
1. In `content/apps.js`, update Mpay's status from `"soon"` to `"live"`.
2. In `content/index.js`, import and export Mpay content.
3. In `js/apps/registry.js`, register the Mpay module loader:
   ```javascript
   registerApp("mpay", () => import("./mpay/index.js"));
   ```

### Step 4: Add self-test checks
Add automated tests in `js/selftest.js` verifying Mpay transfer math, state snapshot keys, and journey steps.

---

## 4. Adding a New Foodzy Flow (Example: "Apply a coupon")

1. **Add the journey definition**: In `content/apps/foodzy/journeys.js`, add a new journey object with `id: "coupon"`, `title: "Apply a coupon"`, `tryThis: "Enter WELCOME50 in the cart"`, `steps`, and `lesson`.
2. **Add demo values**: In `js/engine/foodzy/values.js`, update `journeyValues()` to handle `"coupon"`.
3. **Emit the request**: In `js/apps/foodzy/screens/cart.js`, when the user enters a coupon code and taps Apply:
   - Prepare values with `journeyValues("coupon", ctx, { app, restaurants }, t)`.
   - Emit `journey:request` with `{ journeyId: "coupon", values, commit }`.
4. **Implement Do It For Me**: In `js/apps/foodzy/index.js`, add `case "coupon"` inside `doItForMe()` to navigate to the cart, fill the coupon field, and click Apply.
5. **Verify**: Run `node tools/verify-content.mjs` and check in the browser (`?test=1`).

---

## 5. Business Settings in config.js

All marketing and business variables are located in `config.js`:

- **Change WhatsApp sales number**: Edit `salesWhatsApp`. Use country code first, digits only (11 to 15 digits). For example: `"917550077725"`. To hide the WhatsApp button, leave it empty: `""`.
- **Change program details**: Edit `program.name` and `program.page`.
- **Adjust player speeds**: Edit `speeds: [0.5, 1, 2]` and `defaultSpeed: 1`.
- **Set Analytics IDs**:
  - GA4: Set `analytics.ga4Id` (e.g. `"G-XXXXXXXXXX"`).
  - Meta Pixel: Set `analytics.metaPixelId` (e.g. `"1504538090837971"`).

---

## 6. Prompt for Future Antigravity Upgrades

Copy and paste this prompt when initiating a new upgrade in Antigravity:

> Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/ or js/engine/ unless I ask. Keep the self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
