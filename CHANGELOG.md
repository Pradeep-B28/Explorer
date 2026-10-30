# Changelog

All notable changes to the Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  - 4-app registry picker showcasing Foodzy (live) alongside MPay, ChitChat, and Tripz (coming soon).
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
