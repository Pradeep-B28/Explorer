// Picks the layout (laptop row or phone strip) and works out the size of every card in the split view.
// Uses nothing. Pure functions, no DOM. Call again on every resize.
// Used by js/screens/stage.js, js/ui/split.js, the self-test and tools/verify-content.mjs.

const PHONE = { width: 360, height: 760 };

// Fixed parts of the laptop page, in CSS pixels. "compact" is used when the window is under 820px tall.
export const LAPTOP = {
  margin: 24,        // left and right page margin
  maxWidth: 1680,    // the row never grows wider than this
  header: 64,
  groups: { normal: 40, compact: 28 },   // the Frontend and Backend labels above the row
  bus: 44,           // space under the cards for the wire and the packet
  dock: { normal: 264, compact: 224 },
  spacing: { normal: 32, compact: 24 },  // the rest of the vertical breathing room
  cardHeader: 36,    // the Screen card's own header above the phone
  gap: 24,           // between cards
  internet: 80,      // the wider gap between Logic and Server
  minRow: 340,
  maxRow: 620,
  minCard: 200
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round3 = (v) => Math.round(v * 1000) / 1000;

// Sizes for the laptop split view.
// rowHeight: height of every card. phoneScale: scale of the live phone inside the Screen card.
// screenWidth: width of the Screen card. cardWidth: width of each of the other 4 cards.
export function rowGeometry(width, height) {
  const compact = height < 820;
  const k = compact ? "compact" : "normal";
  const free = height - LAPTOP.header - LAPTOP.groups[k] - LAPTOP.bus - LAPTOP.dock[k] - LAPTOP.spacing[k];
  const rowHeight = clamp(free, LAPTOP.minRow, LAPTOP.maxRow);
  const phoneScale = round3((rowHeight - LAPTOP.cardHeader) / PHONE.height);
  const screenWidth = Math.round(PHONE.width * phoneScale);
  const rowWidth = Math.min(width, LAPTOP.maxWidth) - 2 * LAPTOP.margin;
  const cardWidth = Math.floor((rowWidth - screenWidth - 3 * LAPTOP.gap - LAPTOP.internet) / 4);
  return { compact, rowHeight, phoneScale, screenWidth, cardWidth, rowWidth, dockHeight: LAPTOP.dock[k] };
}

// "laptop" (the 5 cards side by side) or "phone" (the map strip and one big card).
// Laptop needs a window at least 1100 x 660 and room for cards at least 200px wide.
export function layoutFor(width, height) {
  if (width < 1100 || height < 660) return "phone";
  return rowGeometry(width, height).cardWidth >= LAPTOP.minCard ? "laptop" : "phone";
}

// The phone's scale when it is the whole stage (flat mode) or the big card on phones.
export function flatPhoneScale(width, height, layout) {
  if (layout === "phone") return round3(Math.min(1, (width - 32) / PHONE.width));
  return round3(Math.min(1, (height - LAPTOP.header - 96) / PHONE.height));
}
