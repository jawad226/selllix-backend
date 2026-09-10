import { clamp, round1 } from "../utils/serialize";
import type { OpportunityInput, OpportunityResult } from "../types";

const WEIGHTS = {
  demand: 0.3,
  growth: 0.2,
  competition: 0.2,
  profit: 0.15,
  priceStability: 0.1,
  trend: 0.05,
} as const;

export class OpportunityScoreService {
  static calculate(input: OpportunityInput): OpportunityResult {
    const demand = clamp(input.demand);
    const growth = clamp(input.growth);
    const competition = clamp(input.competition);
    const profit = clamp(input.profit);
    const priceStability = clamp(input.priceStability);
    const trend = clamp(input.trend);

    const score = round1(
      demand * WEIGHTS.demand +
        growth * WEIGHTS.growth +
        competition * WEIGHTS.competition +
        profit * WEIGHTS.profit +
        priceStability * WEIGHTS.priceStability +
        trend * WEIGHTS.trend,
    );

    return {
      score,
      label: OpportunityScoreService.label(score),
      breakdown: { demand, growth, competition, profit, priceStability, trend },
      dataStatus: "calculated",
    };
  }

  static label(score: number): string {
    if (score <= 30) return "Poor";
    if (score <= 50) return "Weak";
    if (score <= 70) return "Average";
    if (score <= 85) return "Good";
    return "Excellent";
  }

  static weights(): typeof WEIGHTS {
    return WEIGHTS;
  }
}
