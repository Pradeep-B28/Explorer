// Renders the Server layer with a live Node.js API request log.
// Uses standard DOM text nodes and timestamp formatting.
// Used by ui/exploded.js.

/**
 * Formats current timestamp as [hh:mm:ss].
 * @returns {string}
 */
function getTimestamp() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `[${h}:${m}:${s}]`;
}

/**
 * Creates and mounts the Server layer terminal log.
 * @param {HTMLElement} container
 * @returns {{ addLog: (line: string, immediate?: boolean) => Promise<void>, reset: () => void }}
 */
export function createServerLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-server-content";

  // Terminal Window Chrome
  const windowBar = document.createElement("div");
  windowBar.className = "server-window-bar";

  const dots = document.createElement("div");
  dots.className = "server-window-dots";
  ["red", "yellow", "green"].forEach(color => {
    const dot = document.createElement("span");
    dot.className = `server-dot dot-${color}`;
    dots.appendChild(dot);
  });

  const title = document.createElement("span");
  title.className = "server-window-title";
  title.textContent = "api.Foodzy.example : 3000";

  windowBar.appendChild(dots);
  windowBar.appendChild(title);
  root.appendChild(windowBar);

  // Terminal Body
  const termBody = document.createElement("div");
  termBody.className = "server-terminal-body";
  root.appendChild(termBody);

  const lines = [];

  function renderLines() {
    termBody.replaceChildren();
    lines.slice(-6).forEach(item => {
      const lineEl = document.createElement("div");
      lineEl.className = "server-log-line";

      const timeEl = document.createElement("span");
      timeEl.className = "server-log-time";
      timeEl.textContent = item.time;

      const msgEl = document.createElement("span");
      msgEl.className = "server-log-msg";
      msgEl.textContent = " " + item.text;

      lineEl.appendChild(timeEl);
      lineEl.appendChild(msgEl);
      termBody.appendChild(lineEl);
    });
  }

  function reset() {
    lines.length = 0;
    lines.push(
      { time: "[10:42:00]", text: "api.Foodzy.example ready on port 3000" },
      { time: "[10:42:01]", text: "Waiting for requests..." }
    );
    renderLines();
  }

  /**
   * Adds a new log entry, typing it in character by character.
   * @param {string} text
   * @param {boolean} [immediate=false]
   * @returns {Promise<void>}
   */
  async function addLog(text, immediate = false) {
    const time = getTimestamp();
    const entry = { time, text: immediate ? text : "" };
    lines.push(entry);
    renderLines();

    if (immediate) return;

    // Type in text at 18ms per char
    const chars = text.split("");
    for (let i = 0; i < chars.length; i++) {
      entry.text += chars[i];
      renderLines();
      await new Promise(r => setTimeout(r, 18));
    }
  }

  reset();
  container.replaceChildren(root);

  return {
    addLog,
    reset
  };
}
