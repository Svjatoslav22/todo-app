const { ForbiddenError, UnauthorizedError } = require("../utils/errors");

function adminMiddleware(req, res, next) {
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

module.exports = adminMiddleware;
