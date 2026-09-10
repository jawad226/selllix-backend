import { v4 as uuid } from "uuid";
import { getMarketplaceProvider } from "../integrations/provider-factory";
import { repo } from "../store/repo";
import { paginate } from "../utils/api-response";
import { AppError } from "../utils/app-error";
import { nowIso, parseLimit, parsePage, toProductDto } from "../utils/serialize";
import { usageService } from "./usage.service";
import type { AuthUser, CompetitorDoc } from "../types";

export const competitorService = {
  async list(query: Record<string, unknown>, user: AuthUser) {
    const provider = getMarketplaceProvider();
    const items = await provider.searchCompetitors({
      query: typeof query.search === "string" ? query.search : typeof query.q === "string" ? query.q : undefined,
      marketplace: typeof query.marketplace === "string" ? query.marketplace : undefined,
    });
    await usageService.increment(user.sub, "competitors", "/api/competitors");
    await repo.searchHistory.create({
      _id: uuid(),
      userId: user.sub,
      term: String(query.search ?? query.q ?? ""),
      type: "competitor",
      date: nowIso(),
      results: items.length,
    });
    return paginate(
      items.map(toCompetitorDto),
      parsePage(query.page),
      parseLimit(query.limit),
    );
  },

  async get(sellerId: string, user: AuthUser) {
    const provider = getMarketplaceProvider();
    const competitor = await provider.getCompetitor({ sellerId });
    await usageService.increment(user.sub, "competitors", `/api/competitors/${sellerId}`);
    return toCompetitorDto(competitor);
  },

  async products(sellerId: string) {
    const competitor = await getMarketplaceProvider().getCompetitor({ sellerId });
    const links = await repo.competitorProducts.find({ competitorId: competitor._id });
    const products = await Promise.all(links.map((link) => repo.products.findById(link.productId)));
    return products.filter(Boolean).map((p) => toProductDto(p!));
  },

  async analytics(sellerId: string) {
    const competitor = await getMarketplaceProvider().getCompetitor({ sellerId });
    const products = await this.products(sellerId);
    const avgOpportunity =
      products.length > 0
        ? Math.round((products.reduce((sum, p) => sum + p.opportunityScore, 0) / products.length) * 10) / 10
        : 0;
    return {
      competitor: toCompetitorDto(competitor),
      listingCount: products.length,
      averageOpportunity: avgOpportunity,
      estimatedRevenue: competitor.estimatedRevenue,
      growthRate: competitor.growthRate,
      dataStatus: competitor.dataStatus,
    };
  },

  async compare(sellerIds: string[], user: AuthUser) {
    if (sellerIds.length < 2 || sellerIds.length > 5) {
      throw AppError.badRequest("Compare between 2 and 5 competitors");
    }
    const unique = [...new Set(sellerIds)];
    const rows = await Promise.all(unique.map((id) => this.analytics(id)));
    await usageService.increment(user.sub, "competitors", "/api/competitors/compare");
    return rows;
  },
};

function toCompetitorDto(competitor: CompetitorDoc) {
  return {
    id: competitor._id,
    externalSellerId: competitor.externalSellerId,
    username: competitor.username,
    marketplace: competitor.marketplace,
    feedbackScore: competitor.feedbackScore,
    feedbackPercentage: competitor.feedbackPercentage,
    activeListings: competitor.activeListings,
    soldItems: competitor.soldItems,
    estimatedRevenue: competitor.estimatedRevenue,
    averagePrice: competitor.averagePrice,
    sellThroughRate: competitor.sellThroughRate,
    growthRate: competitor.growthRate,
    categories: competitor.categories,
    avatar: competitor.avatar,
    dataStatus: competitor.dataStatus,
    lastScanned: competitor.lastScanned,
  };
}
