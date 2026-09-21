const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);

    if (decoded.id == null) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { id: decoded.id };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
