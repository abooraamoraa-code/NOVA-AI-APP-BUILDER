require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

/*
|--------------------------------------------------------------------------
| NOVA AI APP BUILDER
| Main Server
|--------------------------------------------------------------------------
*/

const app = express();

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

/*
|--------------------------------------------------------------------------
| Application Settings
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.set("trust proxy", 1);

app.set("json spaces", 2);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID"
    ]
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

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
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

  req.requestId = requestId;

  res.setHeader(
    "X-Request-ID",
    requestId
  );

  next();
});

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration =
      Date.now() - startedAt;

    console.log(
      `[REQUEST] ${req.method} ${req.originalUrl} ` +
      `${res.statusCode} ${duration}ms ` +
      `[${req.requestId}]`
    );
  });

  next();
});

/*
|--------------------------------------------------------------------------
| Basic Security Headers
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "SAMEORIGIN"
  );

  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  next();
});

/*
|--------------------------------------------------------------------------
| Module Registry
|--------------------------------------------------------------------------
*/

const moduleRegistry = [];

/*
|--------------------------------------------------------------------------
| Module Registration
|--------------------------------------------------------------------------
*/

function registerModule(
  name,
  router,
  prefix
) {
  if (!router) {
    console.warn(
      `[MODULE] ${name} skipped`
    );

    return;
  }

  const routePrefix =
    prefix || `/api/${name}`;

  app.use(
    routePrefix,
    router
  );

  moduleRegistry.push({
    name,
    prefix: routePrefix,
    status: "loaded"
  });

  console.log(
    `[MODULE] ${name} -> ${routePrefix}`
  );
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

try {
  const authRouter =
    require(
      "./backend/routes/auth.routes"
    );

  registerModule(
    "auth",
    authRouter,
    "/api/auth"
  );
} catch (error) {
  console.log(
    "[MODULE] Auth not loaded:",
    error.message
  );
}

/*
|--------------------------------------------------------------------------
| Future AI Module
|--------------------------------------------------------------------------
*/

try {
  const aiRouter =
    require(
      "./backend/routes/ai.routes"
    );

  registerModule(
    "ai",
    aiRouter,
    "/api/ai"
  );
} catch (error) {
  console.log(
    "[MODULE] AI not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Ingestion Module
|--------------------------------------------------------------------------
*/

try {
  const ingestionRouter =
    require(
      "./backend/routes/ingestion.routes"
    );

  registerModule(
    "ingestion",
    ingestionRouter,
    "/api/ingestion"
  );
} catch (error) {
  console.log(
    "[MODULE] Ingestion not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Processing Module
|--------------------------------------------------------------------------
*/

try {
  const processingRouter =
    require(
      "./backend/routes/processing.routes"
    );

  registerModule(
    "processing",
    processingRouter,
    "/api/processing"
  );
} catch (error) {
  console.log(
    "[MODULE] Processing not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Generator Module
|--------------------------------------------------------------------------
*/

try {
  const generatorRouter =
    require(
      "./backend/routes/generator.routes"
    );

  registerModule(
    "generator",
    generatorRouter,
    "/api/generator"
  );
} catch (error) {
  console.log(
    "[MODULE] Generator not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Projects Module
|--------------------------------------------------------------------------
*/

try {
  const projectsRouter =
    require(
      "./backend/routes/projects.routes"
    );

  registerModule(
    "projects",
    projectsRouter,
    "/api/projects"
  );
} catch (error) {
  console.log(
    "[MODULE] Projects not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Credits Module
|--------------------------------------------------------------------------
*/

try {
  const creditsRouter =
    require(
      "./backend/routes/credits.routes"
    );

  registerModule(
    "credits",
    creditsRouter,
    "/api/credits"
  );
} catch (error) {
  console.log(
    "[MODULE] Credits not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Payments Module
|--------------------------------------------------------------------------
*/

try {
  const paymentsRouter =
    require(
      "./backend/routes/payments.routes"
    );

  registerModule(
    "payments",
    paymentsRouter,
    "/api/payments"
  );
} catch (error) {
  console.log(
    "[MODULE] Payments not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future License Module
|--------------------------------------------------------------------------
*/

try {
  const licensesRouter =
    require(
      "./backend/routes/licenses.routes"
    );

  registerModule(
    "licenses",
    licensesRouter,
    "/api/licenses"
  );
} catch (error) {
  console.log(
    "[MODULE] Licenses not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Future Admin Module
|--------------------------------------------------------------------------
*/

try {
  const adminRouter =
    require(
      "./backend/routes/admin.routes"
    );

  registerModule(
    "admin",
    adminRouter,
    "/api/admin"
  );
} catch (error) {
  console.log(
    "[MODULE] Admin not loaded yet"
  );
}

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,

    platform:
      "NOVA AI App Builder",

    version:
      "1.0.0",

    environment:
      NODE_ENV,

    status:
      "online",

    requestId:
      req.requestId
  });
});

/*
|--------------------------------------------------------------------------
| API Root
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  res.json({
    success: true,

    name:
      "NOVA AI App Builder API",

    version:
      "1.0.0",

    status:
      "online",

    modules:
      moduleRegistry
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,

      status:
        "healthy",

      service:
        "nova-core",

      environment:
        NODE_ENV,

      uptime:
        process.uptime(),

      timestamp:
        new Date().toISOString(),

      memory: {
        rss:
          process.memoryUsage().rss,

        heapUsed:
          process.memoryUsage().heapUsed,

        heapTotal:
          process.memoryUsage().heapTotal
      },

      requestId:
        req.requestId
    });
  }
);

/*
|--------------------------------------------------------------------------
| System Status
|--------------------------------------------------------------------------
*/

app.get(
  "/api/system/status",
  (req, res) => {
    res.json({
      success: true,

      platform:
        "NOVA AI App Builder",

      server:
        "online",

      database:
        process.env.SUPABASE_URL
          ? "configured"
          : "not_configured",

      gemini:
        process.env.GEMINI_API_KEY
          ? "configured"
          : "not_configured",

      modules:
        moduleRegistry,

      timestamp:
        new Date().toISOString()
    });
  }
);

/*
|--------------------------------------------------------------------------
| Module Status
|--------------------------------------------------------------------------
*/

app.get(
  "/api/system/modules",
  (req, res) => {
    res.json({
      success: true,

      total:
        moduleRegistry.length,

      modules:
        moduleRegistry
    });
  }
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,

      error:
        "ROUTE_NOT_FOUND",

      message:
        "المسار المطلوب غير موجود",

      path:
        req.originalUrl,

      requestId:
        req.requestId
    });
  }
);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "[SERVER ERROR]",
      error
    );

    const statusCode =
      Number(error.statusCode) ||
      Number(error.status) ||
      500;

    res.status(
      statusCode
    ).json({
      success: false,

      error:
        "SERVER_ERROR",

      message:
        NODE_ENV === "production"
          ? "حدث خطأ في الخادم"
          : error.message,

      requestId:
        req.requestId
    });
  }
);

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

let server = null;

function shutdown(
  signal
) {
  console.log(
    `[SERVER] ${signal} received`
  );

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log(
      "[SERVER] HTTP server closed"
    );

    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "[SERVER] Forced shutdown"
    );

    process.exit(1);
  }, 10000);
}

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

/*
|--------------------------------------------------------------------------
| Unhandled Errors
|--------------------------------------------------------------------------
*/

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "[UNCAUGHT EXCEPTION]",
      error
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "[UNHANDLED REJECTION]",
      reason
    );
  }
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

server =
  app.listen(
    PORT,
    HOST,
    () => {
      console.log("");
      console.log(
        "=============================================="
      );

      console.log(
        "        NOVA AI APP BUILDER"
      );

      console.log(
        "=============================================="
      );

      console.log(
        `Environment: ${NODE_ENV}`
      );

      console.log(
        `Port: ${PORT}`
      );

      console.log(
        `Health: http://localhost:${PORT}/api/health`
      );

      console.log(
        `API: http://localhost:${PORT}/api`
      );

      console.log(
        "Status: ONLINE"
      );

      console.log(
        "=============================================="
      );

      console.log("");
    }
  );

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
