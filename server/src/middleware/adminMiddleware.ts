import { Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import { AuthRequest } from "../types";

export function adminMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError("Авторизація обов'язкова"));
  }

  if (req.user.role !== "admin") {
    return next(
      new ForbiddenError("Доступ заборонено: потрібні права адміністратора")
    );
  }

  return next();
}

export default adminMiddleware;
