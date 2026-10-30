// Displays non-intrusive floating toasts inside or outside the phone.
// Uses plain DOM APIs and styles/phone.css.
// Used by Foodzy UI, stage.js, and panel.js.

let activeToast = null;
let toastTimeout = null;

/**
 * Shows a toast message inside the target container (or body).
 * @param {string} message Text to display
 * @param {HTMLElement} [container=document.body] Container element
 * @param {number} [duration=2500] Time in milliseconds before disappearing
 */
export function showToast(message, container = document.body, duration = 2500) {
  if (activeToast) {
    if (toastTimeout) clearTimeout(toastTimeout);
    activeToast.remove();
    activeToast = null;
  }

  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  // Safety: textContent only (Hard Rule 11)
  toast.textContent = message;

  container.appendChild(toast);
  activeToast = toast;

  // Trigger enter transition
  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
      if (activeToast === toast) {
        activeToast = null;
      }
    }, 250);
  }, duration);
}
