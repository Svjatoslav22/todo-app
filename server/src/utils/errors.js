class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Некоректний запит", details = null) {
    super(message, 400, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Не авторизовано", details = null) {
    super(message, 401, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Доступ заборонено", details = null) {
    super(message, 403, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Ресурс не знайдено", details = null) {
    super(message, 404, details);
  }
}

class ConflictError extends AppError {
  constructor(message = "Конфлікт даних", details = null) {
    super(message, 409, details);
  }
}

class ValidationError extends AppError {
  constructor(message = "Помилка валідації даних", details = null) {
    super(message, 400, details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
