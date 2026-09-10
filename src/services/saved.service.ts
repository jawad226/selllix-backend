import { v4 as uuid } from "uuid";
import { repo } from "../store/repo";
import { AppError } from "../utils/app-error";
import { nowIso, toProductDto } from "../utils/serialize";
import { productService } from "./product.service";
import { ProfitService } from "./profit.service";
import type { AuthUser, ProfitInput } from "../types";

export const savedService = {
  async products(user: AuthUser) {
    const rows = await repo.savedProducts.find({ userId: user.sub });
    return Promise.all(
      rows.map(async (row) => {
        const product = await productService.requireProduct(row.productId);
        return { id: row._id, product: toProductDto(product), notes: row.notes, createdAt: row.createdAt };
      }),
    );
  },

  async saveProduct(user: AuthUser, productId: string, notes = "") {
    const product = await productService.requireProduct(productId);
    const existing = (await repo.savedProducts.find({ userId: user.sub, productId }))[0];
    if (existing) throw AppError.conflict("Product already saved");
    const row = await repo.savedProducts.create({
      _id: uuid(),
      userId: user.sub,
      productId: product._id,
      notes,
      createdAt: nowIso(),
    });
    return { id: row._id, product: toProductDto(product), notes: row.notes, createdAt: row.createdAt };
  },

  async removeProduct(id: string, user: AuthUser) {
    const row = await repo.savedProducts.findById(id);
    if (!row || row.userId !== user.sub) throw AppError.notFound("Saved product not found");
    await repo.savedProducts.deleteById(id);
    return { deleted: true };
  },

  async searches(user: AuthUser) {
    const rows = await repo.savedSearches.find({ userId: user.sub });
    return rows.map((r) => ({
      id: r._id,
      name: r.name,
      query: r.query,
      filters: r.filters,
      createdAt: r.createdAt,
    }));
  },

  async saveSearch(user: AuthUser, input: { name: string; query: string; filters: Record<string, unknown> }) {
    const row = await repo.savedSearches.create({
      _id: uuid(),
      userId: user.sub,
      name: input.name,
      query: input.query,
      filters: input.filters ?? {},
      createdAt: nowIso(),
    });
    return { id: row._id, name: row.name, query: row.query, filters: row.filters, createdAt: row.createdAt };
  },

  async removeSearch(id: string, user: AuthUser) {
    const row = await repo.savedSearches.findById(id);
    if (!row || row.userId !== user.sub) throw AppError.notFound("Saved search not found");
    await repo.savedSearches.deleteById(id);
    return { deleted: true };
  },

  async history(user: AuthUser) {
    const rows = await repo.searchHistory.find({ userId: user.sub });
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50)
      .map((r) => ({ id: r._id, term: r.term, type: r.type, date: r.date, results: r.results }));
  },

  async deleteHistory(id: string, user: AuthUser) {
    const row = await repo.searchHistory.findById(id);
    if (!row || row.userId !== user.sub) throw AppError.notFound("History item not found");
    await repo.searchHistory.deleteById(id);
    return { deleted: true };
  },
};

export const profitCalcService = {
  async calculate(user: AuthUser, input: ProfitInput) {
    const result = ProfitService.calculate(input);
    await repo.profitCalculations.create({
      _id: uuid(),
      userId: user.sub,
      ...input,
      profit: result.profit,
      profitMargin: result.profitMargin,
      roi: result.roi,
      createdAt: nowIso(),
    });
    return result;
  },
};
