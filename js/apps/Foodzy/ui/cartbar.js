// Floating cart summary bar sliding up from the bottom of the phone.
// Uses js/copy.js and formatINR from js/engine/money.js.
// Used by Foodzy home and restaurant screens.

import { t } from "../../../copy.js";
import { formatINR } from "../../../engine/money.js";
import { getItemCount, getBill } from "../state.js";

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
  rightBtn.textContent = t("Foodzy.viewCart");
  rightBtn.addEventListener("click", () => onViewCart());

  bar.appendChild(left);
  bar.appendChild(rightBtn);

  function update() {
    const count = getItemCount();
    if (count > 0) {
      const b = getBill();
      const totalStr = formatINR(b.total);
      countTotalText.textContent = t("cart.bar", { n: count, total: totalStr });
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
