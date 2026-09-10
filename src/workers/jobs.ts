import { nowIso } from "../utils/serialize";
import { memoryStore } from "../utils/memory-store";
import { isMemoryMode } from "../config/db";

export async function runProductSync(): Promise<void> {
  if (!isMemoryMode()) return;
  const stamp = nowIso();
  for (const product of memoryStore.products) {
    product.lastUpdated = stamp;
    product.updatedAt = stamp;
  }
}

export async function runCompetitorSync(): Promise<void> {
  if (!isMemoryMode()) return;
  const stamp = nowIso();
  for (const competitor of memoryStore.competitors) {
    competitor.lastScanned = stamp;
    competitor.updatedAt = stamp;
  }
}

export async function runTrackerUpdate(): Promise<void> {
  if (!isMemoryMode()) return;
  const stamp = nowIso();
  for (const row of memoryStore.trackedProducts) {
    const product = memoryStore.products.find((p) => p._id === row.productId);
    if (!product) continue;
    row.previousPrice = row.currentPrice;
    row.previousSales = row.currentSales;
    row.currentPrice = product.price;
    row.currentSales = product.soldCount;
    row.opportunityScore = product.opportunityScore;
    row.lastChecked = stamp;
    row.updatedAt = stamp;
  }
}

export async function runMarketUpdate(): Promise<void> {
  if (!isMemoryMode()) return;
  const stamp = nowIso();
  for (const trend of memoryStore.marketTrends) {
    trend.updatedAt = stamp;
  }
}

export async function runNotificationCheck(): Promise<void> {
  // Demo interval worker: marketplace alerts stay labeled as demo data.
}

export async function runSubscriptionSync(): Promise<void> {
  if (!isMemoryMode()) return;
  const now = Date.now();
  for (const sub of memoryStore.subscriptions) {
    if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() < now) {
      sub.status = "canceled";
      sub.updatedAt = nowIso();
    }
  }
}
