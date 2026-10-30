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
    values: ["itemId", "itemName", "cartCount", "cartLabel"],
    demoValues: { itemId: "r1i1", itemName: "Chicken Dum Biryani", cartCount: 1, cartLabel: "1 item, ₹289" },
    steps: [
      {
        id: "add-1",
        layer: "screen",
        title: "You tap Add",
        say: "You tap Add on {itemName}. The button tells the app exactly which dish you picked.",
        code: { lang: "html", lines: [
          "<div class=\"dish\">",
          "  <h3>{itemName}</h3>",
          "  <button class=\"add\" data-id=\"{itemId}\">ADD</button>",
          "</div>"
        ] },
        packet: { label: "tap", data: { tap: "ADD", item: "{itemId}" } },
        ms: 1800
      },
      {
        id: "add-2",
        layer: "logic",
        title: "The app updates your cart",
        say: "JavaScript adds {itemName} to your cart. The cart lives on your phone, so this step needs no internet.",
        code: { lang: "js", lines: [
          "addButton.addEventListener(\"click\", () => {",
          "  cart.add(\"{itemId}\");",
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
        say: "CSS makes the cart badge grow for a moment, so your eye notices the change.",
        code: { lang: "css", lines: [
          ".cart-badge.bump {",
          "  animation: bump 300ms ease-out;",
          "}",
          "@keyframes bump { 50% { transform: scale(1.3); } }"
        ] },
        packet: { label: "style", data: { class: "bump" } },
        ms: 2000,
        commit: true
      },
      {
        id: "add-4",
        layer: "screen",
        title: "You see it",
        say: "The cart bar now shows {cartLabel}. The server was never asked.",
        code: { lang: "html", lines: [
          "<a class=\"cart-bar\" href=\"#/cart\">",
          "  <span class=\"cart-badge\">{cartCount}</span>",
          "  View cart",
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
        say: "You type \"{query}\" into the search bar.",
        code: { lang: "html", lines: [
          "<form class=\"search\" role=\"search\">",
          "  <input name=\"q\" value=\"{query}\">",
          "</form>"
        ] },
        packet: { label: "input", data: { q: "{query}" } },
        ms: 1800
      },
      {
        id: "search-2",
        layer: "logic",
        title: "The app asks the server",
        say: "JavaScript waits until you stop typing, then sends your words to the server.",
        code: { lang: "js", lines: [
          "const url = \"/api/restaurants?q=\" + encodeURIComponent(q);",
          "const res = await fetch(url);",
          "const data = await res.json();"
        ] },
        packet: { label: "request", data: { method: "GET", url: "/api/restaurants?q={query}" } },
        ms: 2400
      },
      {
        id: "search-3",
        layer: "server",
        title: "The server gets the request",
        say: "The server reads your search and asks the database for restaurants and dishes that match.",
        code: { lang: "js", lines: [
          "app.get(\"/api/restaurants\", async (req, res) => {",
          "  const rows = await db.search(req.query.q);",
          "  res.json(rows);",
          "});"
        ] },
        log: "GET /api/restaurants?q={query}",
        packet: { label: "query", data: { find: "{query}" } },
        ms: 2400
      },
      {
        id: "search-4",
        layer: "database",
        title: "The database looks it up",
        say: "The database checks every restaurant and dish name and finds {countLabel}.",
        code: { lang: "sql", lines: [
          "SELECT DISTINCT r.id, r.name, r.rating",
          "FROM restaurants r",
          "JOIN dishes d ON d.restaurant_id = r.id",
          "WHERE r.name ILIKE $1 OR d.name ILIKE $1;"
        ] },
        db: { table: "restaurants", action: "select", columns: ["id", "name", "rating"], row: ["{firstId}", "{firstName}", "{firstRating}"] },
        packet: { label: "rows", data: { found: "{count}" } },
        ms: 2600
      },
      {
        id: "search-5",
        layer: "server",
        title: "The server replies",
        say: "The server sends the results back as JSON, a plain text format that apps use to talk.",
        code: { lang: "text", lines: [
          "HTTP/1.1 200 OK",
          "Content-Type: application/json",
          "",
          "[{ \"id\": \"{firstId}\", \"name\": \"{firstName}\" }]"
        ] },
        log: "200 OK  {countLabel}  84 ms",
        packet: { label: "response", data: { status: 200, results: "{count}" } },
        ms: 2400
      },
      {
        id: "search-6",
        layer: "logic",
        title: "The app builds the list",
        say: "JavaScript turns the JSON into restaurant cards, one card for each result.",
        code: { lang: "js", lines: [
          "list.replaceChildren(",
          "  ...data.map((r) => RestaurantCard(r))",
          ");"
        ] },
        packet: { label: "render", data: { cards: "{count}" } },
        ms: 2200
      },
      {
        id: "search-7",
        layer: "styling",
        title: "The cards fade in",
        say: "CSS lays the cards out and fades them in one after another.",
        code: { lang: "css", lines: [
          ".card {",
          "  animation: fadeUp 300ms ease-out both;",
          "  animation-delay: calc(var(--i) * 60ms);",
          "}"
        ] },
        packet: { label: "style", data: { layout: "list", animation: "fadeUp" } },
        ms: 2000,
        commit: true
      },
      {
        id: "search-8",
        layer: "screen",
        title: "You see the results",
        say: "You see {countLabel} for \"{query}\", with {firstName} on top.",
        code: { lang: "html", lines: [
          "<ul class=\"results\" aria-live=\"polite\">",
          "  <li class=\"card\">{firstName}</li>",
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
    demoValues: { restaurantName: "Marina Biryani Co.", totalLabel: "₹388", total: 388, itemCount: 2, orderId: "TH-52001", eta: 32 },
    steps: [
      {
        id: "order-1",
        layer: "screen",
        title: "You tap Place order",
        say: "You check your bill of {totalLabel} and tap Place order.",
        code: { lang: "html", lines: [
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
        say: "JavaScript checks your cart is not empty, packs your order and sends it to the server.",
        code: { lang: "js", lines: [
          "if (cart.isEmpty()) return showError(\"Cart is empty\");",
          "const order = { shopId, items: cart.items, address };",
          "await fetch(\"/api/orders\", {",
          "  method: \"POST\", body: JSON.stringify(order)",
          "});"
        ] },
        packet: { label: "request", data: { method: "POST", url: "/api/orders", items: "{itemCount}" } },
        ms: 2400
      },
      {
        id: "order-3",
        layer: "server",
        title: "The server checks everything",
        say: "The server checks you are logged in and {restaurantName} is open. It works out the price itself and never trusts a price sent by a phone.",
        code: { lang: "js", lines: [
          "app.post(\"/api/orders\", auth, async (req, res) => {",
          "  const shop = await db.getShop(req.body.shopId);",
          "  if (!shop.isOpen) return res.status(409).end();",
          "  const total = await priceItems(req.body.items);"
        ] },
        log: "POST /api/orders  checks passed",
        packet: { label: "checks", data: { loggedIn: true, shopOpen: true, total: "{total}" } },
        ms: 3000
      },
      {
        id: "order-4",
        layer: "server",
        title: "The payment goes through",
        say: "The server asks the payment partner to collect {totalLabel} by UPI. This demo moves no real money.",
        code: { lang: "js", lines: [
          "const payment = await upi.collect({ amount: total });",
          "if (payment.status !== \"SUCCESS\") {",
          "  return res.status(402).json({ error: \"Payment failed\" });",
          "}"
        ] },
        log: "UPI collect {totalLabel}  SUCCESS",
        packet: { label: "payment", data: { method: "UPI", amount: "{total}", status: "SUCCESS" } },
        ms: 2400
      },
      {
        id: "order-5",
        layer: "database",
        title: "Your order is saved",
        say: "The database saves your order as a new row with the status PLACED. Now it exists for good.",
        code: { lang: "sql", lines: [
          "INSERT INTO orders (id, user_id, shop_id, total, status)",
          "VALUES ($1, $2, $3, $4, 'PLACED')",
          "RETURNING id, created_at;"
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
        code: { lang: "js", lines: [
          "notify.shop(shop.id, { orderId: order.id });",
          "res.status(201).json({ orderId: order.id, eta: shop.eta });"
        ] },
        log: "201 Created  order {orderId}",
        packet: { label: "response", data: { status: 201, orderId: "{orderId}", eta: "{eta}" } },
        ms: 2400
      },
      {
        id: "order-7",
        layer: "logic",
        title: "The app moves on",
        say: "JavaScript saves your order number, empties your cart and opens the order screen.",
        code: { lang: "js", lines: [
          "const { orderId, eta } = await res.json();",
          "cart.clear();",
          "router.go(\"/orders/\" + orderId);"
        ] },
        packet: { label: "state", data: { orderId: "{orderId}", cart: "empty" } },
        ms: 2200
      },
      {
        id: "order-8",
        layer: "styling",
        title: "Success shows up",
        say: "CSS draws the green tick and slides the success card in, so the moment feels good.",
        code: { lang: "css", lines: [
          ".tick path {",
          "  stroke-dasharray: 48;",
          "  animation: draw 500ms ease-out forwards;",
          "}",
          "@keyframes draw { from { stroke-dashoffset: 48; } }"
        ] },
        packet: { label: "style", data: { card: "success", tick: "draw" } },
        ms: 2000,
        commit: true
      },
      {
        id: "order-9",
        layer: "screen",
        title: "Your order is placed",
        say: "Order {orderId} is placed. {restaurantName} is cooking, and it should reach you in about {eta} minutes.",
        code: { lang: "html", lines: [
          "<section class=\"placed\" role=\"status\">",
          "  <h2>Order placed</h2>",
          "  <p>Arriving in {eta} mins</p>",
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
    demoValues: { orderId: "TH-52001", riderName: "Arun", restaurantName: "Marina Biryani Co.", etaLeft: 19 },
    steps: [
      {
        id: "track-1",
        layer: "server",
        title: "The rider's phone reports in",
        say: "{riderName} picks up your food from {restaurantName}. The rider's app sends the new status and location to the server.",
        code: { lang: "js", lines: [
          "app.post(\"/api/riders/location\", auth, async (req, res) => {",
          "  const { orderId, lat, lng } = req.body;",
          "  await db.markOnTheWay(orderId, lat, lng);",
          "  res.sendStatus(204);",
          "});"
        ] },
        log: "POST /api/riders/location  204",
        packet: { label: "location", data: { rider: "{riderName}", lat: 13.0418, lng: 80.2341 } },
        ms: 2600
      },
      {
        id: "track-2",
        layer: "database",
        title: "Your order is updated",
        say: "The database changes the status of order {orderId} to OUT_FOR_DELIVERY and stores where the rider is.",
        code: { lang: "sql", lines: [
          "UPDATE orders",
          "SET status = 'OUT_FOR_DELIVERY',",
          "    rider_lat = $2, rider_lng = $3",
          "WHERE id = $1;"
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
        code: { lang: "js", lines: [
          "io.to(orderId).emit(\"order:update\", {",
          "  status: \"OUT_FOR_DELIVERY\",",
          "  rider: { lat, lng }",
          "});"
        ] },
        log: "WebSocket push  order:update  {orderId}",
        packet: { label: "push", data: { event: "order:update", status: "OUT_FOR_DELIVERY" } },
        ms: 2600
      },
      {
        id: "track-4",
        layer: "logic",
        title: "The app moves the rider",
        say: "JavaScript hears the update, moves {riderName} along the map and works out the time left.",
        code: { lang: "js", lines: [
          "socket.on(\"order:update\", (u) => {",
          "  rider.moveTo(u.rider.lat, u.rider.lng);",
          "  etaLabel.textContent = minutesLeft(u.rider) + \" mins\";",
          "});"
        ] },
        packet: { label: "state", data: { status: "OUT_FOR_DELIVERY", minsLeft: "{etaLeft}" } },
        ms: 2400
      },
      {
        id: "track-5",
        layer: "styling",
        title: "The map comes alive",
        say: "CSS glides the rider icon smoothly instead of letting it jump, and colours the status chip.",
        code: { lang: "css", lines: [
          ".rider {",
          "  transition: transform 900ms linear;",
          "}",
          ".chip.on-the-way { background: var(--accent); }"
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
        code: { lang: "html", lines: [
          "<div class=\"track\">",
          "  <span class=\"chip on-the-way\">On the way</span>",
          "  <p>{riderName} is {etaLeft} mins away</p>",
          "</div>"
        ] },
        packet: { label: "done", data: { status: "On the way", minsLeft: "{etaLeft}" } },
        ms: 2000
      }
    ]
  }
];
