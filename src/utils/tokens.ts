import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthPayload } from "../types";

export const REFRESH_COOKIE = "selllix_refresh";

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: AuthPayload, remember = false): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: (remember ? env.REFRESH_TOKEN_TTL_REMEMBER : env.REFRESH_TOKEN_TTL) as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function refreshCookieOptions(remember = false) {
  const maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
