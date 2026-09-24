const { verifyAccessToken } = require("../utils/jwt");
const { UnauthorizedError } = require("../utils/errors");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Токен авторизації відсутній"));
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return next(new UnauthorizedError("Токен авторизації порожній"));
  }

  try {
    const decoded = verifyAccessToken(token);

    if (decoded.id == null) {
      return next(new UnauthorizedError("Недійсні дані токена"));
    }

    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Термін дії токена закінчився"));
    }
    return next(new UnauthorizedError("Недійсний токен авторизації"));
  }
}

module.exports = authMiddleware;
