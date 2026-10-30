// Lists all locked content. The site reads content only through js/content.js.
// Locked content. A new app adds its imports and one entry in APP_CONTENT.
// Used by js/content.js and tools/verify-content.mjs.

import { LAYERS } from "./layers.js";
import { APPS } from "./apps.js";
import { APP as FOODZY } from "./apps/foodzy/app.js";
import { RESTAURANTS as FOODZY_RESTAURANTS } from "./apps/foodzy/restaurants.js";
import { JOURNEYS as FOODZY_JOURNEYS } from "./apps/foodzy/journeys.js";

export const CONTENT_VERSION = "2.0.0";

export { LAYERS, APPS };

// Content for every live app, by app id.
export const APP_CONTENT = {
  foodzy: {
    app: FOODZY,
    restaurants: FOODZY_RESTAURANTS,
    journeys: FOODZY_JOURNEYS
  }
};
