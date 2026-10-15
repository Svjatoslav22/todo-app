import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an Express handler so that sync throws and rejected promises
 * are forwarded to the error-handling middleware via `next`.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown
): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
