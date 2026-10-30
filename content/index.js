// Lists all locked content. The game reads content only through js/content.js.
// Locked content. A new app adds one import and one line in APP_CONTENT.
// Used by js/content.js and tools/verify-content.mjs.

import { LAYERS } from "./layers.js";
import { APPS } from "./apps.js";
import { APP as Foodzy } from "./apps/Foodzy/app.js";
import { RESTAURANTS as Foodzy_RESTAURANTS } from "./apps/Foodzy/restaurants.js";
import { JOURNEYS as Foodzy_JOURNEYS } from "./apps/Foodzy/journeys.js";

export const CONTENT_VERSION = "1.0.0";

export { LAYERS, APPS };

// Content for every live app, by app id.
export const APP_CONTENT = {
  Foodzy: {
    app: Foodzy,
    restaurants: Foodzy_RESTAURANTS,
    journeys: Foodzy_JOURNEYS
  }
};
