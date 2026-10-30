// Foodzy's 4 journeys: what happens in each layer when the user does something.
// Locked content. Words in {braces} are filled with live values by js/engine/journey.js.
// Used by content/index.js, the journey player and tools/verify-content.mjs.

export const JOURNEYS = [
  // ---------------------------------------------------------------- 1. Add to cart
  {
    id: "add",
    title: "Add to cart",
    trigger: { on: "add", needs: "none" },
    tryThis: "Tap Add on any dish.",
    lesson: "Not every tap goes to the server. Some work happens right on your phone.",
    values: ["itemId", "itemName", "priceLabel", "cartCount", "cartLabel"],
    demoValues: { itemId: "r1i1", itemName: "Chicken Dum Biryani", priceLabel: "₹289", cartCount: 1, cartLabel: "1 item, ₹289" },
    steps: [
      {
        id: "add-1",
        layer: "screen",
        title: "You tap Add",
        say: "You tap Add on {itemName}. The button carries the dish's id, so the app knows exactly which dish you picked.",
        code: { lang: "html", file: "public/menu.html", lines: [
          "<article class=\"dish\" data-id=\"{itemId}\">",
          "  <img src=\"/img/dishes/{itemId}.jpg\" alt=\"\">",
          "  <div class=\"dish-info\">",
          "    <h3>{itemName}</h3>",
          "    <p class=\"price\">{priceLabel}</p>",
          "  </div>",
          "  <button class=\"add\" data-id=\"{itemId}\">",
          "    ADD",
          "  </button>",
          "</article>"
        ] },
        packet: { label: "tap", data: { tap: "ADD", item: "{itemId}" } },
        ms: 1800
      },
      {
        id: "add-2",
        layer: "logic",
        title: "The app updates your cart",
        say: "JavaScript adds {itemName} to your cart and saves it on your phone. No internet is needed for this step.",
        code: { lang: "js", file: "public/js/cart.js", lines: [
          "const cart = loadCart(); // saved on this phone",
          "",
          "menu.addEventListener(\"click\", (event) => {",
          "  const button = event.target.closest(\".add\");",
          "  if (!button) return;",
          "",
          "  const result = cart.add(button.dataset.id);",
          "  if (result === \"other-shop\") return askNewCart();",
          "",
          "  saveCart(cart); // localStorage, not the server",
          "  renderCartBar(cart);",
          "});"
        ] },
        packet: { label: "cart", data: { added: "{itemName}", items: "{cartCount}" } },
        ms: 2400
      },
      {
        id: "add-3",
        layer: "styling",
        title: "The badge pops",
        say: "CSS slides the cart bar up and makes the badge grow for a moment, so your eye notices the change.",
        code: { lang: "css", file: "public/styles/cart.css", lines: [
          ".cart-bar {",
          "  transform: translateY(100%);",
          "  transition: transform 300ms ease-out;",
          "}",
          ".cart-bar.show {",
          "  transform: translateY(0);",
          "}",
          ".cart-badge.bump {",
          "  animation: bump 300ms ease-out;",
          "}",
          "@keyframes bump {",
          "  50% { transform: scale(1.3); }",
          "}"
        ] },
        packet: { label: "style", data: { classes: "show bump" } },
        ms: 2000,
        commit: true
      },
      {
        id: "add-4",
        layer: "screen",
        title: "You see it",
        say: "The cart bar now shows {cartLabel}. The server was never asked.",
        code: { lang: "html", file: "public/menu.html", lines: [
          "<a class=\"cart-bar show\" href=\"#/cart\">",
          "  <span class=\"cart-badge bump\">{cartCount}</span>",
          "  <span>{cartLabel}</span>",
          "  <strong>View cart</strong>",
          "</a>"
        ] },
        packet: { label: "done", data: { shown: "{cartLabel}" } },
        ms: 1800
      }
    ]
  },

  // ---------------------------------------------------------------- 2. Search
  {
    id: "search",
    title: "Search for food",
    trigger: { on: "search", needs: "results" },
    tryThis: "Search for biryani.",
    lesson: "Reading data is a round trip: phone to server to database, and back.",
    values: ["query", "count", "countLabel", "firstId", "firstName", "firstRating"],
    demoValues: { query: "biryani", count: 1, countLabel: "1 restaurant", firstId: "r1", firstName: "Marina Biryani Co.", firstRating: 4.4 },
    steps: [
      {
        id: "search-1",
        layer: "screen",
        title: "You search",
        say: "You type \"{query}\" into the search bar. It is a normal HTML form with one text box.",
        code: { lang: "html", file: "public/index.html", lines: [
          "<form class=\"search\" role=\"search\">",
          "  <label class=\"sr-only\" for=\"q\">Search</label>",
          "  <input id=\"q\" name=\"q\" value=\"{query}\"",
          "         placeholder=\"Search for dishes or restaurants\"",
          "         autocomplete=\"off\">",
          "  <button type=\"submit\" aria-label=\"Search\">",
          "    <svg class=\"icon\"><use href=\"#search\"></use></svg>",
          "  </button>",
          "</form>"
        ] },
        packet: { label: "input", data: { q: "{query}" } },
        ms: 1800
      },
      {
        id: "search-2",
        layer: "logic",
        title: "The app asks the server",
        say: "JavaScript waits until you stop typing, then sends your words to the server over the internet.",
        code: { lang: "js", file: "public/js/search.js", lines: [
          "let timer;",
          "",
          "input.addEventListener(\"input\", () => {",
          "  clearTimeout(timer); // wait until typing stops",
          "  timer = setTimeout(() => runSearch(input.value), 300);",
          "});",
          "",
          "async function runSearch(q) {",
          "  const url = \"/api/restaurants?q=\" + encodeURIComponent(q);",
          "  const res = await fetch(url);",
          "  if (!res.ok) return showError(\"Search failed\");",
          "  renderResults(await res.json());",
          "}"
        ] },
        packet: { label: "request", data: { method: "GET", url: "/api/restaurants?q={query}" } },
        ms: 2400
      },
      {
        id: "search-3",
        layer: "server",
        title: "The server gets the request",
        say: "The server checks the search is long enough, then asks the database for restaurants and dishes that match.",
        code: { lang: "js", file: "server/routes/restaurants.js", lines: [
          "router.get(\"/api/restaurants\", async (req, res) => {",
          "  const q = String(req.query.q || \"\").trim();",
          "  if (q.length < 2) {",
          "    return res.status(400).json({ error: \"Too short\" });",
          "  }",
          "",
          "  const rows = await db.query(searchSql, [\"%\" + q + \"%\"]);",
          "",
          "  res.set(\"Cache-Control\", \"max-age=60\");",
          "  res.json(rows);",
          "});"
        ] },
        route: "search",
        log: "GET /api/restaurants?q={query}",
        packet: { label: "query", data: { find: "{query}" } },
        ms: 2400
      },
      {
        id: "search-4",
        layer: "database",
        title: "The database looks it up",
        say: "The database checks every restaurant and dish name and finds {countLabel}.",
        code: { lang: "sql", file: "db/search.sql", lines: [
          "-- searchSql: restaurants whose name, cuisine,",
          "-- area or any dish matches the words typed",
          "SELECT DISTINCT r.id, r.name, r.rating, r.eta_min",
          "FROM restaurants r",
          "LEFT JOIN dishes d ON d.restaurant_id = r.id",
          "WHERE r.name    ILIKE $1",
          "   OR r.cuisine ILIKE $1",
          "   OR r.area    ILIKE $1",
          "   OR d.name    ILIKE $1",
          "ORDER BY r.rating DESC",
          "LIMIT 20;"
        ] },
        db: { table: "restaurants", action: "select", columns: ["id", "name", "rating"], row: ["{firstId}", "{firstName}", "{firstRating}"] },
        packet: { label: "rows", data: { found: "{count}" } },
        ms: 2600
      },
      {
        id: "search-5",
        layer: "server",
        title: "The server replies",
        say: "The server sends the results back as JSON, a plain text format that apps use to talk to each other.",
        code: { lang: "http", file: "HTTP response", lines: [
          "HTTP/1.1 200 OK",
          "Content-Type: application/json",
          "Cache-Control: max-age=60",
          "",
          "[",
          "  {",
          "    \"id\": \"{firstId}\",",
          "    \"name\": \"{firstName}\",",
          "    \"rating\": {firstRating}",
          "  }",
          "]"
        ] },
        route: "search",
        log: "200 OK  {countLabel}  84 ms",
        packet: { label: "response", data: { status: 200, results: "{count}" } },
        ms: 2400
      },
      {
        id: "search-6",
        layer: "logic",
        title: "The app builds the list",
        say: "JavaScript turns the JSON into restaurant cards, one card for each result.",
        code: { lang: "js", file: "public/js/search.js", lines: [
          "function renderResults(rows) {",
          "  const cards = rows.map((r, i) => {",
          "    const card = cardTemplate.content.cloneNode(true);",
          "    card.querySelector(\".name\").textContent = r.name;",
          "    card.querySelector(\".rating\").textContent = r.rating;",
          "    card.firstElementChild.style.setProperty(\"--i\", i);",
          "    return card;",
          "  });",
          "  list.replaceChildren(...cards);",
          "  heading.textContent = \"Results for \" + input.value;",
          "}"
        ] },
        packet: { label: "render", data: { cards: "{count}" } },
        ms: 2200
      },
      {
        id: "search-7",
        layer: "styling",
        title: "The cards fade in",
        say: "CSS lays the cards out in a grid and fades them in one after another.",
        code: { lang: "css", file: "public/styles/list.css", lines: [
          ".results { display: grid; gap: 16px; }",
          "",
          ".card {",
          "  border-radius: 14px;",
          "  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);",
          "  animation: fadeUp 300ms ease-out both;",
          "  animation-delay: calc(var(--i) * 60ms);",
          "}",
          "",
          "@keyframes fadeUp {",
          "  from { opacity: 0; transform: translateY(12px); }",
          "}"
        ] },
        packet: { label: "style", data: { layout: "grid", animation: "fadeUp" } },
        ms: 2000,
        commit: true
      },
      {
        id: "search-8",
        layer: "screen",
        title: "You see the results",
        say: "You see {countLabel} for \"{query}\", with {firstName} on top.",
        code: { lang: "html", file: "public/index.html", lines: [
          "<h2 class=\"results-title\">Results for \"{query}\"</h2>",
          "<p class=\"count\">{countLabel}</p>",
          "<ul class=\"results\" aria-live=\"polite\">",
          "  <li class=\"card\" style=\"--i: 0\">",
          "    <img src=\"/img/shops/{firstId}.jpg\" alt=\"\">",
          "    <h3 class=\"name\">{firstName}</h3>",
          "    <span class=\"rating\">{firstRating}</span>",
          "  </li>",
          "</ul>"
        ] },
        packet: { label: "done", data: { shown: "{countLabel}" } },
        ms: 1800
      }
    ]
  },

  // ---------------------------------------------------------------- 3. Place order (flagship)
  {
    id: "order",
    title: "Place an order",
    trigger: { on: "place-order", needs: "cart" },
    tryThis: "Open your cart and tap Place order.",
    lesson: "Anything important is checked again on the server and saved in the database.",
    values: ["restaurantName", "totalLabel", "total", "itemCount", "orderId", "eta"],
    demoValues: { restaurantName: "Marina Biryani Co.", totalLabel: "₹388", total: 388, itemCount: 2, orderId: "FZ-52001", eta: 32 },
    steps: [
      {
        id: "order-1",
        layer: "screen",
        title: "You tap Place order",
        say: "You check your bill of {totalLabel} and tap Place order.",
        code: { lang: "html", file: "public/cart.html", lines: [
          "<section class=\"bill\">",
          "  <h2>Bill details</h2>",
          "  <dl>",
          "    <dt>To pay</dt>",
          "    <dd>{totalLabel}</dd>",
          "  </dl>",
          "</section>",
          "<footer class=\"checkout\">",
          "  <strong>{totalLabel}</strong>",
          "  <button id=\"place-order\">Place order</button>",
          "</footer>"
        ] },
        packet: { label: "tap", data: { tap: "Place order" } },
        ms: 1800
      },
      {
        id: "order-2",
        layer: "logic",
        title: "The app checks and sends",
        say: "JavaScript checks your cart is not empty, packs your order and sends it to the server. It sends dish ids, never prices.",
        code: { lang: "js", file: "public/js/checkout.js", lines: [
          "placeOrderButton.addEventListener(\"click\", async () => {",
          "  if (cart.isEmpty()) return showError(\"Your cart is empty\");",
          "  placeOrderButton.disabled = true; // stops double orders",
          "  const order = {",
          "    shopId: cart.shopId,",
          "    items: cart.lines, // ids and counts, no prices",
          "    addressId: user.addressId",
          "  };",
          "  const res = await fetch(\"/api/orders\", {",
          "    method: \"POST\",",
          "    headers: { \"Content-Type\": \"application/json\" },",
          "    body: JSON.stringify(order)",
          "  });"
        ] },
        packet: { label: "request", data: { method: "POST", url: "/api/orders", items: "{itemCount}" } },
        ms: 2400
      },
      {
        id: "order-3",
        layer: "server",
        title: "The server checks everything",
        say: "The server checks you are logged in and {restaurantName} is open. It works out the price itself and never trusts a price sent by a phone.",
        code: { lang: "js", file: "server/routes/orders.js", lines: [
          "router.post(\"/api/orders\", requireLogin, async (req, res) => {",
          "  const { shopId, items, addressId } = req.body;",
          "",
          "  const shop = await db.getShop(shopId);",
          "  if (!shop || !shop.isOpen) {",
          "    return res.status(409).json({ error: \"Shop is closed\" });",
          "  }",
          "",
          "  // Never trust a price sent by a phone.",
          "  const menu = await db.getMenu(shopId);",
          "  const bill = priceItems(items, menu, shop.fees);",
          "  if (bill.total <= 0) return res.status(400).end();"
        ] },
        route: "orders",
        log: "POST /api/orders  checks passed",
        packet: { label: "checks", data: { loggedIn: true, shopOpen: true, total: "{total}" } },
        ms: 3000
      },
      {
        id: "order-4",
        layer: "server",
        title: "The payment goes through",
        say: "The server asks the payment partner to collect {totalLabel} by UPI. This demo moves no real money.",
        code: { lang: "js", file: "server/routes/orders.js", lines: [
          "  // Same handler, after the checks",
          "  const payment = await upi.collect({",
          "    amount: bill.total,",
          "    payer: req.user.upiId,",
          "    note: \"Foodzy order\"",
          "  });",
          "",
          "  if (payment.status !== \"SUCCESS\") {",
          "    return res.status(402).json({ error: \"Payment failed\" });",
          "  }"
        ] },
        route: "orders",
        log: "UPI collect {totalLabel}  SUCCESS",
        packet: { label: "payment", data: { method: "UPI", amount: "{total}", status: "SUCCESS" } },
        ms: 2400
      },
      {
        id: "order-5",
        layer: "database",
        title: "Your order is saved",
        say: "The database saves your order and its dishes together in one transaction, so there is never half an order. Its status is PLACED.",
        code: { lang: "sql", file: "db/orders.sql", lines: [
          "BEGIN;",
          "",
          "INSERT INTO orders (id, user_id, shop_id, total, status)",
          "VALUES ($1, $2, $3, $4, 'PLACED')",
          "RETURNING id, created_at;",
          "",
          "INSERT INTO order_items (order_id, dish_id, qty, price)",
          "SELECT $1, t.dish_id, t.qty, d.price",
          "FROM unnest($5::text[], $6::int[]) AS t(dish_id, qty)",
          "JOIN dishes d ON d.id = t.dish_id;",
          "",
          "COMMIT;"
        ] },
        db: { table: "orders", action: "insert", columns: ["id", "shop", "total", "status"], row: ["{orderId}", "{restaurantName}", "{total}", "PLACED"] },
        packet: { label: "row", data: { id: "{orderId}", total: "{total}", status: "PLACED" } },
        ms: 2600
      },
      {
        id: "order-6",
        layer: "server",
        title: "The kitchen is told",
        say: "The server alerts {restaurantName} to start cooking, then tells your phone that order {orderId} is placed.",
        code: { lang: "js", file: "server/routes/orders.js", lines: [
          "  // Same handler: save, tell the kitchen, reply",
          "  const order = await db.createOrder({",
          "    userId: req.user.id, shopId, items, total: bill.total",
          "  });",
          "",
          "  notify.shop(shop.id, { orderId: order.id, items });",
          "",
          "  res.status(201).json({",
          "    orderId: order.id,",
          "    eta: shop.etaMin",
          "  });",
          "});"
        ] },
        route: "orders",
        log: "201 Created  order {orderId}",
        packet: { label: "response", data: { status: 201, orderId: "{orderId}", eta: "{eta}" } },
        ms: 2400
      },
      {
        id: "order-7",
        layer: "logic",
        title: "The app moves on",
        say: "JavaScript reads the reply, saves your order number, empties your cart and opens the order screen.",
        code: { lang: "js", file: "public/js/checkout.js", lines: [
          "  // After the server replies",
          "  if (res.status === 402) return showError(\"Payment failed\");",
          "  if (!res.ok) return showError(\"Could not place order\");",
          "",
          "  const { orderId, eta } = await res.json();",
          "  cart.clear();",
          "  saveCart(cart);",
          "  router.go(\"/orders/\" + orderId, { eta });",
          "});"
        ] },
        packet: { label: "state", data: { orderId: "{orderId}", cart: "empty" } },
        ms: 2200
      },
      {
        id: "order-8",
        layer: "styling",
        title: "Success shows up",
        say: "CSS slides the success card in and draws the green tick line by line, so the moment feels good.",
        code: { lang: "css", file: "public/styles/order.css", lines: [
          ".placed {",
          "  animation: slideUp 400ms cubic-bezier(0.22, 1, 0.36, 1);",
          "}",
          ".tick circle {",
          "  fill: var(--success);",
          "}",
          ".tick path {",
          "  stroke-dasharray: 48;",
          "  animation: draw 500ms ease-out 200ms both;",
          "}",
          "@keyframes slideUp { from { transform: translateY(24px); } }",
          "@keyframes draw { from { stroke-dashoffset: 48; } }"
        ] },
        packet: { label: "style", data: { card: "slideUp", tick: "draw" } },
        ms: 2000,
        commit: true
      },
      {
        id: "order-9",
        layer: "screen",
        title: "Your order is placed",
        say: "Order {orderId} is placed. {restaurantName} is cooking, and it should reach you in about {eta} minutes.",
        code: { lang: "html", file: "public/order.html", lines: [
          "<section class=\"placed\" role=\"status\">",
          "  <svg class=\"tick\" viewBox=\"0 0 52 52\" aria-hidden=\"true\">",
          "    <circle cx=\"26\" cy=\"26\" r=\"25\"></circle>",
          "    <path d=\"M14 27 l8 8 l16 -16\"></path>",
          "  </svg>",
          "  <h2>Order placed</h2>",
          "  <p>Order {orderId}</p>",
          "  <p>{restaurantName} is preparing your food.</p>",
          "  <p class=\"eta\">Arriving in {eta} mins</p>",
          "  <a class=\"button\" href=\"#/track/{orderId}\">Track order</a>",
          "</section>"
        ] },
        packet: { label: "done", data: { order: "{orderId}", eta: "{eta}" } },
        ms: 2200
      }
    ]
  },

  // ---------------------------------------------------------------- 4. Track order
  {
    id: "track",
    title: "Track your order",
    trigger: { on: "track", needs: "order" },
    tryThis: "After placing an order, tap Track order.",
    lesson: "A server can push news to your phone without your phone asking first.",
    values: ["orderId", "riderName", "restaurantName", "etaLeft"],
    demoValues: { orderId: "FZ-52001", riderName: "Arun", restaurantName: "Marina Biryani Co.", etaLeft: 19 },
    steps: [
      {
        id: "track-1",
        layer: "server",
        title: "The rider's phone reports in",
        say: "{riderName} picks up your food from {restaurantName}. The rider's app sends the new status and location to the server.",
        code: { lang: "js", file: "server/routes/riders.js", lines: [
          "// The rider's app calls this every few seconds",
          "router.post(\"/api/riders/location\", riderAuth, onLocation);",
          "",
          "async function onLocation(req, res) {",
          "  const { orderId, lat, lng } = req.body;",
          "  const order = await db.getOrder(orderId);",
          "  if (order.riderId !== req.rider.id) {",
          "    return res.sendStatus(403); // not your order",
          "  }",
          "  await db.markOnTheWay(orderId, lat, lng);",
          "  realtime.push(orderId, { lat, lng });",
          "  res.sendStatus(204);",
          "}"
        ] },
        route: "location",
        log: "POST /api/riders/location  204",
        packet: { label: "location", data: { rider: "{riderName}", lat: 13.0418, lng: 80.2341 } },
        ms: 2600
      },
      {
        id: "track-2",
        layer: "database",
        title: "Your order is updated",
        say: "The database changes the status of order {orderId} to OUT_FOR_DELIVERY and stores where the rider is.",
        code: { lang: "sql", file: "db/orders.sql", lines: [
          "-- markOnTheWay",
          "UPDATE orders",
          "SET status     = 'OUT_FOR_DELIVERY',",
          "    rider_lat  = $2,",
          "    rider_lng  = $3,",
          "    updated_at = now()",
          "WHERE id = $1",
          "  AND status IN ('PLACED', 'PREPARING')",
          "RETURNING id, status;"
        ] },
        db: { table: "orders", action: "update", columns: ["id", "status"], row: ["{orderId}", "OUT_FOR_DELIVERY"] },
        packet: { label: "row", data: { id: "{orderId}", status: "OUT_FOR_DELIVERY" } },
        ms: 2400
      },
      {
        id: "track-3",
        layer: "server",
        title: "The server pushes the news",
        say: "Your phone does not have to keep asking. The server pushes the update over a live connection called a WebSocket.",
        code: { lang: "js", file: "server/realtime.js", lines: [
          "// Each phone joins a room named after its order",
          "io.on(\"connection\", (socket) => {",
          "  socket.on(\"watch\", (orderId) => socket.join(orderId));",
          "});",
          "",
          "function push(orderId, rider) {",
          "  io.to(orderId).emit(\"order:update\", {",
          "    status: \"OUT_FOR_DELIVERY\",",
          "    rider,",
          "    at: Date.now()",
          "  });",
          "}"
        ] },
        route: "updates",
        log: "WebSocket push  order:update  {orderId}",
        packet: { label: "push", data: { event: "order:update", status: "OUT_FOR_DELIVERY" } },
        ms: 2600
      },
      {
        id: "track-4",
        layer: "logic",
        title: "The app moves the rider",
        say: "JavaScript hears the update, moves {riderName} along the map and works out the time left.",
        code: { lang: "js", file: "public/js/track.js", lines: [
          "const socket = io();",
          "socket.emit(\"watch\", orderId);",
          "",
          "socket.on(\"order:update\", (update) => {",
          "  statusChip.dataset.status = update.status;",
          "  rider.moveTo(update.rider.lat, update.rider.lng);",
          "",
          "  const mins = minutesLeft(update.rider, home);",
          "  etaLabel.textContent = mins + \" mins away\";",
          "});"
        ] },
        packet: { label: "state", data: { status: "OUT_FOR_DELIVERY", minsLeft: "{etaLeft}" } },
        ms: 2400
      },
      {
        id: "track-5",
        layer: "styling",
        title: "The map comes alive",
        say: "CSS glides the rider icon smoothly instead of letting it jump, colours the status chip and animates the route.",
        code: { lang: "css", file: "public/styles/track.css", lines: [
          ".rider {",
          "  transition: transform 900ms linear;",
          "  will-change: transform;",
          "}",
          ".chip[data-status=\"OUT_FOR_DELIVERY\"] {",
          "  background: var(--accent);",
          "  color: white;",
          "}",
          ".route {",
          "  stroke-dasharray: 6 6;",
          "  animation: dash 1s linear infinite;",
          "}",
          "@keyframes dash { to { stroke-dashoffset: -12; } }"
        ] },
        packet: { label: "style", data: { rider: "glide", chip: "on-the-way" } },
        ms: 2000,
        commit: true
      },
      {
        id: "track-6",
        layer: "screen",
        title: "You watch it come",
        say: "You see {riderName} on the way with your food from {restaurantName}. About {etaLeft} minutes left.",
        code: { lang: "html", file: "public/track.html", lines: [
          "<div class=\"track\">",
          "  <svg class=\"map\" viewBox=\"0 0 360 240\">",
          "    <path class=\"route\" d=\"M40 200 C 120 40, 240 220, 320 60\"/>",
          "    <g class=\"rider\" transform=\"translate(180 130)\">...</g>",
          "  </svg>",
          "  <span class=\"chip\" data-status=\"OUT_FOR_DELIVERY\">",
          "    On the way",
          "  </span>",
          "  <p>{riderName} is {etaLeft} mins away</p>",
          "  <p class=\"from\">From {restaurantName}</p>",
          "</div>"
        ] },
        packet: { label: "done", data: { status: "On the way", minsLeft: "{etaLeft}" } },
        ms: 2000
      }
    ]
  }
];
