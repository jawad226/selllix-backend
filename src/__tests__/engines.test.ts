import { beforeEach, describe, expect, it } from "vitest";
import { OpportunityScoreService } from "../services/opportunity.service";
import { ProfitService } from "../services/profit.service";
import { CompetitionScoreService } from "../services/competition.service";
import { usageService } from "../services/usage.service";
import { memoryStore } from "../utils/memory-store";
import { AppError } from "../utils/app-error";
import { v4 as uuid } from "uuid";
import { nowIso } from "../utils/serialize";
import { PLANS } from "../config/plans";

describe("OpportunityScoreService", () => {
  it("applies the documented weighted formula", () => {
    const input = { demand: 80, growth: 70, competition: 60, profit: 50, priceStability: 40, trend: 20 };
    const result = OpportunityScoreService.calculate(input);
    const expected =
      80 * 0.3 + 70 * 0.2 + 60 * 0.2 + 50 * 0.15 + 40 * 0.1 + 20 * 0.05;
    expect(result.score).toBeCloseTo(Math.round(expected * 10) / 10, 5);
    expect(result.dataStatus).toBe("calculated");
  });

  it("labels score bands", () => {
    expect(OpportunityScoreService.label(0)).toBe("Poor");
    expect(OpportunityScoreService.label(30)).toBe("Poor");
    expect(OpportunityScoreService.label(31)).toBe("Weak");
    expect(OpportunityScoreService.label(50)).toBe("Weak");
    expect(OpportunityScoreService.label(51)).toBe("Average");
    expect(OpportunityScoreService.label(70)).toBe("Average");
    expect(OpportunityScoreService.label(71)).toBe("Good");
    expect(OpportunityScoreService.label(85)).toBe("Good");
    expect(OpportunityScoreService.label(86)).toBe("Excellent");
    expect(OpportunityScoreService.label(100)).toBe("Excellent");
  });
});

describe("ProfitService", () => {
  it("calculates profit, margin, and ROI on the backend", () => {
    const result = ProfitService.calculate({
      sellingPrice: 100,
      productCost: 40,
      shipping: 10,
      marketplaceFees: 13,
      advertisingCost: 5,
      otherCosts: 2,
    });
    expect(result.profit).toBe(30);
    expect(result.totalCosts).toBe(70);
    expect(result.profitMargin).toBe(30);
    expect(result.roi).toBe(75);
    expect(result.dataStatus).toBe("calculated");
  });
});

describe("CompetitionScoreService", () => {
  it("returns LOW / MEDIUM / HIGH from the score", () => {
    expect(CompetitionScoreService.level(10)).toBe("LOW");
    expect(CompetitionScoreService.level(40)).toBe("LOW");
    expect(CompetitionScoreService.level(41)).toBe("MEDIUM");
    expect(CompetitionScoreService.level(70)).toBe("MEDIUM");
    expect(CompetitionScoreService.level(71)).toBe("HIGH");
    const result = CompetitionScoreService.calculate({
      sellerCount: 20,
      activeListings: 30,
      salesVelocity: 20,
      marketSaturation: 15,
      priceCompetition: 10,
    });
    expect(result.dataStatus).toBe("calculated");
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.level);
  });
});

describe("subscription limits", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("blocks FREE users after the monthly search limit", async () => {
    const userId = uuid();
    memoryStore.users.push({
      _id: userId,
      name: "Free User",
      email: "free@selllix.com",
      password: "x",
      role: "USER",
      plan: "FREE",
      credits: PLANS.FREE.credits,
      subscriptionStatus: "none",
      emailVerified: true,
      timezone: "UTC",
      accountStatus: "active",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    for (let i = 0; i < PLANS.FREE.searches; i += 1) {
      await usageService.increment(userId, "searches");
    }
    await expect(usageService.assertWithinLimit(userId, "FREE", "searches")).rejects.toBeInstanceOf(AppError);
    await expect(usageService.assertWithinLimit(userId, "FREE", "searches")).rejects.toMatchObject({
      code: "PLAN_LIMIT_REACHED",
    });
  });

  it("allows unlimited competitor research on PRO", async () => {
    const userId = uuid();
    memoryStore.users.push({
      _id: userId,
      name: "Pro User",
      email: "pro@selllix.com",
      password: "x",
      role: "USER",
      plan: "PRO",
      credits: PLANS.PRO.credits,
      subscriptionStatus: "active",
      emailVerified: true,
      timezone: "UTC",
      accountStatus: "active",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    for (let i = 0; i < 20; i += 1) {
      await usageService.increment(userId, "competitors");
    }
    await expect(usageService.assertWithinLimit(userId, "PRO", "competitors")).resolves.toBeUndefined();
  });
});
