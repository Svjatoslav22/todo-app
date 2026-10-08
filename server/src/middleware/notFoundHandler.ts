import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не знайдено`));
}

export default notFoundHandler;
