require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./lib/env");
const prisma = require("./lib/prisma");
const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");
const adminRouter = require("./routes/admin");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting cookies/credentials
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body and Cookie parsers
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// General rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Забагато запитів з цієї IP-адреси, спробуйте пізніше",
  },
});
app.use("/api", apiLimiter);

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // limit login/register attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Забагато спроб автентифікації, спробуйте через 15 хвилин",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/admin", adminRouter);

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${env.PORT}`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database connection closed. Process exiting.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = app;
