// Creates restaurant images with fallback gradients and drawn dish thumbnails.
// Uses plain DOM APIs and inline SVG icons.
// Used by restaurant cards, restaurant screen, and dish UI.

const WARM_GRADIENTS = [
  "linear-gradient(135deg, #FFEDD5 0%, #FDBA74 100%)",
  "linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)",
  "linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)",
  "linear-gradient(135deg, #E0E7FF 0%, #A5B4FC 100%)",
  "linear-gradient(135deg, #DCFCE7 0%, #86EFAC 100%)",
  "linear-gradient(135deg, #FFEDD5 0%, #FB923C 100%)"
];

const PLATE_SVG = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
  </svg>
`;

/**
 * Creates fallback art for a restaurant.
 * @param {string} name Restaurant name
 * @param {number} index Position in restaurant list
 * @returns {HTMLElement}
 */
export function createRestaurantFallback(name, index = 0) {
  const el = document.createElement("div");
  el.className = "restaurant-fallback-art";
  el.style.background = WARM_GRADIENTS[index % WARM_GRADIENTS.length];

  const letter = document.createElement("span");
  letter.className = "fallback-letter";
  letter.textContent = name ? name.charAt(0).toUpperCase() : "R";

  const icon = document.createElement("div");
  icon.className = "fallback-icon";
  icon.innerHTML = PLATE_SVG;

  el.appendChild(letter);
  el.appendChild(icon);
  return el;
}

/**
 * Creates an image container for a restaurant card (photo with fallback).
 * @param {object} restaurant
 * @param {number} index
 * @returns {HTMLElement}
 */
export function createRestaurantImage(restaurant, index = 0) {
  const container = document.createElement("div");
  container.className = "restaurant-image-container";

  if (restaurant.image) {
    const img = document.createElement("img");
    img.src = `assets/food/shops/${restaurant.image}`;
    img.alt = restaurant.name;
    if (index === 0) {
      img.fetchPriority = "high";
      img.loading = "eager";
    } else {
      img.loading = "lazy";
    }
    img.decoding = "async";
    img.className = "restaurant-img";

    img.onerror = () => {
      img.remove();
      const fallback = createRestaurantFallback(restaurant.name, index);
      container.appendChild(fallback);
    };

    container.appendChild(img);
  } else {
    container.appendChild(createRestaurantFallback(restaurant.name, index));
  }

  return container;
}

/**
 * Creates a dish thumbnail (photo with fallback plate SVG).
 * @param {object|boolean} dishOrVeg Dish object or veg boolean
 * @returns {HTMLElement}
 */
export function createDishThumbnail(dishOrVeg) {
  const isVeg = typeof dishOrVeg === "object" && dishOrVeg !== null ? Boolean(dishOrVeg.veg) : Boolean(dishOrVeg);
  const dish = typeof dishOrVeg === "object" && dishOrVeg !== null ? dishOrVeg : null;
  const thumb = document.createElement("div");
  thumb.className = `dish-thumbnail ${isVeg ? "veg" : "non-veg"}`;

  if (dish && dish.image) {
    const img = document.createElement("img");
    img.src = `assets/food/dishes/${dish.image}`;
    img.alt = dish.name || "Dish";
    img.loading = "lazy";
    img.decoding = "async";
    img.className = "dish-img";

    img.onerror = () => {
      img.remove();
      thumb.innerHTML = PLATE_SVG;
    };

    thumb.appendChild(img);
  } else {
    thumb.innerHTML = PLATE_SVG;
  }

  return thumb;
}
