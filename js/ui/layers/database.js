// Renders the Database layer with restaurants and orders tables, supporting select, insert, and update actions.
// Uses content.js for restaurant data and seedOrders, and standard DOM APIs.
// Used by ui/exploded.js.

import { getAppContent } from "../../content.js";

/**
 * Creates and mounts the Database layer component.
 * @param {HTMLElement} container
 * @returns {{ execute: (dbAction: { table: string, action: string, columns: string[], row: any[] }) => void, reset: () => void, switchTab: (table: string) => void }}
 */
export function createDatabaseLayer(container) {
  const root = document.createElement("div");
  root.className = "layer-database-content";

  const { app, restaurants } = getAppContent("foodzy");

  // Tab Strip
  const tabStrip = document.createElement("div");
  tabStrip.className = "db-tab-strip";

  const tabs = ["restaurants", "orders"];
  let activeTab = "restaurants";
  const tabButtons = {};

  tabs.forEach(tName => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `db-tab-btn ${tName === activeTab ? "active" : ""}`;
    btn.textContent = `public.${tName}`;
    btn.addEventListener("click", () => switchTab(tName));
    tabStrip.appendChild(btn);
    tabButtons[tName] = btn;
  });

  root.appendChild(tabStrip);

  // Table View Container
  const tableContainer = document.createElement("div");
  tableContainer.className = "db-table-container";

  const ordersData = [...(app.seedOrders || [])];

  function buildRestaurantsTable() {
    const table = document.createElement("table");
    table.className = "db-table db-table-restaurants";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["id", "name", "rating"].forEach(col => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    restaurants.forEach(r => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-row-id", r.id);

      const tdId = document.createElement("td");
      tdId.textContent = r.id;
      const tdName = document.createElement("td");
      tdName.textContent = r.name;
      const tdRating = document.createElement("td");
      tdRating.textContent = String(r.rating);

      tr.appendChild(tdId);
      tr.appendChild(tdName);
      tr.appendChild(tdRating);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  function buildOrdersTable() {
    const table = document.createElement("table");
    table.className = "db-table db-table-orders";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["id", "shop", "total", "status"].forEach(col => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    ordersData.forEach(o => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-row-id", o.id);

      const tdId = document.createElement("td");
      tdId.textContent = o.id;
      const tdShop = document.createElement("td");
      tdShop.textContent = o.shop;
      const tdTotal = document.createElement("td");
      tdTotal.textContent = String(o.total);
      const tdStatus = document.createElement("td");
      tdStatus.textContent = o.status;

      tr.appendChild(tdId);
      tr.appendChild(tdShop);
      tr.appendChild(tdTotal);
      tr.appendChild(tdStatus);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  function renderActiveTable() {
    tableContainer.replaceChildren(
      activeTab === "restaurants" ? buildRestaurantsTable() : buildOrdersTable()
    );
  }

  function switchTab(tName) {
    activeTab = tName;
    tabs.forEach(t => {
      if (tabButtons[t]) {
        tabButtons[t].classList.toggle("active", t === activeTab);
      }
    });
    renderActiveTable();
  }

  /**
   * Executes a database step action (select, insert, update).
   * @param {{ table: string, action: string, columns: string[], row: any[] }} dbAction
   */
  function execute(dbAction) {
    if (!dbAction) return;
    if (dbAction.table && dbAction.table !== activeTab) {
      switchTab(dbAction.table);
    }

    const tbody = tableContainer.querySelector("tbody");
    if (!tbody) return;

    // Clear prior highlights
    tbody.querySelectorAll("tr").forEach(r => r.classList.remove("db-highlight-row"));

    const keyId = dbAction.row && dbAction.row[0];

    if (dbAction.action === "select") {
      if (keyId) {
        const rowEl = tbody.querySelector(`tr[data-row-id="${keyId}"]`);
        if (rowEl) {
          rowEl.classList.add("db-highlight-row");
          rowEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    } else if (dbAction.action === "insert") {
      const exists = ordersData.some(o => o.id === keyId);
      if (!exists && dbAction.row) {
        const newOrder = {
          id: dbAction.row[0],
          shop: dbAction.row[1],
          total: dbAction.row[2],
          status: dbAction.row[3] || "PLACED"
        };
        ordersData.push(newOrder);
      }
      renderActiveTable();
      const newTbody = tableContainer.querySelector("tbody");
      const newRow = newTbody ? newTbody.querySelector(`tr[data-row-id="${keyId}"]`) : null;
      if (newRow) {
        newRow.classList.add("db-insert-flash");
        newRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else if (dbAction.action === "update") {
      const target = ordersData.find(o => o.id === keyId);
      if (target && dbAction.row) {
        target.shop = dbAction.row[1] || target.shop;
        target.total = dbAction.row[2] || target.total;
        target.status = dbAction.row[3] || target.status;
      }
      renderActiveTable();
      const updatedTbody = tableContainer.querySelector("tbody");
      const updatedRow = updatedTbody ? updatedTbody.querySelector(`tr[data-row-id="${keyId}"]`) : null;
      if (updatedRow) {
        updatedRow.classList.add("db-update-flash");
      }
    }
  }

  function reset() {
    ordersData.length = 0;
    ordersData.push(...(app.seedOrders || []));
    switchTab("restaurants");
  }

  renderActiveTable();
  root.appendChild(tableContainer);
  container.replaceChildren(root);

  return {
    execute,
    reset,
    switchTab
  };
}
