const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { handleOrdersApi } = require("./lib/orders");

const root = path.join(__dirname, "public");
const dataDir = path.join(root, "data");
const ordersFile = path.join(dataDir, "orders.json");
const port = Number(process.env.PORT || 8000);

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
  try {
    const text = await fs.readFile(ordersFile, "utf8");
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

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
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

const localStore = {
  readOrders,
  writeOrders,
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname === "/api/orders") {
      await handleOrdersApi(request, response, { localStore });
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
