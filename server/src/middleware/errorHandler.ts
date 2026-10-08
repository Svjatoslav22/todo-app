import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  let statusCode: number = err.statusCode || 500;
  let message: string = err.message || "Внутрішня помилка сервера";
  let details: any = err.details || null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Помилка валідації вхідних даних";
    const issues = (err as any).issues || (err as any).errors || [];
    details = issues.map((issue: any) => ({
      path: issue.path?.join(".") ?? "",
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
  if (!(err instanceof AppError) && statusCode === 500) {
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

export default errorHandler;
