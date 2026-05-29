const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const ordersFile = path.join(dataDir, "orders.json");
const port = Number(process.env.PORT || 8000);
const password = process.env.RESTAURANT_PASSWORD || "685173717";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(ordersFile);
  } catch {
    await fs.writeFile(ordersFile, "[]\n", "utf8");
  }
}

async function readOrders() {
  await ensureStore();
  const text = await fs.readFile(ordersFile, "utf8");
  try {
    const orders = JSON.parse(text);
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders) {
  await ensureStore();
  await fs.writeFile(ordersFile, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function handleApi(request, response, url) {
  if (url.pathname !== "/api/orders") {
    sendText(response, 404, "Not found");
    return;
  }

  if (request.headers["x-restaurant-password"] !== password) {
    sendText(response, 401, "密码不正确");
    return;
  }

  if (request.method === "GET") {
    sendJson(response, 200, await readOrders());
    return;
  }

  if (request.method === "POST") {
    const body = await readBody(request);
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      sendText(response, 400, "订单格式不正确");
      return;
    }

    const items = Array.isArray(payload.items)
      ? payload.items.map((item) => String(item).trim()).filter(Boolean)
      : [];

    if (!items.length) {
      sendText(response, 400, "订单里没有菜品");
      return;
    }

    const orders = await readOrders();
    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      items,
    };
    orders.push(order);
    await writeOrders(orders);
    sendJson(response, 201, order);
    return;
  }

  if (request.method === "DELETE") {
    await writeOrders([]);
    response.writeHead(204, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  sendText(response, 405, "Method not allowed");
}

async function serveStatic(request, response, url) {
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600",
    });
    response.end(file);
  } catch {
    sendText(response, 404, "Not found");
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(request, response, url);
  } catch (error) {
    console.error(error);
    sendText(response, 500, "Server error");
  }
});

ensureStore().then(() => {
  server.listen(port, () => {
    console.log(`印坤的小饭店已启动: http://127.0.0.1:${port}`);
  });
});
