const crypto = require("node:crypto");

const password = process.env.RESTAURANT_PASSWORD || "685173717";

function verifyPassword(request) {
  return request.headers["x-restaurant-password"] === password;
}

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function text(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(message);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return undefined;
  }

  return { key, url: url.replace(/\/$/, "") };
}

async function supabaseRequest(path, options = {}) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

async function getOrders({ localStore } = {}) {
  if (getSupabaseConfig()) {
    const rows = await supabaseRequest("orders?select=id,created_at,items&order=created_at.asc");
    return rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      items: row.items,
    }));
  }

  if (!localStore) {
    throw new Error("Supabase is not configured");
  }

  return localStore.readOrders();
}

async function createOrder(items, { localStore } = {}) {
  const cleanItems = Array.isArray(items)
    ? items.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!cleanItems.length) {
    const error = new Error("订单里没有菜品");
    error.statusCode = 400;
    throw error;
  }

  if (getSupabaseConfig()) {
    const rows = await supabaseRequest("orders", {
      method: "POST",
      body: JSON.stringify({ items: cleanItems }),
    });
    const row = rows[0];
    return {
      id: row.id,
      createdAt: row.created_at,
      items: row.items,
    };
  }

  if (!localStore) {
    throw new Error("Supabase is not configured");
  }

  const orders = await localStore.readOrders();
  const order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    items: cleanItems,
  };
  orders.push(order);
  await localStore.writeOrders(orders);
  return order;
}

async function clearOrders({ localStore } = {}) {
  if (getSupabaseConfig()) {
    await supabaseRequest("orders?id=not.is.null", {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    return;
  }

  if (!localStore) {
    throw new Error("Supabase is not configured");
  }

  await localStore.writeOrders([]);
}

async function handleOrdersApi(request, response, options = {}) {
  if (!verifyPassword(request)) {
    text(response, 401, "密码不正确");
    return;
  }

  try {
    if (request.method === "GET") {
      json(response, 200, await getOrders(options));
      return;
    }

    if (request.method === "POST") {
      let payload;
      try {
        payload = JSON.parse(await readBody(request));
      } catch {
        text(response, 400, "订单格式不正确");
        return;
      }

      json(response, 201, await createOrder(payload.items, options));
      return;
    }

    if (request.method === "DELETE") {
      await clearOrders(options);
      response.statusCode = 204;
      response.setHeader("Cache-Control", "no-store");
      response.end();
      return;
    }

    text(response, 405, "Method not allowed");
  } catch (error) {
    console.error(error);
    text(response, error.statusCode || 500, error.message || "Server error");
  }
}

module.exports = {
  handleOrdersApi,
};
