import mongoose from "mongoose";
import { env } from "./env";
import { memoryStore } from "../utils/memory-store";
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

import { PLANS } from "./plans";

const SEED_EMAILS = [
  "demo@selllix.com",
  "admin@selllix.com",
  "samir@example.com",
  "elena@example.com",
  "maya@example.com",
];

let memoryMode = true;

export function isMemoryMode(): boolean {
  return memoryMode;
}

export function getDbMode(): "memory" | "mongo" {
  return memoryMode ? "memory" : "mongo";
}

async function seedMongoIfEmpty(): Promise<void> {
  const productCount = await ProductModel.countDocuments();
  if (productCount > 0) return;

  const inserts: Promise<unknown>[] = [
    ProductModel.insertMany(memoryStore.products),
    CompetitorModel.insertMany(memoryStore.competitors),
    KeywordModel.insertMany(memoryStore.keywords),
    MarketTrendModel.insertMany(memoryStore.marketTrends),
    CompetitorProductModel.insertMany(memoryStore.competitorProducts),
    ProductSalesModel.insertMany(memoryStore.productSales),
    SupplierModel.insertMany(memoryStore.suppliers),
  ];
  await Promise.all(inserts);
  void UserModel;
  void SubscriptionModel;
  void ProductResearchModel;
  void TrackedProductModel;
  void SavedProductModel;
  void SavedSearchModel;
  void SearchHistoryModel;
  void NotificationModel;
  void AlertModel;
  void PaymentModel;
  void ApiUsageModel;
  void ProfitCalculationModel;
  void SessionModel;
}

async function ensurePlatformOwner(): Promise<void> {
  await UserModel.deleteMany({ email: { $in: SEED_EMAILS } });
  const owner = await UserModel.findOne({ role: "SUPER_ADMIN" }).lean();
  if (owner) return;
  const candidate = await UserModel.findOne({ accountStatus: "active" }).sort({ createdAt: 1 });
  if (!candidate) return;
  candidate.role = "SUPER_ADMIN";
  candidate.plan = "BUSINESS";
  candidate.credits = PLANS.BUSINESS.credits;
  candidate.subscriptionStatus = "active";
  candidate.emailVerified = true;
  await candidate.save();
  console.log(`[db] Promoted ${candidate.email} to SUPER_ADMIN`);
}

export async function connectDb(): Promise<void> {
  memoryStore.seed();
  memoryMode = true;

  if (!env.MONGODB_URI) {
    console.log("[db] MONGODB_URI empty — using in-memory store (demo mode)");
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    memoryMode = false;
    await seedMongoIfEmpty();
    await ensurePlatformOwner();
    console.log("[db] Connected to MongoDB");
  } catch (error) {
    memoryMode = true;
    const message = error instanceof Error ? error.message : "unknown error";
    console.warn(`[db] MongoDB connection failed (${message}) — falling back to in-memory store`);
  }
}

export async function disconnectDb(): Promise<void> {
  if (!memoryMode && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
