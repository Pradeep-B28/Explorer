// Renders modal dialogs like the new cart confirmation dialog.
// Uses plain DOM APIs and styles/phone.css.
// Used by Foodzy state and screens.

/**
 * Shows a confirmation dialog inside a container.
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.body
 * @param {string} [options.keepText="Keep my cart"]
 * @param {string} [options.startText="Start new cart"]
 * @param {Function} [options.onKeep]
 * @param {Function} [options.onStart]
 * @param {HTMLElement} options.container
 */
export function showConfirmDialog({
  title,
  body,
  keepText = "Keep my cart",
  startText = "Start new cart",
  onKeep = () => {},
  onStart = () => {},
  container
}) {
  const overlay = document.createElement("div");
  overlay.className = "app-dialog-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const dialog = document.createElement("div");
  dialog.className = "app-dialog-card";

  const heading = document.createElement("h3");
  heading.className = "app-dialog-title";
  heading.textContent = title;

  const desc = document.createElement("p");
  desc.className = "app-dialog-body";
  desc.textContent = body;

  const actions = document.createElement("div");
  actions.className = "app-dialog-actions";

  const keepBtn = document.createElement("button");
  keepBtn.type = "button";
  keepBtn.className = "app-dialog-btn secondary";
  keepBtn.textContent = keepText;
  keepBtn.addEventListener("click", () => {
    overlay.remove();
    onKeep();
  });

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.className = "app-dialog-btn primary";
  startBtn.textContent = startText;
  startBtn.addEventListener("click", () => {
    overlay.remove();
    onStart();
  });

  actions.appendChild(keepBtn);
  actions.appendChild(startBtn);

  dialog.appendChild(heading);
  dialog.appendChild(desc);
  dialog.appendChild(actions);
  overlay.appendChild(dialog);

  container.appendChild(overlay);

  // Focus the start button for accessibility
  requestAnimationFrame(() => {
    startBtn.focus();
  });
}
