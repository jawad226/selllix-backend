import { clamp, round1 } from "../utils/serialize";
import type { DemandInput, DemandLevel, DemandResult } from "../types";

export class DemandScoreService {
  static calculate(input: DemandInput): DemandResult {
    const soldNorm = clamp((Math.log10(Math.max(1, input.soldCount)) / 5) * 100);
    const sellThrough = clamp(input.sellThroughRate);
    const reviewsNorm = clamp((Math.log10(Math.max(1, input.reviews)) / 4) * 100);
    const ratingNorm = clamp((input.rating / 5) * 100);

    const score = round1(soldNorm * 0.4 + sellThrough * 0.3 + reviewsNorm * 0.15 + ratingNorm * 0.15);

    return {
      score,
      level: DemandScoreService.level(score),
      breakdown: {
        soldCount: input.soldCount,
        sellThroughRate: input.sellThroughRate,
        reviews: input.reviews,
        rating: input.rating,
      },
      dataStatus: "calculated",
    };
  }

  static level(score: number): DemandLevel {
    if (score < 40) return "LOW";
    if (score < 70) return "MEDIUM";
    return "HIGH";
  }
}
