import { round2 } from "../utils/serialize";
import type { ProfitInput, ProfitResult } from "../types";

export class ProfitService {
  static calculate(input: ProfitInput): ProfitResult {
    const sellingPrice = Math.max(0, input.sellingPrice);
    const productCost = Math.max(0, input.productCost);
    const shipping = Math.max(0, input.shipping);
    const marketplaceFees = Math.max(0, input.marketplaceFees);
    const advertisingCost = Math.max(0, input.advertisingCost);
    const otherCosts = Math.max(0, input.otherCosts);

    const totalCosts = round2(productCost + shipping + marketplaceFees + advertisingCost + otherCosts);
    const profit = round2(sellingPrice - totalCosts);
    const profitMargin = sellingPrice > 0 ? round2((profit / sellingPrice) * 100) : 0;
    const roi = productCost > 0 ? round2((profit / productCost) * 100) : 0;

    return {
      sellingPrice,
      productCost,
      shipping,
      marketplaceFees,
      advertisingCost,
      otherCosts,
      revenue: sellingPrice,
      totalCosts,
      profit,
      profitMargin,
      roi,
      dataStatus: "calculated",
    };
  }

  static scoreFromPrice(price: number, categoryMargin = 0.35): number {
    const estimate = ProfitService.calculate({
      sellingPrice: price,
      productCost: round2(price * categoryMargin),
      shipping: Math.min(8, round2(price * 0.08)),
      marketplaceFees: round2(price * 0.13),
      advertisingCost: round2(price * 0.05),
      otherCosts: round2(price * 0.02),
    });
    const marginScore = Math.min(100, Math.max(0, estimate.profitMargin * 1.6));
    return Math.round(marginScore * 10) / 10;
  }
}
