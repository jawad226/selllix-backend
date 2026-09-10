import type { CollectionName } from "../types";
import { memoryStore } from "../utils/memory-store";
import { isMemoryMode } from "../config/db";
import {
  AlertModel,
  ApiUsageModel,
  CompetitorModel,
  CompetitorProductModel,
  KeywordModel,
  MarketTrendModel,
  NotificationModel,
  PaymentModel,
  ProductModel,
  ProductResearchModel,
  ProductSalesModel,
  ProfitCalculationModel,
  SavedProductModel,
  SavedSearchModel,
  SearchHistoryModel,
  SessionModel,
  SubscriptionModel,
  SupplierModel,
  TrackedProductModel,
  UserModel,
} from "../models";

type Doc = { _id: string };

interface LeanModel {
  find: (filter: object) => { lean: () => Promise<unknown> };
  findById: (id: string) => { lean: () => Promise<unknown> };
  create: (doc: object) => Promise<{ toObject: () => unknown }>;
  findByIdAndUpdate: (id: string, update: object, opts: object) => { lean: () => Promise<unknown> };
  findByIdAndDelete: (id: string) => Promise<unknown>;
  countDocuments: (filter: object) => Promise<number>;
}

const models: Record<CollectionName, LeanModel> = {
  users: UserModel as LeanModel,
  subscriptions: SubscriptionModel as LeanModel,
  products: ProductModel as LeanModel,
  productResearch: ProductResearchModel as LeanModel,
  productSales: ProductSalesModel as LeanModel,
  competitors: CompetitorModel as LeanModel,
  competitorProducts: CompetitorProductModel as LeanModel,
  marketTrends: MarketTrendModel as LeanModel,
  keywords: KeywordModel as LeanModel,
  trackedProducts: TrackedProductModel as LeanModel,
  savedProducts: SavedProductModel as LeanModel,
  searchHistory: SearchHistoryModel as LeanModel,
  profitCalculations: ProfitCalculationModel as LeanModel,
  suppliers: SupplierModel as LeanModel,
  notifications: NotificationModel as LeanModel,
  savedSearches: SavedSearchModel as LeanModel,
  apiUsage: ApiUsageModel as LeanModel,
  payments: PaymentModel as LeanModel,
  alerts: AlertModel as LeanModel,
  sessions: SessionModel as LeanModel,
};

function collection<T extends Doc>(name: CollectionName): T[] {
  return (memoryStore[name] as unknown as T[]) ?? [];
}

function matches(item: Doc, filter: Record<string, unknown>): boolean {
  const record = item as unknown as Record<string, unknown>;
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined) return true;
    if (key === "$or" && Array.isArray(value)) {
      return value.some((clause) => matches(item, clause as Record<string, unknown>));
    }
    const current = record[key];
    if (value && typeof value === "object" && !Array.isArray(value) && "$in" in (value as object)) {
      return ((value as { $in: unknown[] }).$in ?? []).includes(current);
    }
    if (value && typeof value === "object" && "$regex" in (value as object)) {
      const re = new RegExp(String((value as { $regex: string }).$regex), "i");
      return re.test(String(current ?? ""));
    }
    if (value && typeof value === "object" && "$gte" in (value as object)) {
      return Number(current) >= Number((value as { $gte: number }).$gte);
    }
    return current === value;
  });
}

export function createCollectionApi<T extends Doc>(name: CollectionName) {
  return {
    async find(filter: Record<string, unknown> = {}): Promise<T[]> {
      if (isMemoryMode()) {
        return collection<T>(name).filter((item) => matches(item, filter));
      }
      const docs = await models[name].find(filter).lean();
      return docs as unknown as T[];
    },
    async findById(id: string): Promise<T | undefined> {
      if (isMemoryMode()) {
        return collection<T>(name).find((item) => item._id === id);
      }
      const doc = await models[name].findById(id).lean();
      return (doc as unknown as T) ?? undefined;
    },
    async findOne(filter: Record<string, unknown>): Promise<T | undefined> {
      const items = await this.find(filter);
      return items[0];
    },
    async create(doc: T): Promise<T> {
      if (isMemoryMode()) {
        collection<T>(name).push(doc);
        return doc;
      }
      const created = await models[name].create(doc);
      return created.toObject() as T;
    },
    async updateById(id: string, patch: Partial<T>): Promise<T | undefined> {
      if (isMemoryMode()) {
        const items = collection<T>(name);
        const idx = items.findIndex((item) => item._id === id);
        if (idx < 0) return undefined;
        items[idx] = { ...items[idx], ...patch };
        return items[idx];
      }
      const updated = await models[name].findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
      return (updated as unknown as T) ?? undefined;
    },
    async deleteById(id: string): Promise<boolean> {
      if (isMemoryMode()) {
        const items = collection<T>(name);
        const idx = items.findIndex((item) => item._id === id);
        if (idx < 0) return false;
        items.splice(idx, 1);
        return true;
      }
      const res = await models[name].findByIdAndDelete(id);
      return Boolean(res);
    },
    async count(filter: Record<string, unknown> = {}): Promise<number> {
      if (isMemoryMode()) {
        return collection<T>(name).filter((item) => matches(item, filter)).length;
      }
      return models[name].countDocuments(filter);
    },
  };
}

export const repo = {
  users: createCollectionApi<import("../types").UserDoc>("users"),
  subscriptions: createCollectionApi<import("../types").SubscriptionDoc>("subscriptions"),
  products: createCollectionApi<import("../types").ProductDoc>("products"),
  productResearch: createCollectionApi<import("../types").ProductResearchDoc>("productResearch"),
  productSales: createCollectionApi<import("../types").ProductSalesDoc>("productSales"),
  competitors: createCollectionApi<import("../types").CompetitorDoc>("competitors"),
  competitorProducts: createCollectionApi<import("../types").CompetitorProductDoc>("competitorProducts"),
  marketTrends: createCollectionApi<import("../types").MarketTrendDoc>("marketTrends"),
  keywords: createCollectionApi<import("../types").KeywordDoc>("keywords"),
  trackedProducts: createCollectionApi<import("../types").TrackedProductDoc>("trackedProducts"),
  savedProducts: createCollectionApi<import("../types").SavedProductDoc>("savedProducts"),
  searchHistory: createCollectionApi<import("../types").SearchHistoryDoc>("searchHistory"),
  profitCalculations: createCollectionApi<import("../types").ProfitCalculationDoc>("profitCalculations"),
  suppliers: createCollectionApi<import("../types").SupplierDoc>("suppliers"),
  notifications: createCollectionApi<import("../types").NotificationDoc>("notifications"),
  savedSearches: createCollectionApi<import("../types").SavedSearchDoc>("savedSearches"),
  apiUsage: createCollectionApi<import("../types").ApiUsageDoc>("apiUsage"),
  payments: createCollectionApi<import("../types").PaymentDoc>("payments"),
  alerts: createCollectionApi<import("../types").AlertDoc>("alerts"),
  sessions: createCollectionApi<import("../types").SessionDoc>("sessions"),
};
