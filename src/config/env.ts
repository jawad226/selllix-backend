import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().optional().default(""),
  JWT_SECRET: z.string().min(16).default("selllix-dev-access-secret-change-in-production-32"),
  JWT_REFRESH_SECRET: z.string().min(16).default("selllix-dev-refresh-secret-change-in-production-32"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  REFRESH_TOKEN_TTL_REMEMBER: z.string().default("30d"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  EBAY_CLIENT_ID: z.string().optional().default(""),
  EBAY_CLIENT_SECRET: z.string().optional().default(""),
  REDIS_URL: z.string().optional().default(""),
  AI_API_KEY: z.string().optional().default(""),
  DEMO_MODE: z
    .string()
    .optional()
    .default("true")
    .transform((v) => v === "true" || v === "1"),
});

export const env = envSchema.parse(process.env);

export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
