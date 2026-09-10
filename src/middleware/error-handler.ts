import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { sendError } from "../utils/api-response";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, "NOT_FOUND", 404);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.code, err.statusCode);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    sendError(res, message || "Validation failed", "VALIDATION_ERROR", 422);
    return;
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    sendError(res, "Invalid or expired token", "UNAUTHORIZED", 401);
    return;
  }

  if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
    sendError(res, "A record with that unique field already exists", "CONFLICT", 409);
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  if (env.NODE_ENV !== "production") {
    console.error(err);
  }
  sendError(res, env.NODE_ENV === "production" ? "Internal server error" : message, "INTERNAL_ERROR", 500);
}
