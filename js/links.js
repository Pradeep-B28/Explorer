// Builds WhatsApp, program, and share links with UTM tags.
// Uses config.js and js/content.js.
// Used by CTA, panel, footer, share button, and selftest.

import { CONFIG } from "../config.js";
import { getJourneys } from "./content.js";
import { fillText } from "./engine/template.js";

/**
 * Validates a WhatsApp phone number: digits only, 11 to 15 digits.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidWhatsAppNumber(phone) {
  return typeof phone === "string" && /^\d{11,15}$/.test(phone.trim());
}

/**
 * Formats a list of flow IDs or flow titles into title strings joined by comma.
 * @param {string[]} flows
 * @returns {string}
 */
function resolveFlowTitles(flows) {
  if (!Array.isArray(flows) || flows.length === 0) return "";
  const allJourneys = getJourneys("Foodzy");
  const titleMap = new Map(allJourneys.map((j) => [j.id, j.title]));

  const titles = flows.map((f) => {
    if (titleMap.has(f)) return titleMap.get(f);
    return f;
  });

  return titles.join(", ");
}

/**
 * Builds the WhatsApp prefilled chat link.
 * Returns null if the phone number is empty or invalid.
 * @param {string[]} [flows=[]] List of flow IDs or titles
 * @param {string} [overridePhone=null] Test number override
 * @returns {string | null}
 */
export function getWhatsAppLink(flows = [], overridePhone = null) {
  const phone = overridePhone !== null ? overridePhone : CONFIG.salesWhatsApp;
  if (!isValidWhatsAppNumber(phone)) return null;

  const flowList = resolveFlowTitles(flows);
  const text = fillText(CONFIG.whatsAppText, {
    flows: flowList,
    program: CONFIG.program.name
  });

  return `https://wa.me/${phone.trim()}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a link to the program or website with UTM parameters.
 * @param {string} [content="cta"] utm_content value (home, cta, footer, share)
 * @returns {string}
 */
export function getProgramLink(content = "cta") {
  const base = CONFIG.website.replace(/\/+$/, "");
  const page = CONFIG.program.page ? `/${CONFIG.program.page.replace(/^\/+/, "")}` : "/";
  const params = new URLSearchParams({
    utm_source: CONFIG.utm.source,
    utm_medium: CONFIG.utm.medium,
    utm_campaign: CONFIG.utm.campaign,
    utm_content: content
  });

  return `${base}${page}?${params.toString()}`;
}

/**
 * Builds the share URL for the Explorer site.
 * @returns {string}
 */
export function getShareLink() {
  const base = CONFIG.siteUrl || (typeof window !== "undefined" && window.location ? window.location.origin : CONFIG.website);
  const cleanBase = base.replace(/\/+$/, "");
  const params = new URLSearchParams({
    utm_source: CONFIG.utm.source,
    utm_medium: CONFIG.utm.medium,
    utm_campaign: CONFIG.utm.campaign,
    utm_content: "share"
  });

  return `${cleanBase}/?${params.toString()}`;
}
