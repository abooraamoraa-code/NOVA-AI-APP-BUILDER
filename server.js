require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

/*
|--------------------------------------------------------------------------
| NOVA AI APP BUILDER
| Core Server
|--------------------------------------------------------------------------
| هذا الملف هو نواة السيرفر.
| لا نضع فيه منطق الذكاء الاصطناعي أو الدفع أو إنشاء التطبيقات مباشرة.
| كل وظيفة ستكون في Module مستقل ويمكن إضافتها لاحقًا.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Global Configuration
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
  })
);

app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.FORM_LIMIT || "10mb"
  })
);

/*
|--------------------------------------------------------------------------
| Request ID
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const requestId =
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  req.requestId = requestId;

  res.setHeader("X-Request-ID", requestId);

  next();
});

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const started = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - started;

    console.log(
      `[REQUEST] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

/*
|--------------------------------------------------------------------------
| Root
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    platform: "NOVA AI App Builder",
    version: "1.0.0",
    status: "online",
    requestId: req.requestId
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "nova-core",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/*
|--------------------------------------------------------------------------
| API Information
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  res.json({
    success: true,
    name: "NOVA AI App Builder API",
    version: "1.0.0",
    status: "online"
  });
});

/*
|--------------------------------------------------------------------------
| Dynamic Module Loader
|--------------------------------------------------------------------------
|
| لاحقًا سنضع الوحدات داخل:
|
| backend/routes/
|
| مثال:
|
| backend/routes/auth.routes.js
| backend/routes/ai.routes.js
| backend/routes/project.routes.js
| backend/routes/credit.routes.js
| backend/routes/payment.routes.js
| backend/routes/admin.routes.js
|
| وسيتم تحميلها هنا بدون وضع منطقها داخل server.js.
|
|--------------------------------------------------------------------------
*/

const moduleRegistry = [];

/*
|--------------------------------------------------------------------------
| Register Module
|--------------------------------------------------------------------------
*/

function registerModule(name, router, prefix) {
  if (!router) {
    console.warn(`[MODULE] ${name} skipped: router not found`);
    return;
  }

  const routePrefix = prefix || `/api/${name}`;

  app.use(routePrefix, router);

  moduleRegistry.push({
    name,
    prefix: routePrefix,
    status: "loaded"
  });

  console.log(`[MODULE] ${name} -> ${routePrefix}`);
}

/*
|--------------------------------------------------------------------------
| Future Module Registration
|--------------------------------------------------------------------------
|
| سنفعّل هذه الوحدات عندما ننشئ ملفاتها.
|
|--------------------------------------------------------------------------
*/

// Authentication
// registerModule("auth", require("./backend/routes/auth.routes"), "/api/auth");

// AI
// registerModule("ai", require("./backend/routes/ai.routes"), "/api/ai");

// Projects
// registerModule(
//   "projects",
//   require("./backend/routes/project.routes"),
//   "/api/projects"
// );

// Credits
// registerModule(
//   "credits",
//   require("./backend/routes/credit.routes"),
//   "/api/credits"
// );

// Payments
// registerModule(
//   "payments",
//   require("./backend/routes/payment.routes"),
//   "/api/payments"
// );

// Licenses
// registerModule(
//   "licenses",
//   require("./backend/routes/license.routes"),
//   "/api/licenses"
// );

// Admin
// registerModule(
//   "admin",
//   require("./backend/routes/admin.routes"),
//   "/api/admin"
// );

/*
|--------------------------------------------------------------------------
| Module Status
|--------------------------------------------------------------------------
*/

app.get("/api/system/modules", (req, res) => {
  res.json({
    success: true,
    modules: moduleRegistry
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "ROUTE_NOT_FOUND",
    message: "المسار المطلوب غير موجود",
    path: req.originalUrl,
    requestId: req.requestId
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err);

  const statusCode =
    Number(err.statusCode) ||
    Number(err.status) ||
    500;

  res.status(statusCode).json({
    success: false,
    error: "SERVER_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "حدث خطأ في الخادم"
        : err.message,
    requestId: req.requestId
  });
});

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

let server;

function shutdown(signal) {
  console.log(`[SERVER] ${signal} received`);

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log("[SERVER] HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[SERVER] Forced shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

server = app.listen(PORT, HOST, () => {
  console.log("");
  console.log("==============================================");
  console.log("       NOVA AI APP BUILDER");
  console.log("==============================================");
  console.log(`Server: http://${HOST}:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`API:    http://localhost:${PORT}/api`);
  console.log("Status: ONLINE");
  console.log("==============================================");
  console.log("");
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  app,
  server,
  registerModule
};
