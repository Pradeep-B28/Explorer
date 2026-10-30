// Every business setting for Explorer. Change values here, never in other files.
// Keep this structure and these comments. See PROJECT_BRIEF.md Section 5.
// Used by almost every file through js/content.js and js/links.js.

export const CONFIG = {
  version: "1.0.0",

  // The live address. Set in Phase 6 (deploy). Used for share links and link previews.
  siteUrl: "",

  // Sales WhatsApp: digits only, country code first, 11 to 15 digits. Empty hides the WhatsApp button.
  salesWhatsApp: "917550077725",
  // Prefilled WhatsApp message. {flows} is the list of flows the visitor watched. {program} is program.name.
  whatsAppText: "Hi, I tried Explorer and watched: {flows}. I want to know more about the {program}.",

  // The program the CTA sells. Always use the full name. page is its page on wrench-wise.com, or "" for the main site.
  program: {
    name: "Certification Program in AI-Powered Full Stack Development",
    page: ""
  },

  website: "https://wrench-wise.com",
  utm: { source: "exploded-app", medium: "web-project", campaign: "exploded-app" },

  // An empty ID switches that tracker off.
  analytics: {
    ga4Id: "",
    metaPixelId: "1504538090837971"
  },

  // Journey player speeds. defaultSpeed must be one of speeds.
  speeds: [0.5, 1, 2],
  defaultSpeed: 1,

  limits: {
    searchMinChars: 2,
    searchDebounceMs: 300,
    maxQtyPerItem: 10,
    introHoldMs: 2500
  },

  // The phone screen is drawn at this size, then scaled with a CSS transform to fit.
  phone: { width: 360, height: 760 },

  // Switches. false hides the feature completely, with no errors.
  features: {
    darkTheme: true,
    demoMode: true,
    presenterMode: true,
    shareImage: true,
    doItForMe: true,
    autoPlay: true
  }
};
