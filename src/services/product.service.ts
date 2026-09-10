import { v4 as uuid } from "uuid";
import { getMarketplaceProvider } from "../integrations/provider-factory";
import { repo } from "../store/repo";
import { paginate } from "../utils/api-response";
import { OpportunityScoreService } from "./opportunity.service";
import { usageService } from "./usage.service";
import { parseLimit, parsePage, toProductDto } from "../utils/serialize";
import type { AuthUser, ProductDoc } from "../types";
import { AppError } from "../utils/app-error";
import { nowIso } from "../utils/serialize";

function sortProducts(items: ProductDoc[], sort?: string): ProductDoc[] {
  const key = (sort ?? "-opportunityScore").replace(/^-/, "");
  const dir = sort?.startsWith("-") || !sort ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[key];
    const bv = (b as unknown as Record<string, unknown>)[key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
  });
}

export const productService = {
  async search(
    query: Record<string, unknown>,
    user: AuthUser,
  ) {
    const provider = getMarketplaceProvider();
    const products = await provider.searchProducts({
      query: typeof query.search === "string" ? query.search : typeof query.q === "string" ? query.q : undefined,
      category: typeof query.category === "string" ? query.category : undefined,
      marketplace: typeof query.marketplace === "string" ? query.marketplace : undefined,
      minPrice: query.minPrice !== undefined ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
      minScore: query.minScore !== undefined ? Number(query.minScore) : undefined,
    });
    const sorted = sortProducts(products, typeof query.sort === "string" ? query.sort : undefined);
    const page = parsePage(query.page);
    const limit = parseLimit(query.limit);
    const result = paginate(sorted.map(toProductDto), page, limit);
    await usageService.increment(user.sub, "searches", "/api/products/search");
    const dbUser = await repo.users.findById(user.sub);
    if (dbUser && dbUser.credits > 0) {
      await repo.users.updateById(user.sub, { credits: dbUser.credits - 1, updatedAt: nowIso() });
    }
    await repo.searchHistory.create({
      _id: uuid(),
      userId: user.sub,
      term: String(query.search ?? query.q ?? ""),
      type: "product",
      date: nowIso(),
      results: result.pagination.total,
    });
    return result;
  },

  async getById(id: string) {
    const provider = getMarketplaceProvider();
    const product = await provider.getProduct({ id });
    const opportunity = OpportunityScoreService.calculate({
      demand: product.demandScore,
      growth: product.trendScore,
      competition: Math.max(0, 100 - product.competitionScore),
      profit: product.profitScore,
      priceStability: 70,
      trend: product.trendScore,
    });
    return { ...toProductDto(product), opportunity };
  },

  async history(id: string) {
    const provider = getMarketplaceProvider();
    return provider.getProductHistory({ id, days: 30 });
  },

  async trending(range = "30d") {
    const provider = getMarketplaceProvider();
    const products = await provider.searchProducts({});
    void range;
    return sortProducts(products, "-trendScore").slice(0, 12).map(toProductDto);
  },

  async similar(id: string) {
    const provider = getMarketplaceProvider();
    const product = await provider.getProduct({ id });
    const all = await provider.searchProducts({ category: product.category });
    return all.filter((p) => p._id !== product._id).slice(0, 8).map(toProductDto);
  },

  async requireProduct(id: string): Promise<ProductDoc> {
    const fromStore = await repo.products.findById(id);
    if (fromStore) return fromStore;
    try {
      return await getMarketplaceProvider().getProduct({ id });
    } catch {
      throw AppError.notFound("Product not found");
    }
  },
};
