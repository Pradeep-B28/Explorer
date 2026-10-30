// Foodzy home screen displaying location header, search, offers, categories, and restaurants.
// Uses Foodzy state, UI cards, cartbar, toast, and copy.js.
// Used by Foodzy app index.js.

import { getAppContent, CONFIG } from "../../../content.js";
import { t } from "../../../copy.js";
import { formatINR } from "../../../engine/money.js";
import { fillText } from "../../../engine/template.js";
import { showToast } from "../../../ui/toast.js";
import { createRestaurantCard } from "../ui/card.js";
import { createCartBar } from "../ui/cartbar.js";
import {
  getSearchState,
  executeSearch,
  clearSearch,
  navigate,
  subscribe
} from "../state.js";

const { app } = getAppContent("Foodzy");

const LOCATION_PIN_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--Foodzy)" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
`;

const SEARCH_ICON_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
`;

export function mount(container, ctx = {}) {
  const root = document.createElement("div");
  root.className = "foodzy-screen foodzy-home-screen";

  // Location Row
  const locRow = document.createElement("header");
  locRow.className = "foodzy-loc-row";

  const locLeft = document.createElement("div");
  locLeft.className = "foodzy-loc-left";
  locLeft.innerHTML = LOCATION_PIN_SVG;

  const locText = document.createElement("div");
  locText.className = "foodzy-loc-text";
  const locTitle = document.createElement("span");
  locTitle.className = "foodzy-loc-title";
  locTitle.textContent = "Home";
  const locArea = document.createElement("span");
  locArea.className = "foodzy-loc-area";
  locArea.textContent = app.user.area;
  locText.appendChild(locTitle);
  locText.appendChild(locArea);
  locLeft.appendChild(locText);

  const avatarBtn = document.createElement("button");
  avatarBtn.type = "button";
  avatarBtn.className = "foodzy-avatar-btn";
  avatarBtn.setAttribute("aria-label", "User profile demo");
  avatarBtn.textContent = app.user.firstName ? app.user.firstName.charAt(0) : "P";
  avatarBtn.addEventListener("click", () => {
    showToast(t("demo.toast"), container);
  });

  locRow.appendChild(locLeft);
  locRow.appendChild(avatarBtn);
  root.appendChild(locRow);

  // Search Bar
  const searchWrap = document.createElement("div");
  searchWrap.className = "foodzy-search-wrap";

  const searchBox = document.createElement("div");
  searchBox.className = "foodzy-search-box";

  const searchIcon = document.createElement("span");
  searchIcon.className = "search-box-icon";
  searchIcon.innerHTML = SEARCH_ICON_SVG;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "foodzy-search-input";
  input.placeholder = t("Foodzy.searchPlaceholder");
  input.setAttribute("aria-label", t("Foodzy.searchPlaceholder"));

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "search-clear-btn";
  clearBtn.textContent = "×";
  clearBtn.setAttribute("aria-label", "Clear search");
  clearBtn.setAttribute("hidden", "");

  searchBox.appendChild(searchIcon);
  searchBox.appendChild(input);
  searchBox.appendChild(clearBtn);
  searchWrap.appendChild(searchBox);
  root.appendChild(searchWrap);

  // Debounced search handling
  let debounceTimer = null;
  input.addEventListener("input", () => {
    const val = input.value;
    if (val.trim().length > 0) {
      clearBtn.removeAttribute("hidden");
    } else {
      clearBtn.setAttribute("hidden", "");
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      executeSearch(val);
    }, CONFIG.limits.searchDebounceMs || 300);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (debounceTimer) clearTimeout(debounceTimer);
      executeSearch(input.value);
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.setAttribute("hidden", "");
    clearSearch();
    input.focus();
  });

  // Offer Banner
  const banner = document.createElement("div");
  banner.className = "foodzy-offer-banner";
  banner.tabIndex = 0;
  banner.setAttribute("role", "button");
  banner.setAttribute("aria-label", "Special offer banner");
  const freeAboveStr = formatINR(app.fees.freeDeliveryAbove);
  banner.textContent = fillText(app.offerBanner, { freeAbove: freeAboveStr });
  banner.addEventListener("click", () => showToast(t("demo.toast"), container));
  root.appendChild(banner);

  // Category Chips
  const catWrap = document.createElement("div");
  catWrap.className = "foodzy-categories-scroll";
  app.categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "foodzy-category-chip";
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      input.value = cat;
      clearBtn.removeAttribute("hidden");
      executeSearch(cat);
    });
    catWrap.appendChild(chip);
  });
  root.appendChild(catWrap);

  // Restaurant List Section
  const listSection = document.createElement("section");
  listSection.className = "foodzy-list-section";

  const listHeader = document.createElement("div");
  listHeader.className = "foodzy-list-header";
  const listTitle = document.createElement("h2");
  listTitle.className = "foodzy-section-title";
  listHeader.appendChild(listTitle);
  listSection.appendChild(listHeader);

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "foodzy-cards-container";
  listSection.appendChild(cardsContainer);

  root.appendChild(listSection);

  // Cart bar
  const cartBar = createCartBar(() => {
    navigate("cart");
  });
  root.appendChild(cartBar.element);

  function renderList() {
    const s = getSearchState();
    cardsContainer.replaceChildren();

    if (s.active) {
      const count = s.results.length;
      const countStr = t("search.count", { n: count });
      listTitle.textContent = `${t("Foodzy.resultsFor", { query: s.query })} (${countStr})`;

      if (count === 0) {
        const empty = document.createElement("div");
        empty.className = "foodzy-no-results";
        empty.textContent = t("Foodzy.noResults", { query: s.query });
        cardsContainer.appendChild(empty);
      } else {
        s.results.forEach((r, idx) => {
          const card = createRestaurantCard({
            restaurant: r,
            index: idx,
            matchedDishIds: r.dishes || null,
            onClick: (rId) => navigate("restaurant", { restaurantId: rId })
          });
          cardsContainer.appendChild(card);
        });
      }
    } else {
      listTitle.textContent = t("Foodzy.nearYou");
      s.results.forEach((r, idx) => {
        const card = createRestaurantCard({
          restaurant: r,
          index: idx,
          onClick: (rId) => navigate("restaurant", { restaurantId: rId })
        });
        cardsContainer.appendChild(card);
      });
    }

    cartBar.update();
  }

  const unsubscribe = subscribe(() => {
    renderList();
  });

  renderList();
  container.replaceChildren(root);

  return {
    unmount() {
      unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
      root.remove();
    }
  };
}
