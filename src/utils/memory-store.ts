import { v4 as uuid } from "uuid";
import {
  DEMO_COMPETITOR_PRODUCTS,
  DEMO_COMPETITORS,
  DEMO_KEYWORDS,
  DEMO_MARKET_TRENDS,
  DEMO_PRODUCTS,
  buildProductHistory,
} from "../integrations/mock-marketplace.provider";
import type {
  AlertDoc,
  ApiUsageDoc,
  CompetitorDoc,
  CompetitorProductDoc,
  KeywordDoc,
  MarketTrendDoc,
  NotificationDoc,
  PaymentDoc,
  ProductDoc,
  ProductResearchDoc,
  ProductSalesDoc,
  ProfitCalculationDoc,
  SavedProductDoc,
  SavedSearchDoc,
  SearchHistoryDoc,
  SessionDoc,
  SubscriptionDoc,
  SupplierDoc,
  TrackedProductDoc,
  UserDoc,
} from "../types";
import { nowIso } from "./serialize";

export class MemoryStore {
  users: UserDoc[] = [];
  subscriptions: SubscriptionDoc[] = [];
  products: ProductDoc[] = [];
  productResearch: ProductResearchDoc[] = [];
  productSales: ProductSalesDoc[] = [];
  competitors: CompetitorDoc[] = [];
  competitorProducts: CompetitorProductDoc[] = [];
  marketTrends: MarketTrendDoc[] = [];
  keywords: KeywordDoc[] = [];
  trackedProducts: TrackedProductDoc[] = [];
  savedProducts: SavedProductDoc[] = [];
  searchHistory: SearchHistoryDoc[] = [];
  profitCalculations: ProfitCalculationDoc[] = [];
  suppliers: SupplierDoc[] = [];
  notifications: NotificationDoc[] = [];
  savedSearches: SavedSearchDoc[] = [];
  apiUsage: ApiUsageDoc[] = [];
  payments: PaymentDoc[] = [];
  alerts: AlertDoc[] = [];
  sessions: SessionDoc[] = [];

  seed(): void {
    const createdAt = nowIso();
    this.users = [];
    this.subscriptions = [];
    this.trackedProducts = [];
    this.savedProducts = [];
    this.savedSearches = [];
    this.searchHistory = [];
    this.notifications = [];
    this.alerts = [];
    this.payments = [];
    this.productResearch = [];
    this.profitCalculations = [];
    this.apiUsage = [];
    this.sessions = [];

    this.products = DEMO_PRODUCTS.map((p) => ({ ...p }));
    this.competitors = DEMO_COMPETITORS.map((c) => ({ ...c }));
    this.keywords = DEMO_KEYWORDS.map((k) => ({ ...k }));
    this.marketTrends = DEMO_MARKET_TRENDS.map((t) => ({ ...t }));
    this.competitorProducts = DEMO_COMPETITOR_PRODUCTS.map((row) => ({
      _id: uuid(),
      competitorId: row.competitorId,
      productId: row.productId,
      createdAt,
    }));

    this.productSales = this.products.flatMap((p) =>
      buildProductHistory(p, 30).map((point) => ({
        _id: uuid(),
        productId: p._id,
        date: point.date,
        sales: point.sales,
        price: point.price,
        revenue: point.revenue,
        dataStatus: "demo" as const,
      })),
    );

    this.suppliers = [
      supplier("Shenzhen Power Gadgets", 9.4, 2.1, "12-18", 4.6, 2400, 14.2, ["Automotive", "Electronics"], ["prod_001", "prod_011"]),
      supplier("Ningbo Home Works", 8.2, 3.4, "15-22", 4.4, 1800, 10.1, ["Home & Garden"], ["prod_002", "prod_019"]),
      supplier("Guangzhou Light Co", 4.8, 1.6, "10-16", 4.5, 8000, 8.9, ["Home & Garden"], ["prod_003"]),
      supplier("PetCare OEM", 11.2, 3.8, "14-20", 4.7, 900, 13.4, ["Pet Supplies"], ["prod_006", "prod_012"]),
      supplier("BeautyLab Private Label", 3.1, 1.2, "9-14", 4.3, 12000, 7.6, ["Beauty"], ["prod_014", "prod_020"]),
      supplier("AutoVolt Parts", 16.5, 4.2, "16-24", 4.5, 650, 21.0, ["Automotive"], ["prod_017"]),
      supplier("FitGear Direct", 5.4, 2.0, "11-17", 4.4, 4300, 7.2, ["Sports"], ["prod_010", "prod_016"]),
      supplier("OptiBeam Devices", 24.0, 5.5, "18-26", 4.2, 420, 32.5, ["Electronics"], ["prod_005"]),
    ];
  }

  reset(): void {
    this.users = [];
    this.subscriptions = [];
    this.products = [];
    this.productResearch = [];
    this.productSales = [];
    this.competitors = [];
    this.competitorProducts = [];
    this.marketTrends = [];
    this.keywords = [];
    this.trackedProducts = [];
    this.savedProducts = [];
    this.searchHistory = [];
    this.profitCalculations = [];
    this.suppliers = [];
    this.notifications = [];
    this.savedSearches = [];
    this.apiUsage = [];
    this.payments = [];
    this.alerts = [];
    this.sessions = [];
    this.seed();
  }
}

function supplier(
  name: string,
  productCost: number,
  shipping: number,
  deliveryDays: string,
  rating: number,
  stock: number,
  estimatedProfit: number,
  categories: string[],
  productIds: string[],
): SupplierDoc {
  const createdAt = nowIso();
  return {
    _id: uuid(),
    name,
    productCost,
    shipping,
    deliveryDays,
    rating,
    stock,
    estimatedProfit,
    categories,
    productIds,
    dataStatus: "demo",
    createdAt,
    updatedAt: createdAt,
  };
}

export const memoryStore = new MemoryStore();
