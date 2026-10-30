// Drawn inline SVG icons (24x24, 1.75px stroke, round caps, currentColor).
// UPGRADE_BRIEF.md Section 14.
// Used by stage, split view, cards, player, header, and home.

const SVG_ATTRS = 'width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const ICONS = {
  // Layer icons
  screen: `<svg ${SVG_ATTRS}><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  styling: `<svg ${SVG_ATTRS}><path d="M18.37 2.63c.98.98.98 2.56 0 3.54L15 9.7l-3.54-3.54 3.37-3.37a2.5 2.5 0 0 1 3.54 0z"/><path d="M11.46 6.16 3 14.62V19h4.38l8.46-8.46"/><path d="M4 21h16"/></svg>`,
  logic: `<svg ${SVG_ATTRS}><path d="M7 4c-1.5 0-3 1-3 3v2c0 1.5-1 2-2 2 1 0 2 .5 2 2v2c0 2 1.5 3 3 3"/><path d="M17 4c1.5 0 3 1 3 3v2c0 1.5 1 2 2 2-1 0-2 .5-2 2v2c0 2-1.5 3-3 3"/></svg>`,
  server: `<svg ${SVG_ATTRS}><rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><line x1="6" y1="6.5" x2="6.01" y2="6.5"/><line x1="6" y1="17.5" x2="6.01" y2="17.5"/></svg>`,
  database: `<svg ${SVG_ATTRS}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>`,

  // App icons
  foodzy: `<svg ${SVG_ATTRS}><path d="M3 11h18c0 5-4 9-9 9s-9-4-9-9z"/><path d="M8 4c0 1.5-1 2.5-1 3.5"/><path d="M12 3c0 1.8-1 2.8-1 4"/><path d="M16 4c0 1.5-1 2.5-1 3.5"/></svg>`,
  mpay: `<svg ${SVG_ATTRS}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M16 12h5v4h-5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z"/><path d="M8 9h4m-4 3h4m-2-3v6"/></svg>`,
  chitchat: `<svg ${SVG_ATTRS}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M17 8h.01M12 8h.01M7 8h.01"/></svg>`,
  tripz: `<svg ${SVG_ATTRS}><rect x="4" y="3" width="16" height="15" rx="3"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/><path d="M4 10h16M7 21l1-3m9 3-1-3"/></svg>`,

  // Utility & controls
  check: `<svg ${SVG_ATTRS}><polyline points="20 6 9 17 4 12"/></svg>`,
  cloud: `<svg ${SVG_ATTRS}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  lock: `<svg ${SVG_ATTRS}><rect x="4" y="11" width="16" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  copy: `<svg ${SVG_ATTRS}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  play: `<svg ${SVG_ATTRS}><polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/></svg>`,
  pause: `<svg ${SVG_ATTRS}><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`,
  back: `<svg ${SVG_ATTRS}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  next: `<svg ${SVG_ATTRS}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  replay: `<svg ${SVG_ATTRS}><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  close: `<svg ${SVG_ATTRS}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  share: `<svg ${SVG_ATTRS}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  sun: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg ${SVG_ATTRS}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  splitLayers: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="18" y="4" width="4" height="16" rx="1"/></svg>`
};

export function getIconSvg(name, size = 24) {
  const raw = ICONS[name] || "";
  if (size === 24) return raw;
  return raw.replace('width="24" height="24"', `width="${size}" height="${size}"`);
}
