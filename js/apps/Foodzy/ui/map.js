// Draws SVG live tracking map with roads, pins, route, and rider marker.
// Uses plain SVG DOM APIs and tokens.
// Used by Foodzy track screen.

/**
 * Creates the SVG tracking map.
 * @param {object} options
 * @param {string} options.shopName
 * @param {number} [options.progress=0.6] Initial progress of rider along the route (0 to 1)
 * @returns {{ element: HTMLElement, setRiderProgress: (p: number) => void }}
 */
export function createTrackingMap({ shopName, progress = 0.6 }) {
  const container = document.createElement("div");
  container.className = "tracking-map-container";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 360 260");
  svg.setAttribute("class", "tracking-svg-map");
  svg.setAttribute("aria-hidden", "true");

  // Land background
  const land = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  land.setAttribute("width", "360");
  land.setAttribute("height", "260");
  land.setAttribute("fill", "var(--map-land)");
  svg.appendChild(land);

  // Roads
  const roads = [
    "M -10 60 Q 120 70 370 50",
    "M 70 -10 Q 90 140 110 270",
    "M 250 -10 Q 240 130 260 270",
    "M -10 180 Q 180 190 370 170",
    "M 130 55 L 250 180"
  ];

  roads.forEach((d) => {
    const road = document.createElementNS("http://www.w3.org/2000/svg", "path");
    road.setAttribute("d", d);
    road.setAttribute("stroke", "var(--map-road)");
    road.setAttribute("stroke-width", "16");
    road.setAttribute("fill", "none");
    road.setAttribute("stroke-linecap", "round");
    svg.appendChild(road);
  });

  // Delivery Route (curved path from restaurant (60, 60) to home (290, 190))
  const routePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const routeD = "M 70 65 C 140 60, 130 160, 280 185";
  routePath.setAttribute("d", routeD);
  routePath.setAttribute("stroke", "var(--Foodzy)");
  routePath.setAttribute("stroke-width", "4");
  routePath.setAttribute("stroke-dasharray", "6 4");
  routePath.setAttribute("fill", "none");
  routePath.setAttribute("stroke-linecap", "round");
  svg.appendChild(routePath);

  // Restaurant pin
  const shopGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  shopGroup.setAttribute("transform", "translate(70, 65)");
  shopGroup.innerHTML = `
    <circle r="14" fill="var(--Foodzy)"/>
    <text text-anchor="middle" dy="4" fill="#FFFFFF" font-size="10" font-weight="700">R</text>
  `;
  svg.appendChild(shopGroup);

  // Home pin
  const homeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  homeGroup.setAttribute("transform", "translate(280, 185)");
  homeGroup.innerHTML = `
    <circle r="14" fill="var(--brand)"/>
    <path d="M -5 3 L 0 -3 L 5 3 Z" fill="#FFFFFF"/>
    <rect x="-3" y="2" width="6" height="5" fill="#FFFFFF"/>
  `;
  svg.appendChild(homeGroup);

  // Rider marker
  const riderGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  riderGroup.className = "rider-marker-group";
  riderGroup.innerHTML = `
    <circle r="16" fill="var(--surface)" stroke="var(--Foodzy)" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
    <circle r="10" fill="var(--Foodzy)"/>
    <circle r="3" fill="#FFFFFF"/>
  `;
  svg.appendChild(riderGroup);

  container.appendChild(svg);

  function setRiderProgress(p) {
    try {
      const totalLen = routePath.getTotalLength();
      const pt = routePath.getPointAtLength(Math.max(0, Math.min(1, p)) * totalLen);
      riderGroup.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
    } catch (e) {
      // Fallback
      riderGroup.setAttribute("transform", `translate(170, 120)`);
    }
  }

  // Initial position
  requestAnimationFrame(() => {
    setRiderProgress(progress);
  });

  return { element: container, setRiderProgress };
}
