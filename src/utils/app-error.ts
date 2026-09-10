export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational = true;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message: string, code = "BAD_REQUEST"): AppError {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED"): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "You do not have permission to perform this action", code = "FORBIDDEN"): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND"): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = "CONFLICT"): AppError {
    return new AppError(message, 409, code);
  }

  static unprocessable(message: string, code = "VALIDATION_ERROR"): AppError {
    return new AppError(message, 422, code);
  }

  static tooMany(message = "Too many requests", code = "RATE_LIMITED"): AppError {
    return new AppError(message, 429, code);
  }

  static planLimit(message: string): AppError {
    return new AppError(message, 403, "PLAN_LIMIT_REACHED");
  }
}
