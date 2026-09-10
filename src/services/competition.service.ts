import { clamp, round1 } from "../utils/serialize";
import type { CompetitionInput, CompetitionLevel, CompetitionResult } from "../types";

function normalizeSellers(sellerCount: number): number {
  return clamp((sellerCount / 250) * 100);
}

function normalizeListings(activeListings: number): number {
  return clamp((activeListings / 400) * 100);
}

export class CompetitionScoreService {
  static calculate(input: CompetitionInput): CompetitionResult {
    const sellerCount = Math.max(0, input.sellerCount);
    const activeListings = Math.max(0, input.activeListings);
    const salesVelocity = clamp(input.salesVelocity);
    const marketSaturation = clamp(input.marketSaturation);
    const priceCompetition = clamp(input.priceCompetition);

    const score = round1(
      normalizeSellers(sellerCount) * 0.25 +
        normalizeListings(activeListings) * 0.25 +
        salesVelocity * 0.15 +
        marketSaturation * 0.2 +
        priceCompetition * 0.15,
    );

    return {
      score,
      level: CompetitionScoreService.level(score),
      breakdown: { sellerCount, activeListings, salesVelocity, marketSaturation, priceCompetition },
      dataStatus: "calculated",
    };
  }

  static level(score: number): CompetitionLevel {
    if (score <= 40) return "LOW";
    if (score <= 70) return "MEDIUM";
    return "HIGH";
  }

  static fromMarketplace(params: {
    sellerCount: number;
    activeListings: number;
    soldCount: number;
    price: number;
  }): CompetitionResult {
    const saturation = clamp((params.sellerCount / Math.max(1, params.activeListings / 2)) * 40);
    const velocity = clamp((params.soldCount / Math.max(1, params.activeListings)) / 80 * 100);
    const priceCompetition = clamp(100 - Math.min(params.price, 100));
    return CompetitionScoreService.calculate({
      sellerCount: params.sellerCount,
      activeListings: params.activeListings,
      salesVelocity: velocity,
      marketSaturation: saturation,
      priceCompetition,
    });
  }
}
