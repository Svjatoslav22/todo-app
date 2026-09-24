const { verifyAccessToken } = require("../utils/jwt");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");
const prisma = require("../lib/prisma");

async function authMiddleware(req, res, next) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isBanned: true },
    });

    if (!user) {
      return next(new UnauthorizedError("Користувача не знайдено"));
    }

    if (user.isBanned) {
      return next(new ForbiddenError("Ваш обліковий запис заблоковано адміністратором"));
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Термін дії токена закінчився"));
    }
    return next(new UnauthorizedError("Недійсний токен авторизації"));
  }
}

module.exports = authMiddleware;
