# Content schema

Everything in `content/` is locked. Gemini reads it and never edits it. `node tools/verify-content.mjs` checks every rule below.

## layers.js

`LAYERS`: exactly 5, in stack order (index 0 is the top): `screen`, `styling`, `logic`, `server`, `database`.

| Field | Meaning |
|---|---|
| `id` | One of the 5 ids |
| `name` | Label on the layer chip, e.g. "Server" |
| `tech` | The technology, e.g. "Node.js API" |
| `oneLine` | Short line under the chip, 40 characters max |
| `more` | Tooltip and student text, 110 characters max |

## apps.js

`APPS`: the app registry. `id` (2 to 12 lowercase letters), `name`, `kind`, `status` (`live` or `soon`), `teaser`. Every `live` app has an entry in `APP_CONTENT` in `index.js`.

## apps/Foodzy/app.js

| Field | Meaning |
|---|---|
| `name`, `domain`, `tagline` | Shown in the phone's header and the address bar. `domain` ends in `.example` |
| `user` | `firstName`, `area`, `address` of the made-up customer |
| `riderName` | The delivery rider in the tracking flow |
| `offerBanner` | Home banner. `{freeAbove}` is filled with `formatINR(fees.freeDeliveryAbove)` |
| `categories` | Chips on the home screen. Tapping one runs a search for that word. Each finds at least 1 restaurant |
| `fees` | `delivery`, `freeDeliveryAbove`, `platform`, `gstPercent`. Only `js/engine/Foodzy/cart.js` uses them |
| `orders` | `prefix` and `start` for order numbers. Only `orders.js` uses them |
| `payment` | Payment method shown on the cart screen ("UPI") |
| `demoCart` | The cart "Do it for me" and demo mode build for the order flow |
| `seedOrders` | 2 older rows shown in the Database layer's orders table |

## apps/Foodzy/restaurants.js

`RESTAURANTS`: `id` (r1), `name` (26 max), `cuisine`, `area`, `rating` (3.0 to 5.0, one decimal), `etaMin` (10 to 60), `priceForTwo`, `pureVeg`, `image`, `menu`.

`image` is a file name in `assets/food/`. The file is optional. If it is missing or fails to load, draw the fallback (Section 6D of the brief).

Each dish: `id` (r1i1), `name` (26 max), `price` (whole rupees), `veg`, `bestseller`, `desc` (70 max). A `pureVeg` restaurant has only veg dishes.

## apps/Foodzy/journeys.js

`JOURNEYS`: `add`, `search`, `order`, `track`, in that order.

| Field | Meaning |
|---|---|
| `id`, `title` | Flow id and its name in the panel |
| `trigger.on` | The app action that starts it: `add`, `search`, `place-order`, `track` |
| `trigger.needs` | What must exist first: `none`, `results` (search found something), `cart` (cart not empty), `order` (an order was placed) |
| `tryThis` | Hint shown in the panel before the flow starts |
| `lesson` | One line shown when the flow ends |
| `values` | Every `{placeholder}` the steps use |
| `demoValues` | The values for demo mode and "Do it for me". The content check proves they match the engine |
| `steps` | 3 to 10 steps, below |

Each step:

| Field | Meaning |
|---|---|
| `id` | `<journey>-<n>` |
| `layer` | Which layer lights up |
| `title` | Step heading, 32 max |
| `say` | The plain English line, 160 max |
| `code` | `lang` (`html`, `css`, `js`, `sql`, `text`) and 1 to 5 `lines`, 60 characters max each |
| `packet` | `label` (on the travelling chip) and `data` (the small JSON shown in the panel) |
| `log` | Server steps only: the line added to the Server layer's request log |
| `db` | Database steps only: `table`, `action` (`select`, `insert`, `update`), `columns`, `row` |
| `commit` | On exactly one Styling step: the moment the phone screen actually changes |
| `ms` | How long the step lasts at 1x, travel included |

### Placeholders

`{name}` (a letter, then letters or digits, no spaces) is filled by `js/engine/template.js`. A value that is exactly `"{total}"` keeps its type, so packets show `388`, not `"388"`. Code must never contain `${...}` (JavaScript template strings), because it would look like a placeholder.

### Rules

- The last step is on Screen. The first is on Screen (a tap) or Server (news from outside the phone).
- The commit step comes after every Server and Database step.
- Two steps in a row are never on the same layer, except Server.
- `add` never reaches Server or Database. `order` uses all 5 layers. `track` starts on Server.
