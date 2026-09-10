import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const skipInTest = env.NODE_ENV === "test";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => skipInTest || req.path.startsWith("/api/docs") || req.path === "/api/health",
  message: { success: false, message: "Too many requests", code: "RATE_LIMITED" },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => skipInTest,
  message: { success: false, message: "Too many authentication attempts", code: "RATE_LIMITED" },
});
