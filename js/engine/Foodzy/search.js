// Foodzy's search: finds restaurants by name, cuisine, area or dish.
// Uses nothing (restaurants are passed in). Pure functions, no DOM.
// Used by the Foodzy home screen, the journey values, the self-test and tools/verify-content.mjs.

// Lowercase, accents removed, anything that is not a letter, digit or space becomes a space.
export function normalise(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function words(text) {
  const n = normalise(text);
  return n ? n.split(" ") : [];
}

// True when every query word is the start of some word in the text.
// "biry" matches "Marina Biryani Co.", "ani" does not.
export function matchesAll(queryWords, text) {
  const textWords = words(text);
  return queryWords.length > 0 && queryWords.every((q) => textWords.some((w) => w.startsWith(q)));
}

// Search rules:
// 1. If the normalised query is shorter than minChars, the search is not active: every restaurant, in content order.
// 2. A restaurant matches if ALL query words match inside ONE field: its name (score 3),
//    its cuisine or its area (score 2), or one dish name (score 1). The best field counts.
// 3. dishes lists every dish id whose name matches, whatever the score (shown as "Dishes: ...").
// 4. Order: score high to low, then rating high to low, then content order.
// Returns { active, results: [{ id, score, dishes }] }.
export function search(restaurants, query, minChars = 2) {
  if (normalise(query).length < minChars) {
    return { active: false, results: restaurants.map((r) => ({ id: r.id, score: 0, dishes: [] })) };
  }
  const q = words(query);
  const found = [];
  restaurants.forEach((r, order) => {
    const dishes = r.menu.filter((m) => matchesAll(q, m.name)).map((m) => m.id);
    let score = 0;
    if (matchesAll(q, r.name)) score = 3;
    else if (matchesAll(q, r.cuisine) || matchesAll(q, r.area)) score = 2;
    else if (dishes.length) score = 1;
    if (score) found.push({ id: r.id, score, dishes, rating: r.rating, order });
  });
  found.sort((a, b) => b.score - a.score || b.rating - a.rating || a.order - b.order);
  return { active: true, results: found.map(({ id, score, dishes }) => ({ id, score, dishes })) };
}
