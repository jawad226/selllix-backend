import { getMarketplaceProvider } from "../integrations/provider-factory";
import { DEMO_PRODUCTS } from "../integrations/mock-marketplace.provider";
import { toProductDto } from "../utils/serialize";
import { AppError } from "../utils/app-error";

export const marketService = {
  async trending() {
    const products = [...DEMO_PRODUCTS].sort((a, b) => b.trendScore - a.trendScore).slice(0, 12);
    return products.map(toProductDto);
  },

  async categories() {
    const provider = getMarketplaceProvider();
    const trends = await provider.getMarketData({});
    return trends.map((t) => ({
      id: t._id,
      name: t.category,
      demand: t.demand,
      competition: t.competition,
      averagePrice: t.averagePrice,
      growth: t.growth,
      productCount: t.productCount,
      dataStatus: t.dataStatus,
    }));
  },

  async category(id: string) {
    const provider = getMarketplaceProvider();
    const trends = await provider.getMarketData({ categoryId: id });
    const t = trends[0];
    if (!t) throw AppError.notFound("Category not found");
    const products = DEMO_PRODUCTS.filter((p) => p.category === t.category).map(toProductDto);
    return {
      id: t._id,
      name: t.category,
      demand: t.demand,
      competition: t.competition,
      averagePrice: t.averagePrice,
      growth: t.growth,
      productCount: t.productCount,
      dataStatus: t.dataStatus,
      products,
    };
  },
};
