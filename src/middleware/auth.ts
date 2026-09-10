import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/tokens";
import { repo } from "../store/repo";
import type { Role } from "../types";
import { asyncHandler } from "../utils/async-handler";

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    throw AppError.unauthorized();
  }

  const payload = verifyAccessToken(token);
  const user = await repo.users.findById(payload.sub);
  if (!user) {
    throw AppError.unauthorized("User not found");
  }
  if (user.accountStatus === "suspended") {
    throw AppError.forbidden("Account is suspended", "ACCOUNT_SUSPENDED");
  }

  req.user = {
    sub: user._id,
    role: user.role,
    plan: user.plan,
    email: user.email,
    name: user.name,
  };
  next();
});

export function requireRole(...roles: Role[]) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden();
    }
    next();
  });
}
