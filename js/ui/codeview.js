// Renders syntax-highlighted code blocks with animated typing using text nodes only.
// Uses plain DOM APIs and tokens.css variables (zero innerHTML).
// Used by ui/panel.js.

import { prefersReducedMotion } from "../motion.js";

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "await", "async", "if", "else",
  "new", "import", "export", "from", "for", "while", "try", "catch", "class",
  "true", "false", "null", "undefined", "default", "case", "switch"
]);

const SQL_KEYWORDS = new Set([
  "SELECT", "DISTINCT", "FROM", "JOIN", "ON", "WHERE", "INSERT", "INTO",
  "VALUES", "RETURNING", "ILIKE", "AND", "OR", "AS", "BY", "ORDER", "UPDATE", "SET"
]);

const CSS_PROPERTIES = new Set([
  "animation", "animation-delay", "transform", "stroke-dasharray", "stroke-dashoffset",
  "transition", "background", "color", "display", "opacity", "padding", "margin"
]);

/**
 * Tokenizes a single code line into an array of { type, text } objects.
 * @param {string} line
 * @param {string} lang "html" | "css" | "js" | "sql" | "text"
 * @returns {Array<{ type: string, text: string }>}
 */
export function tokenizeLine(line, lang) {
  if (lang === "text" || !line) {
    return [{ type: "plain", text: line }];
  }

  const tokens = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    const ch = line[i];

    // Comments
    if (line.slice(i, i + 2) === "//" || line.slice(i, i + 2) === "/*" || line.slice(i, i + 4) === "<!--") {
      tokens.push({ type: "comment", text: line.slice(i) });
      break;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let str = quote;
      i++;
      while (i < len && line[i] !== quote) {
        if (line[i] === "\\" && i + 1 < len) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < len) {
        str += quote;
        i++;
      }
      tokens.push({ type: "string", text: str });
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      let num = "";
      while (i < len && /[\d.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: "number", text: num });
      continue;
    }

    // HTML Tags and attributes
    if (lang === "html") {
      if (ch === "<" || ch === ">" || ch === "/") {
        tokens.push({ type: "punct", text: ch });
        i++;
        continue;
      }
      if (/[a-zA-Z]/.test(ch)) {
        let word = "";
        while (i < len && /[a-zA-Z0-9_-]/.test(line[i])) {
          word += line[i];
          i++;
        }
        const prev = tokens[tokens.length - 1];
        if (prev && (prev.text === "<" || prev.text === "/")) {
          tokens.push({ type: "tag", text: word });
        } else if (line[i] === "=" || (line[i] === " " && line.slice(i).includes("="))) {
          tokens.push({ type: "attr", text: word });
        } else {
          tokens.push({ type: "tag", text: word });
        }
        continue;
      }
    }

    // Words / Keywords / Properties
    if (/[a-zA-Z_$]/.test(ch)) {
      let word = "";
      while (i < len && /[a-zA-Z0-9_$-]/.test(line[i])) {
        word += line[i];
        i++;
      }

      if (lang === "js" && JS_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word });
      } else if (lang === "sql" && SQL_KEYWORDS.has(word.toUpperCase())) {
        tokens.push({ type: "keyword", text: word.toUpperCase() });
      } else if (lang === "css" && (CSS_PROPERTIES.has(word) || line[i] === ":")) {
        tokens.push({ type: "prop", text: word });
      } else {
        tokens.push({ type: "plain", text: word });
      }
      continue;
    }

    // Punctuation and whitespace
    if (/[\s]/.test(ch)) {
      let ws = "";
      while (i < len && /[\s]/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ type: "plain", text: ws });
      continue;
    }

    // Other punctuation
    tokens.push({ type: "punct", text: ch });
    i++;
  }

  return tokens;
}

/**
 * Renders syntax highlighted code into container using text nodes only.
 * @param {HTMLElement} container
 * @param {{ lang: string, lines: string[] }} codeData
 * @param {object} [options]
 * @param {boolean} [options.typing=true]
 * @param {() => void} [options.onComplete]
 * @returns {{ cancel: () => void }}
 */
export function renderCodeView(container, codeData, options = {}) {
  container.replaceChildren();

  const pre = document.createElement("pre");
  pre.className = "codeview-pre";
  pre.style.margin = "0";

  const { lang = "text", lines = [] } = codeData;
  const isTyping = options.typing !== false && !prefersReducedMotion();

  // Pre-tokenize all lines
  const allTokens = [];
  lines.forEach(l => {
    const tokens = tokenizeLine(l, lang);
    allTokens.push(tokens);
  });

  const totalChars = lines.join("\n").length;
  // Capped at 600 ms maximum for step
  const totalTypingMs = Math.min(600, totalChars * 18);
  const charDelay = totalChars > 0 ? totalTypingMs / totalChars : 0;

  let cancelled = false;
  let timerId = null;

  if (!isTyping || totalChars === 0) {
    allTokens.forEach((lineTokens, lineIdx) => {
      const lineEl = document.createElement("div");
      lineEl.className = "codeview-line";
      lineTokens.forEach(tok => {
        const span = document.createElement("span");
        if (tok.type !== "plain") {
          span.className = `tok-${tok.type}`;
        }
        span.textContent = tok.text;
        lineEl.appendChild(span);
      });
      pre.appendChild(lineEl);
    });
    container.appendChild(pre);
    if (typeof options.onComplete === "function") options.onComplete();
    return { cancel: () => {} };
  }

  // Animated typing: build empty token elements and stream text
  container.appendChild(pre);
  const tokenSpans = [];

  allTokens.forEach(lineTokens => {
    const lineEl = document.createElement("div");
    lineEl.className = "codeview-line";
    lineTokens.forEach(tok => {
      const span = document.createElement("span");
      if (tok.type !== "plain") {
        span.className = `tok-${tok.type}`;
      }
      lineEl.appendChild(span);
      tokenSpans.push({ element: span, text: tok.text, offset: 0 });
    });
    pre.appendChild(lineEl);
  });

  let currentSpanIdx = 0;

  function typeNext() {
    if (cancelled) return;
    if (currentSpanIdx >= tokenSpans.length) {
      if (typeof options.onComplete === "function") options.onComplete();
      return;
    }

    const current = tokenSpans[currentSpanIdx];
    current.offset++;
    current.element.textContent = current.text.slice(0, current.offset);

    if (current.offset >= current.text.length) {
      currentSpanIdx++;
    }

    timerId = setTimeout(typeNext, charDelay);
  }

  typeNext();

  return {
    cancel() {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      // Immediately reveal remaining text
      tokenSpans.forEach(s => {
        s.element.textContent = s.text;
      });
    }
  };
}
