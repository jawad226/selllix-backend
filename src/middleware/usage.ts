import type { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { repo } from "../store/repo";
import { usageService } from "../services/usage.service";
import type { UsageType } from "../types";
import { asyncHandler } from "../utils/async-handler";
import { nowIso } from "../utils/serialize";

export function usageLogger(req: Request, res: Response, next: NextFunction): void {
  const started = Date.now();
  res.on("finish", () => {
    if (!req.path.startsWith("/api")) return;
    void repo.apiUsage.create({
      _id: uuid(),
      userId: req.user?.sub,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      createdAt: nowIso(),
    });
    void started;
  });
  next();
}

export function checkLimit(type: UsageType) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next();
      return;
    }
    await usageService.assertWithinLimit(req.user.sub, req.user.plan, type);
    next();
  });
}

export function checkCredits() {
  return checkLimit("searches");
}
