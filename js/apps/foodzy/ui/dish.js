// Renders dish item with veg/non-veg mark, bestseller badge, and ADD/stepper control.
// Uses formatINR from js/engine/money.js and foodimage.js.
// Used by restaurant screen.

import { formatINR } from "../../../engine/money.js";
import { createDishThumbnail } from "./foodimage.js";

const VEG_MARK_SVG = `
  <svg class="diet-mark veg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Vegetarian">
    <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--veg)" stroke-width="1.5"/>
    <circle cx="7" cy="7" r="3.5" fill="var(--veg)"/>
  </svg>
`;

const NONVEG_MARK_SVG = `
  <svg class="diet-mark non-veg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Non-vegetarian">
    <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--nonveg)" stroke-width="1.5"/>
    <polygon points="7,3.5 10.5,9.5 3.5,9.5" fill="var(--nonveg)"/>
  </svg>
`;

/**
 * Creates a dish menu row element.
 * @param {object} options
 * @param {object} options.dish Dish data { id, name, price, veg, bestseller, desc }
 * @param {number} [options.qty=0] Current quantity in cart
 * @param {(dishId: string) => void} options.onAdd
 * @param {(dishId: string) => void} options.onRemove
 * @returns {HTMLElement}
 */
export function createDishRow({ dish, qty = 0, onAdd, onRemove }) {
  const row = document.createElement("div");
  row.className = "dish-item-row";
  row.dataset.dishId = dish.id;

  const left = document.createElement("div");
  left.className = "dish-item-info";

  const markWrap = document.createElement("div");
  markWrap.className = "dish-diet-wrap";
  markWrap.innerHTML = dish.veg ? VEG_MARK_SVG : NONVEG_MARK_SVG;

  if (dish.bestseller) {
    const bTag = document.createElement("span");
    bTag.className = "dish-bestseller-tag";
    bTag.textContent = "Bestseller";
    markWrap.appendChild(bTag);
  }
  left.appendChild(markWrap);

  const name = document.createElement("h4");
  name.className = "dish-name";
  name.textContent = dish.name;
  left.appendChild(name);

  const price = document.createElement("div");
  price.className = "dish-price";
  price.textContent = formatINR(dish.price);
  left.appendChild(price);

  if (dish.desc) {
    const desc = document.createElement("p");
    desc.className = "dish-desc";
    desc.textContent = dish.desc;
    left.appendChild(desc);
  }

  // Right side: thumbnail and ADD / stepper button
  const right = document.createElement("div");
  right.className = "dish-item-action";

  const thumb = createDishThumbnail(dish);
  right.appendChild(thumb);

  const btnContainer = document.createElement("div");
  btnContainer.className = "dish-btn-container";

  if (qty > 0) {
    // Stepper: [-] [qty] [+]
    const stepper = document.createElement("div");
    stepper.className = "dish-stepper";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "dish-step-btn minus";
    minusBtn.textContent = "-";
    minusBtn.setAttribute("aria-label", "Decrease quantity");
    minusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      onRemove(dish.id);
    });

    const countSpan = document.createElement("span");
    countSpan.className = "dish-step-qty";
    countSpan.textContent = String(qty);

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "dish-step-btn plus";
    plusBtn.textContent = "+";
    plusBtn.setAttribute("aria-label", "Increase quantity");
    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      onAdd(dish.id);
    });

    stepper.appendChild(minusBtn);
    stepper.appendChild(countSpan);
    stepper.appendChild(plusBtn);
    btnContainer.appendChild(stepper);
  } else {
    // Plain ADD button
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "dish-add-btn";
    addBtn.textContent = "ADD";
    addBtn.setAttribute("aria-label", `Add ${dish.name} to cart`);
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      onAdd(dish.id);
    });
    btnContainer.appendChild(addBtn);
  }

  right.appendChild(btnContainer);

  row.appendChild(left);
  row.appendChild(right);
  return row;
}
