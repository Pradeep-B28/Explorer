// The 5 layers every app in this project splits into, top to bottom.
// Locked content. The order here is the stack order (index 0 is the top).
// Used by js/content.js and js/engine/journey.js (through content.js).

export const LAYERS = [
  {
    id: "screen",
    name: "Screen",
    tech: "HTML",
    oneLine: "What you see and tap.",
    more: "Every button, word and picture on the page is written in HTML."
  },
  {
    id: "styling",
    name: "Styling",
    tech: "CSS",
    oneLine: "How it looks and moves.",
    more: "Colours, spacing, fonts and animations all come from CSS."
  },
  {
    id: "logic",
    name: "Logic",
    tech: "JavaScript",
    oneLine: "What happens when you tap.",
    more: "JavaScript listens for your taps, keeps track of things and talks to the server."
  },
  {
    id: "server",
    name: "Server",
    tech: "Node.js API",
    oneLine: "The checker on the internet.",
    more: "The server checks every request, applies the rules and decides what happens."
  },
  {
    id: "database",
    name: "Database",
    tech: "PostgreSQL",
    oneLine: "Where everything is saved.",
    more: "Orders, menus and users are stored here as rows in tables, so nothing is lost."
  }
];
