import { v4 as uuid } from "uuid";
import { getPlan, isUnlimited } from "../config/plans";
import { repo } from "../store/repo";
import type { Plan, UsageType } from "../types";
import { AppError } from "../utils/app-error";
import { currentPeriod, nowIso } from "../utils/serialize";

function periodStart(): string {
  return `${currentPeriod()}-01`;
}

export const usageService = {
  async increment(userId: string, type: UsageType, path = ""): Promise<void> {
    await repo.apiUsage.create({
      _id: uuid(),
      userId,
      method: "USAGE",
      path: path || `usage:${type}`,
      statusCode: 200,
      usageType: type,
      createdAt: nowIso(),
    });
  },

  async count(userId: string, type: UsageType): Promise<number> {
    if (type === "tracked") {
      return repo.trackedProducts.count({ userId });
    }
    const start = periodStart();
    const rows = await repo.apiUsage.find({ userId, usageType: type });
    return rows.filter((row) => row.createdAt >= start).length;
  },

  async assertWithinLimit(userId: string, plan: Plan, type: UsageType): Promise<void> {
    const definition = getPlan(plan);
    const limit = definition[type];
    if (isUnlimited(limit)) return;
    const used = await this.count(userId, type);
    if (used >= limit) {
      throw AppError.planLimit(
        `Your ${definition.name} plan allows ${limit} ${type} ${type === "tracked" ? "" : "per month "}. Upgrade to continue.`,
      );
    }
  },

  async getUsage(userId: string, plan: Plan) {
    const definition = getPlan(plan);
    const [searches, competitors, tracked] = await Promise.all([
      this.count(userId, "searches"),
      this.count(userId, "competitors"),
      this.count(userId, "tracked"),
    ]);
    return {
      searches: { used: searches, limit: definition.searches },
      competitors: { used: competitors, limit: definition.competitors },
      tracked: { used: tracked, limit: definition.tracked },
      dataStatus: "actual" as const,
    };
  },
};
