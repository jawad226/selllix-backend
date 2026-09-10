import { repo } from "../store/repo";
import { AppError } from "../utils/app-error";
import { productService } from "./product.service";
import { ProfitService } from "./profit.service";
import type { SupplierDoc } from "../types";

function toSupplierDto(s: SupplierDoc) {
  return {
    id: s._id,
    name: s.name,
    productCost: s.productCost,
    shipping: s.shipping,
    deliveryDays: s.deliveryDays,
    rating: s.rating,
    stock: s.stock,
    estimatedProfit: s.estimatedProfit,
    dataStatus: s.dataStatus,
  };
}

export const supplierService = {
  async search(q?: string) {
    const items = await repo.suppliers.find();
    const filtered = q
      ? items.filter((s) => `${s.name} ${s.categories.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      : items;
    return filtered.map((s) => toSupplierDto(s));
  },

  async get(id: string) {
    const item = await repo.suppliers.findById(id);
    if (!item) throw AppError.notFound("Supplier not found");
    return toSupplierDto(item);
  },

  async match(productId: string) {
    const product = await productService.requireProduct(productId);
    const items = await repo.suppliers.find();
    const matched = items
      .filter((s) => s.productIds.includes(product._id) || s.categories.includes(product.category))
      .map((s) => {
        const calc = ProfitService.calculate({
          sellingPrice: product.price,
          productCost: s.productCost,
          shipping: s.shipping,
          marketplaceFees: Math.round(product.price * 0.13 * 100) / 100,
          advertisingCost: Math.round(product.price * 0.05 * 100) / 100,
          otherCosts: 0,
        });
        return {
          ...toSupplierDto(s),
          estimatedProfit: calc.profit,
          profitMargin: calc.profitMargin,
          roi: calc.roi,
          matchedProductId: product._id,
          dataStatus: "calculated" as const,
        };
      })
      .sort((a, b) => b.estimatedProfit - a.estimatedProfit);
    return { productId: product._id, matches: matched, dataStatus: "calculated" as const };
  },
};
