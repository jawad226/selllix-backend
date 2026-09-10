import { v4 as uuid } from "uuid";
import { repo } from "../store/repo";
import { AppError } from "../utils/app-error";
import { nowIso, toProductDto } from "../utils/serialize";
import { productService } from "./product.service";
import { usageService } from "./usage.service";
import type { AuthUser, ProductDoc, TrackedProductDoc } from "../types";

export const trackerService = {
  async list(user: AuthUser) {
    const rows = await repo.trackedProducts.find({ userId: user.sub });
    return Promise.all(
      rows.map(async (row) => {
        const product = await productService.requireProduct(row.productId);
        return toTrackedDto(row, product);
      }),
    );
  },

  async get(id: string, user: AuthUser) {
    const row = await repo.trackedProducts.findById(id);
    if (!row || row.userId !== user.sub) throw AppError.notFound("Tracked product not found");
    const product = await productService.requireProduct(row.productId);
    return toTrackedDto(row, product);
  },

  async add(productId: string, user: AuthUser) {
    await usageService.assertWithinLimit(user.sub, user.plan, "tracked");
    const existing = (await repo.trackedProducts.find({ userId: user.sub, productId }))[0];
    if (existing) throw AppError.conflict("Product is already tracked");
    const product = await productService.requireProduct(productId);
    const now = nowIso();
    const row = await repo.trackedProducts.create({
      _id: uuid(),
      userId: user.sub,
      productId: product._id,
      currentPrice: product.price,
      previousPrice: product.price,
      currentSales: product.soldCount,
      previousSales: product.soldCount,
      opportunityScore: product.opportunityScore,
      alertsEnabled: true,
      lastChecked: now,
      createdAt: now,
      updatedAt: now,
    });
    return toTrackedDto(row, product);
  },

  async remove(id: string, user: AuthUser) {
    const row = await repo.trackedProducts.findById(id);
    if (!row || row.userId !== user.sub) throw AppError.notFound("Tracked product not found");
    await repo.trackedProducts.deleteById(id);
    return { deleted: true };
  },
};

function toTrackedDto(row: TrackedProductDoc, product: ProductDoc) {
  return {
    id: row._id,
    product: toProductDto(product),
    currentPrice: row.currentPrice,
    previousPrice: row.previousPrice,
    currentSales: row.currentSales,
    previousSales: row.previousSales,
    opportunityScore: row.opportunityScore,
    alertsEnabled: row.alertsEnabled,
    lastChecked: row.lastChecked,
  };
}
