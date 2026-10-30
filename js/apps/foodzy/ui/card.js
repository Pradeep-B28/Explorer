// Renders a restaurant card with photo, rating chip, details, and optional search dish matches.
// Uses foodimage.js, formatINR from js/engine/money.js, and js/copy.js.
// Used by Foodzy home screen and search results.

import { createRestaurantImage } from "./foodimage.js";
import { formatINR } from "../../../engine/money.js";
import { t } from "../../../copy.js";

const STAR_SVG = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
`;

/**
 * Creates a restaurant card element.
 * @param {object} options
 * @param {object} options.restaurant Restaurant object
 * @param {number} [options.index=0] Position in list
 * @param {string[]} [options.matchedDishIds=null] Optional array of matching dish IDs from search
 * @param {(restaurantId: string) => void} options.onClick Click callback
 * @returns {HTMLElement}
 */
export function createRestaurantCard({ restaurant, index = 0, matchedDishIds = null, onClick }) {
  const card = document.createElement("article");
  card.className = "restaurant-card";
  card.dataset.restaurantId = restaurant.id;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${restaurant.name}, ${restaurant.cuisine}`);

  card.addEventListener("click", () => onClick(restaurant.id));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(restaurant.id);
    }
  });

  // Photo / art header
  const imageContainer = createRestaurantImage(restaurant, index);
  card.appendChild(imageContainer);

  // Content body
  const body = document.createElement("div");
  body.className = "restaurant-card-body";

  const topRow = document.createElement("div");
  topRow.className = "restaurant-card-top";

  const name = document.createElement("h3");
  name.className = "restaurant-card-name";
  name.textContent = restaurant.name;

  const ratingChip = document.createElement("div");
  ratingChip.className = "restaurant-rating-chip";
  ratingChip.innerHTML = `${STAR_SVG} <span>${restaurant.rating.toFixed(1)}</span>`;

  topRow.appendChild(name);
  topRow.appendChild(ratingChip);
  body.appendChild(topRow);

  // Meta row: {etaMin} mins • {cuisine}
  const metaRow = document.createElement("div");
  metaRow.className = "restaurant-card-meta";
  const etaText = t("Foodzy.mins", { n: restaurant.etaMin });
  metaRow.textContent = `${etaText} • ${restaurant.cuisine}`;
  body.appendChild(metaRow);

  // Secondary row: area • price for two • Pure veg tag
  const subRow = document.createElement("div");
  subRow.className = "restaurant-card-sub";

  const areaSpan = document.createElement("span");
  areaSpan.textContent = restaurant.area;

  const priceSpan = document.createElement("span");
  const priceStr = formatINR(restaurant.priceForTwo);
  priceSpan.textContent = t("Foodzy.forTwo", { price: priceStr });

  subRow.appendChild(areaSpan);
  subRow.appendChild(document.createTextNode(" • "));
  subRow.appendChild(priceSpan);

  if (restaurant.pureVeg) {
    const vegTag = document.createElement("span");
    vegTag.className = "restaurant-pureveg-tag";
    vegTag.textContent = t("Foodzy.pureVeg");
    subRow.appendChild(vegTag);
  }
  body.appendChild(subRow);

  // Search matches: "Dishes: ..."
  if (Array.isArray(matchedDishIds) && matchedDishIds.length > 0) {
    const dishesRow = document.createElement("div");
    dishesRow.className = "restaurant-dishes-match";

    const matchedDishes = matchedDishIds
      .map((id) => restaurant.menu.find((d) => d.id === id))
      .filter(Boolean);

    const firstTwo = matchedDishes.slice(0, 2).map((d) => d.name);
    let dishListStr = firstTwo.join(", ");
    const remaining = matchedDishes.length - 2;
    if (remaining > 0) {
      dishListStr += ` ${t("Foodzy.andMore", { n: remaining })}`;
    }

    dishesRow.textContent = t("Foodzy.dishes", { list: dishListStr });
    body.appendChild(dishesRow);
  }

  card.appendChild(body);
  return card;
}
