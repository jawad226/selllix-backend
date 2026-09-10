import { getPlan } from "../config/plans";
import type { ProductDoc, PublicUser, UserDoc } from "../types";

export function toPublicUser(user: UserDoc): PublicUser {
  const plan = getPlan(user.plan);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    plan: user.plan,
    credits: user.credits,
    creditLimit: plan.credits,
    subscriptionStatus: user.subscriptionStatus,
    emailVerified: user.emailVerified,
    timezone: user.timezone,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
  };
}

export function toProductDto(product: ProductDoc) {
  return {
    id: product._id,
    externalId: product.externalId,
    marketplace: product.marketplace,
    title: product.title,
    description: product.description,
    image: product.image,
    category: product.category,
    price: product.price,
    currency: product.currency,
    soldCount: product.soldCount,
    revenue: product.revenue,
    activeListings: product.activeListings,
    sellerCount: product.sellerCount,
    sellThroughRate: product.sellThroughRate,
    competitionScore: product.competitionScore,
    competitionLevel: product.competitionLevel,
    demandScore: product.demandScore,
    demandLevel: product.demandLevel,
    profitScore: product.profitScore,
    trendScore: product.trendScore,
    trend: product.trend,
    opportunityScore: product.opportunityScore,
    rating: product.rating,
    reviews: product.reviews,
    dataStatus: product.dataStatus,
    lastUpdated: product.lastUpdated,
  };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parsePage(value: unknown, fallback = 1): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function parseLimit(value: unknown, fallback = 20): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(100, Math.floor(n));
}
