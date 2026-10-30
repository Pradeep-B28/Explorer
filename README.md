# Explorer

Explorer is an interactive web project by Wrench Wise. It lets visitors use a real-looking food delivery app (Foodzy), split it open into a 3D exploded stack, and watch each user action travel through all 5 layers that a full stack developer builds.

---

## Quick Start

Explorer runs as a static site using modern standard ES modules. No build steps, bundlers, or npm installations are required.

To run locally:

```bash
npx --yes serve .
```

Open your browser at `http://localhost:3000`.

---

## URL Modes

Explorer supports specialized modes via query parameters:

| URL Parameter | Description |
|---|---|
| `#/` | **Home Screen**: Explains the 5 hidden layers, showcases interactive 3D mini stack art with pointer follow, provides the 5-layer strip, and lists apps. |
| `#/app/Foodzy` | **Stage Screen**: Full interactive Foodzy delivery app with 3D exploded view, live packet transmission, code view, and step-by-step panel. |
| `?test=1` | **Self-Test Mode**: Executes 13 browser validation checks (a to m) verifying content integrity, bill math, search filtering, and journey timing. Disables analytics and persistence. |
| `?demo=1` | **Demo Mode**: Deterministic automated recording runner for short-form reels. Sized to screen, fixed order ID TH-52001, timestamp 10:42:05, and automated sequence. Supports `&flow=order`, `&theme=dark`, and `&speed=1`. |
| `?present=1` | **Presenter Mode**: Designed for live sessions on Zoom or Google Meet. Enlarges code and step text to 18px, binds keys 1 to 4 to trigger flows, enables Space and arrow keys for navigation, and hides the WhatsApp button. |

Press `?` on your keyboard in Presenter mode to view the keyboard shortcut modal.

---

## Verification

Before pushing changes, run the automated content verification suite:

```bash
node tools/verify-content.mjs
```

This verifies that all 5 layers, 4 apps, 6 restaurants, 31 dishes, 4 journeys, and copy keys pass all engine checks.

---

## Project Structure

```
7 Explorer/
├── index.html              Site shell, OpenGraph preview tags, and header/footer
├── config.js               Single source of truth for business configuration
├── manifest.json           PWA installable app manifest
├── og-image.png            Social media link preview image (1200 x 630)
├── content/                LOCKED. Content data (layers, apps, restaurants, journeys)
├── tools/                  LOCKED. Content verification tool (verify-content.mjs)
├── js/
│   ├── main.js             Application entry point, router, and lifecycle controller
│   ├── config.js           (Imported directly or via js/content.js)
│   ├── content.js          Content bridge importing content/
│   ├── copy.js             User-facing copy strings and translation helper t()
│   ├── events.js           Pub/sub event bus
│   ├── links.js            Generates WhatsApp, program, and share links with UTM tags
│   ├── motion.js           Unified requestAnimationFrame loop and reduced motion detection
│   ├── player.js           Step player controller with clock abstraction
│   ├── progress.js         Tracks watched flows in localStorage
│   ├── router.js           Hash-based router (#/ and #/app/:id)
│   ├── selftest.js         In-browser self-test suite (?test=1)
│   ├── store.js            Safe localStorage and sessionStorage wrapper
│   ├── analytics.js        Privacy-first GA4 and Meta Pixel integration
│   ├── demo.js             Demo runner (?demo=1) and presenter mode (?present=1)
│   ├── engine/             LOCKED. Pure business logic (cart, search, orders, journey)
│   ├── screens/
│   │   ├── home.js         Home screen with 3D mini stack art and app picker
│   │   └── stage.js        Stage view with phone, 3D exploded stack, and panel
│   ├── ui/
│   │   ├── loader.js       Session intro loader with 5 sliding layer bars
│   │   ├── phone.js        Phone frame and status bar
│   │   ├── exploded.js     3D exploded stack, layer cards, counter-rotated chips, beam
│   │   ├── packet.js       3D traveling packet and pulse rings
│   │   ├── panel.js        Side panel, flow selector, player controls, progress segments
│   │   ├── codeview.js     Syntax-highlighted code display (safe text nodes only)
│   │   ├── cta.js          End-of-flow lesson card, course CTA, and share actions
│   │   ├── share.js        Web Share API integration with clipboard fallback
│   │   ├── dialog.js       Confirmation dialogs
│   │   ├── toast.js        Toast notification alerts
│   │   └── layers/         Layer art (styling wireframe, logic nodes, server log, DB table)
│   └── apps/
│       ├── registry.js     App registry mapping IDs to implementations
│       └── Foodzy/         Food delivery app implementation (screens, state, UI)
└── styles/
    ├── tokens.css          Design tokens (colors, layer tints, radiuses, shadows)
    ├── base.css            Reset, typography, and accessibility baseline
    ├── site.css            Site layout, home screen, header, footer, loader, modes
    ├── phone.css           Phone container, status bar, and frame styling
    ├── exploded.css        3D perspective stack, beam, layer cards, chips, packet
    ├── panel.css           Stage side panel, code view, progress segments, CTA card
    └── Foodzy.css          Foodzy brand theme, menu items, cart, map, and status
```
