export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details: unknown;

  constructor(message: string, statusCode = 500, details: unknown = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Некоректний запит", details: unknown = null) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Не авторизовано", details: unknown = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Доступ заборонено", details: unknown = null) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ресурс не знайдено", details: unknown = null) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Конфлікт даних", details: unknown = null) {
    super(message, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Помилка валідації даних", details: unknown = null) {
    super(message, 400, details);
  }
}
