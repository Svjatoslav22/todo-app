const { ZodError } = require("zod");
const { AppError } = require("../utils/errors");

function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Внутрішня помилка сервера";
  let details = err.details || null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Помилка валідації вхідних даних";
    details = err.errors.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Handle Prisma unique constraint violations
  if (err.code === "P2002") {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(", ")
      : err.meta?.target || "поле";
    message = `Користувач або запис із таким '${target}' вже існує`;
  }

  // Handle Prisma record not found
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Запис не знайдено в базі даних";
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Недійсний токен авторизації";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Термін дії токена закінчився";
  }

  // Log unexpected errors
  if (!err.isOperational && statusCode === 500) {
    console.error("🔥 Unexpected Error:", err);
  }

  return res.status(statusCode).json({
    status: "error",
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === "development" && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = errorHandler;
