const { NotFoundError } = require("../utils/errors");

function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не знайдено`));
}

module.exports = notFoundHandler;
