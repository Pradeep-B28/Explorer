# Changelog

All notable changes to the Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-30

### Added
- **Side-by-Side Split View**:
  - Replaced the 3D exploded view with a flat, horizontal side-by-side split view across all 5 full stack layers (Screen, Styling, Logic, Server, Database).
  - Clear group brackets visually distinguishing the Frontend (Screen, Styling, Logic) from the Backend (Server, Database).
  - Physical Internet Gap with drawn cloud icon representing cellular and fiber network transit between client and server.
  - Communication bus line with port circles at each card base and a glowing 12px packet dot with realistic travel easing.
  - Smooth FLIP split and assembly animations with zero layout shifts.
- **Dock with Three Operating Modes**:
  - Sits directly beneath the split layers on laptop displays.
  - **Flow List Mode**: Production flow cards with "Try it yourself" (with hint banners) and "Do it for me".
  - **Playback Mode**: Multi-speed playback (0.5x, 1x, 2x), play/pause, step navigation, replay, packet JSON inspector, and **Layer Code Tabs** typing live code with line numbers and copy buttons.
  - **Flow End Mode**: Lesson summary, certification program CTA with WhatsApp sales lead integration, and "See the full stack code" action.
- **Full Stack Code Sheet**:
  - Modal sheet displaying every line of code across all 5 layers grouped by stack order with individual copy buttons.
- **Dedicated Phone Layout (`layoutFor() === "phone"`)**:
  - Mobile split animation where the virtual phone shrinks into the Screen tile (500ms) and the 4 remaining tiles slide out into the sticky 96px map strip (60ms stagger).
  - Big Card displaying the active layer at full width with interactive work (live phone, dynamic wireframe, logic state machine, server terminal logs, SQL table).
  - Auto-wrapping monospace code (`white-space: pre-wrap`) with hanging line numbers to strictly prevent sideways scrolling on mobile devices.
  - Sticky bottom mobile playback controls with 48px touch targets.
- **37 Realistic Food Photos**:
  - 6 restaurant photos in `assets/food/shops/` (800×450 px, <120 KB each).
  - 31 dish photos in `assets/food/dishes/` (400×400 px, <45 KB each).
  - Comprehensive source attribution and license documentation in `assets/food/SOURCES.txt`.
  - Lazy loading (`loading="lazy"`) and asynchronous decoding (`decoding="async"`) with plate SVG fallbacks.
- **Foodzy Application Polish**:
  - 14px card border radius, subtle shadows, and sticky header inside virtual phone.
  - Rating chip with `--rating` background and white star icon.
  - Bold dish prices (`font-weight: 700`) with clean border dividers between dishes.
  - Bestseller ribbon in `--foodzy-soft` with `--foodzy-strong` text.
  - Cart bar item total calculation fix: always displays `cartBarLabel()` matching item total (`1 item, ₹289`).
- **Product Home Page**:
  - Hero with eyebrow chip, 48px title (32px mobile), subtitle, CTAs, and 8s looping split preview with tilt up to 4° on laptop.
  - Facts strip with 3 drawn SVG icons.
  - 3-step "How it works" cards with numbered icons.
  - Frontend plus backend layers row / 2-column mobile grid under stack brackets.
  - 4-app picker with hover lift on live Foodzy card and disabled "Coming soon" chips for Mpay, Chitchat, and Tripz.
  - Program band with 8% brand gradient, WhatsApp CTA, and "See the program" button.
  - Scroll fade-up animations (300ms, 12px) disabled on reduced motion.
- **Header & Navigation Polish**:
  - 64px site header at 92% surface opacity with bottom border.
  - Explorer wordmark with drawn split-layers mark.
  - Share button (icon+text on laptop, icon-only on phone) and 40px theme toggle button.
  - Fixed toast notifications positioned above dock and mobile controls.
  - Updated 1200×630 `og-image.png` illustrating the side-by-side full stack architecture.
- **Automated Self-Test Expansion (`?test=1`)**:
  - 17 checks (a to q) in browser, adding check n (cart bar label), check o (code per layer), check p (responsive layout geometry), and check q (no sideways scroll).
- **Autonomous Demo Runner Update (`?demo=1`)**:
  - Updated to support both laptop and phone layouts with fixed order seed `FZ-52001`, speed selection, and dark theme support.

### Changed
- Renamed project from "The Exploded App" to **Explorer**.
- Renamed default app identifiers from `thattu` to `foodzy`.
- Deprecated 3D tilt tokens (`--tilt-x`, `--tilt-z`, `--tilt-x-soft`, `--gap-z`) in favor of 2D side-by-side layout geometry (`rowGeometry`).
- Automated redirect from legacy route `#/app/thattu` to `#/app/foodzy`.

---

## [1.0.0] - 2026-10-30

### Added
- **5-Layer Architecture**: Interactive representation of Screen (HTML), Styling (CSS), Logic (JavaScript), Server (Node.js API), and Database (PostgreSQL).
- **3D Exploded View**: Explode and collapse animations with 3D perspective, counter-rotated layer chips, central gradient beam, and 3D traveling packet with arrival pulses.
- **Foodzy Application**:
  - Home screen with address banner, search bar with debounce, category filters, and restaurant cards.
  - Restaurant menu with pure veg and non-veg badges, bestseller tags, item thumbnails, and dynamic add/stepper controls.
  - Cart screen with multi-item steppers, live bill calculations (item total, delivery, platform fee, GST), address card, and new cart replacement dialog.
  - Order placed confirmation screen with sequential order IDs (starting with TH-52001) and estimated delivery times.
  - Real-time delivery tracking screen with drawn SVG road map, animated rider motion along path segments, and 4-step status progression.
- **Interactive Player & Panel**:
  - Step-by-step journey player for 4 core flows: Add to cart, Search dishes, Place order, and Track order.
  - Code viewer with text-node syntax highlighting for HTML, CSS, JavaScript, and SQL.
  - Multi-speed playback (0.5x, 1x, 2x), play/pause, next/previous step controls, and auto-play mode.
  - Screen blocker preventing UI interaction while a flow is active.
  - Flow completion lesson cards and dynamic full-stack course CTA with prefilled WhatsApp sales integration.
- **Home Screen**:
  - Hero section explaining the 5 full stack layers with call-to-action buttons.
  - Small 3D stack art featuring an automated 6-second separate/travel/close loop and pointer follow on desktop.
  - 5-layer overview strip with technology tags and descriptions.
  - 4-app registry picker showcasing Foodzy (live) alongside Mpay, ChitChat, and Tripz (coming soon).
- **Session Loader**:
  - Initial visit intro animating 5 colored layer bars sliding into a phone outline, followed by logo reveal and smooth fade (< 0.6s total).
- **Sharing & Metadata**:
  - Web Share API integration with clipboard copy fallback and toast confirmation.
  - OpenGraph and Twitter card meta tags with 1200x630 preview image (`og-image.png`).
  - PWA Web App Manifest (`manifest.json`).
- **Specialized URL Modes**:
  - `?test=1`: 13 automated in-browser validation checks (a to m).
  - `?demo=1`: Automated recording runner with deterministic state and timing.
  - `?present=1`: Presenter mode with 18px text, keybindings (1-4, Space, arrows), and keyboard help modal (`?`).
- **Privacy-First Analytics**:
  - GA4 and Meta Pixel tracking fired on app lifecycle events, with search queries and typed inputs strictly excluded.
- **Accessibility & Motion**:
  - Full light and dark themes with WCAG AA compliant contrast.
  - Complete `prefers-reduced-motion` compliance.
