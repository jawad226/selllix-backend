import { CompetitionScoreService } from "../services/competition.service";
import { DemandScoreService } from "../services/demand.service";
import { OpportunityScoreService } from "../services/opportunity.service";
import { ProfitService } from "../services/profit.service";
import { clamp, nowIso } from "./serialize";
import type { DataStatus, ProductDoc, TrendDirection } from "../types";

export type RawMarketplaceProduct = {
  _id: string;
  externalId: string;
  marketplace: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  soldCount: number;
  revenue: number;
  activeListings: number;
  sellerCount: number;
  sellThroughRate: number;
  rating: number;
  reviews: number;
  trendScore: number;
  growthScore?: number;
  priceStability?: number;
  currency?: string;
  dataStatus?: DataStatus;
};

export function trendFromScore(trendScore: number): TrendDirection {
  if (trendScore >= 62) return "up";
  if (trendScore <= 40) return "down";
  return "stable";
}

export function enrichMarketplaceProduct(raw: RawMarketplaceProduct): ProductDoc {
  const demand = DemandScoreService.calculate({
    soldCount: raw.soldCount,
    sellThroughRate: raw.sellThroughRate,
    reviews: raw.reviews,
    rating: raw.rating,
  });
  const competition = CompetitionScoreService.fromMarketplace({
    sellerCount: raw.sellerCount,
    activeListings: raw.activeListings,
    soldCount: raw.soldCount,
    price: raw.price,
  });
  const profitScore = ProfitService.scoreFromPrice(raw.price);
  const trendScore = clamp(raw.trendScore);
  const growthScore = clamp(raw.growthScore ?? trendScore);
  const priceStability = clamp(raw.priceStability ?? 70);
  const opportunity = OpportunityScoreService.calculate({
    demand: demand.score,
    growth: growthScore,
    competition: clamp(100 - competition.score),
    profit: profitScore,
    priceStability,
    trend: trendScore,
  });
  const stamp = nowIso();

  return {
    _id: raw._id,
    externalId: raw.externalId,
    marketplace: raw.marketplace,
    title: raw.title,
    description: raw.description,
    image: raw.image,
    category: raw.category,
    price: raw.price,
    currency: raw.currency ?? "USD",
    soldCount: raw.soldCount,
    revenue: raw.revenue,
    activeListings: raw.activeListings,
    sellerCount: raw.sellerCount,
    sellThroughRate: raw.sellThroughRate,
    competitionScore: competition.score,
    competitionLevel: competition.level,
    demandScore: demand.score,
    demandLevel: demand.level,
    profitScore,
    trendScore,
    trend: trendFromScore(trendScore),
    opportunityScore: opportunity.score,
    rating: raw.rating,
    reviews: raw.reviews,
    dataStatus: raw.dataStatus ?? "demo",
    lastUpdated: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  };
}
