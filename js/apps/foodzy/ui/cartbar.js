// Floating cart summary bar sliding up from the bottom of the phone.
// Uses js/copy.js and cartBarLabel from js/engine/foodzy/values.js.
// Used by Foodzy home and restaurant screens.

import { t } from "../../../copy.js";
import { getAppContent } from "../../../content.js";
import { cartBarLabel } from "../../../engine/foodzy/values.js";
import { getItemCount, getCart } from "../state.js";

const { app, restaurants } = getAppContent("foodzy");
const data = { app, restaurants };

/**
 * Creates the floating bottom cart bar.
 * @param {(action: string) => void} onViewCart Callback when "View cart" is tapped
 * @returns {{ element: HTMLElement, update: () => void }}
 */
export function createCartBar(onViewCart) {
  const bar = document.createElement("aside");
  bar.className = "foodzy-cart-bar";
  bar.setAttribute("aria-label", "Cart summary");

  const left = document.createElement("div");
  left.className = "cart-bar-left";

  const countTotalText = document.createElement("span");
  countTotalText.className = "cart-bar-text";
  left.appendChild(countTotalText);

  const rightBtn = document.createElement("button");
  rightBtn.type = "button";
  rightBtn.className = "cart-bar-btn";
  rightBtn.textContent = t("foodzy.viewCart");
  rightBtn.addEventListener("click", () => onViewCart());

  bar.appendChild(left);
  bar.appendChild(rightBtn);

  function update() {
    const count = getItemCount();
    if (count > 0) {
      countTotalText.textContent = cartBarLabel(getCart(), data, t);
      bar.classList.add("visible");
      bar.removeAttribute("hidden");
    } else {
      bar.classList.remove("visible");
      bar.setAttribute("hidden", "");
    }
  }

  update();
  return { element: bar, update };
}
