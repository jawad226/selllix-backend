import { enrichMarketplaceProduct, type RawMarketplaceProduct } from "../utils/enrich-product";
import { nowIso } from "../utils/serialize";
import { AppError } from "../utils/app-error";
import type {
  CompetitorDoc,
  DataStatus,
  KeywordDoc,
  MarketTrendDoc,
  ProductDoc,
  ProductHistoryPoint,
} from "../types";
import type {
  GetCompetitorInput,
  GetKeywordDataInput,
  GetMarketDataInput,
  GetProductHistoryInput,
  GetProductInput,
  MarketplaceProvider,
  SearchCompetitorsInput,
  SearchProductsInput,
} from "./marketplace-provider";

const NOW = nowIso();

function product(raw: RawMarketplaceProduct): ProductDoc {
  return enrichMarketplaceProduct(raw);
}

export const DEMO_PRODUCTS: ProductDoc[] = [
  product({
    _id: "prod_001",
    externalId: "ebay-1001",
    marketplace: "eBay",
    title: "Wireless Car Charger Mount 15W Fast Charging",
    description:
      "Magnetic wireless car charger with 15W fast charging, one-hand mount, and 360° rotation. Demo catalog item for marketplace research.",
    image: "https://images.unsplash.com/photo-1617886322168-e746f1f0a44c?auto=format&fit=crop&w=800&q=80",
    category: "Automotive",
    price: 29.99,
    soldCount: 8420,
    revenue: 252400,
    activeListings: 186,
    sellerCount: 94,
    sellThroughRate: 68,
    rating: 4.6,
    reviews: 2104,
    trendScore: 74,
    growthScore: 71,
    priceStability: 78,
  }),
  product({
    _id: "prod_002",
    externalId: "ebay-1002",
    marketplace: "eBay",
    title: "Portable Blender USB Rechargeable 14oz",
    description: "Personal blender for smoothies on the go with USB-C charging. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
    category: "Home & Garden",
    price: 24.5,
    soldCount: 12110,
    revenue: 296700,
    activeListings: 240,
    sellerCount: 130,
    sellThroughRate: 72,
    rating: 4.4,
    reviews: 3310,
    trendScore: 69,
    growthScore: 64,
    priceStability: 66,
  }),
  product({
    _id: "prod_003",
    externalId: "ebay-1003",
    marketplace: "Amazon",
    title: "LED Strip Lights 50ft RGB with Remote",
    description: "Color-changing LED strip lights with app and remote control. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80",
    category: "Home & Garden",
    price: 18.99,
    soldCount: 28400,
    revenue: 539300,
    activeListings: 410,
    sellerCount: 210,
    sellThroughRate: 81,
    rating: 4.5,
    reviews: 8902,
    trendScore: 80,
    growthScore: 76,
    priceStability: 58,
  }),
  product({
    _id: "prod_004",
    externalId: "ebay-1004",
    marketplace: "eBay",
    title: "Phone Holder Dashboard Magnetic Mount",
    description: "Strong magnetic phone holder for dash and vent mounting. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    price: 12.99,
    soldCount: 15680,
    revenue: 203700,
    activeListings: 320,
    sellerCount: 180,
    sellThroughRate: 64,
    rating: 4.3,
    reviews: 4120,
    trendScore: 55,
    growthScore: 48,
    priceStability: 72,
  }),
  product({
    _id: "prod_005",
    externalId: "ebay-1005",
    marketplace: "eBay",
    title: "Mini Projector 1080P Portable Home Theater",
    description: "Compact projector with HDMI and smartphone mirroring. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    price: 79.99,
    soldCount: 4310,
    revenue: 344800,
    activeListings: 96,
    sellerCount: 42,
    sellThroughRate: 58,
    rating: 4.2,
    reviews: 980,
    trendScore: 77,
    growthScore: 81,
    priceStability: 61,
  }),
  product({
    _id: "prod_006",
    externalId: "ebay-1006",
    marketplace: "Amazon",
    title: "Pet Water Fountain 84oz Quiet Pump",
    description: "Automatic circulating water fountain for cats and dogs. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
    category: "Pet Supplies",
    price: 32.95,
    soldCount: 9780,
    revenue: 322200,
    activeListings: 154,
    sellerCount: 67,
    sellThroughRate: 75,
    rating: 4.7,
    reviews: 2560,
    trendScore: 72,
    growthScore: 70,
    priceStability: 80,
  }),
  product({
    _id: "prod_007",
    externalId: "ebay-1007",
    marketplace: "eBay",
    title: "USB Hub 7-Port USB 3.0 Powered",
    description: "Powered 7-port USB 3.0 hub for desktops and laptops. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    price: 22.49,
    soldCount: 6400,
    revenue: 143900,
    activeListings: 128,
    sellerCount: 71,
    sellThroughRate: 61,
    rating: 4.4,
    reviews: 1440,
    trendScore: 51,
    growthScore: 46,
    priceStability: 84,
  }),
  product({
    _id: "prod_008",
    externalId: "ebay-1008",
    marketplace: "eBay",
    title: "Smart Watch Fitness Tracker Heart Rate",
    description: "IP68 fitness smartwatch with heart rate and sleep tracking. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    price: 39.99,
    soldCount: 19220,
    revenue: 768500,
    activeListings: 265,
    sellerCount: 118,
    sellThroughRate: 70,
    rating: 4.3,
    reviews: 5210,
    trendScore: 66,
    growthScore: 63,
    priceStability: 54,
  }),
  product({
    _id: "prod_009",
    externalId: "ebay-1009",
    marketplace: "Amazon",
    title: "Ceramic Hair Straightener Tourmaline 1 Inch",
    description: "Tourmaline ceramic straightener with adjustable heat. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    category: "Beauty",
    price: 27.99,
    soldCount: 7340,
    revenue: 205400,
    activeListings: 190,
    sellerCount: 88,
    sellThroughRate: 59,
    rating: 4.5,
    reviews: 1876,
    trendScore: 60,
    growthScore: 57,
    priceStability: 73,
  }),
  product({
    _id: "prod_010",
    externalId: "ebay-1010",
    marketplace: "eBay",
    title: "Yoga Resistance Bands Set of 5 with Handles",
    description: "Latex resistance band kit for home workouts. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    category: "Sports",
    price: 16.99,
    soldCount: 22100,
    revenue: 375500,
    activeListings: 360,
    sellerCount: 195,
    sellThroughRate: 78,
    rating: 4.6,
    reviews: 6104,
    trendScore: 58,
    growthScore: 52,
    priceStability: 69,
  }),
  product({
    _id: "prod_011",
    externalId: "ebay-1011",
    marketplace: "eBay",
    title: "MagSafe Car Phone Mount Vent Clip",
    description: "MagSafe-compatible vent mount for iPhone. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    category: "Automotive",
    price: 21.5,
    soldCount: 5120,
    revenue: 110080,
    activeListings: 102,
    sellerCount: 48,
    sellThroughRate: 66,
    rating: 4.4,
    reviews: 890,
    trendScore: 82,
    growthScore: 85,
    priceStability: 75,
  }),
  product({
    _id: "prod_012",
    externalId: "ebay-1012",
    marketplace: "Amazon",
    title: "Stainless Steel Dog Bowl Set Elevated",
    description: "Raised stainless steel bowls with non-slip stand. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    category: "Pet Supplies",
    price: 19.99,
    soldCount: 8640,
    revenue: 172700,
    activeListings: 176,
    sellerCount: 91,
    sellThroughRate: 63,
    rating: 4.5,
    reviews: 2033,
    trendScore: 49,
    growthScore: 44,
    priceStability: 81,
  }),
  product({
    _id: "prod_013",
    externalId: "ebay-1013",
    marketplace: "eBay",
    title: "Portable Espresso Maker Manual 20 Bar",
    description: "Hand-powered espresso maker for travel and camping. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
    category: "Home & Garden",
    price: 44.99,
    soldCount: 2890,
    revenue: 130000,
    activeListings: 64,
    sellerCount: 29,
    sellThroughRate: 71,
    rating: 4.6,
    reviews: 612,
    trendScore: 76,
    growthScore: 79,
    priceStability: 77,
  }),
  product({
    _id: "prod_014",
    externalId: "ebay-1014",
    marketplace: "Amazon",
    title: "Vitamin C Serum 20% with Hyaluronic Acid",
    description: "Brightening facial serum with vitamin C and HA. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    category: "Beauty",
    price: 14.95,
    soldCount: 31040,
    revenue: 464000,
    activeListings: 520,
    sellerCount: 260,
    sellThroughRate: 74,
    rating: 4.4,
    reviews: 11240,
    trendScore: 63,
    growthScore: 59,
    priceStability: 48,
  }),
  product({
    _id: "prod_015",
    externalId: "ebay-1015",
    marketplace: "eBay",
    title: "Bluetooth Earbuds ENC Noise Cancelling",
    description: "True wireless earbuds with ENC and 32-hour case. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    price: 34.99,
    soldCount: 17890,
    revenue: 626000,
    activeListings: 298,
    sellerCount: 142,
    sellThroughRate: 69,
    rating: 4.2,
    reviews: 4760,
    trendScore: 61,
    growthScore: 55,
    priceStability: 50,
  }),
  product({
    _id: "prod_016",
    externalId: "ebay-1016",
    marketplace: "eBay",
    title: "Camping Sleeping Pad Ultralight Inflatable",
    description: "Lightweight inflatable sleeping pad with pump sack. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
    category: "Sports",
    price: 36.5,
    soldCount: 4210,
    revenue: 153700,
    activeListings: 88,
    sellerCount: 37,
    sellThroughRate: 67,
    rating: 4.5,
    reviews: 1022,
    trendScore: 73,
    growthScore: 75,
    priceStability: 71,
  }),
  product({
    _id: "prod_017",
    externalId: "ebay-1017",
    marketplace: "Amazon",
    title: "Portable Tire Inflator 150PSI Digital",
    description: "Cordless tire inflator with digital gauge and LED. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
    category: "Automotive",
    price: 49.99,
    soldCount: 6870,
    revenue: 343400,
    activeListings: 112,
    sellerCount: 54,
    sellThroughRate: 73,
    rating: 4.6,
    reviews: 1988,
    trendScore: 79,
    growthScore: 82,
    priceStability: 68,
  }),
  product({
    _id: "prod_018",
    externalId: "ebay-1018",
    marketplace: "eBay",
    title: "Cat Scratching Post Tower 52 Inch",
    description: "Multi-level cat tree with sisal posts and perch. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    category: "Pet Supplies",
    price: 59.99,
    soldCount: 3540,
    revenue: 212400,
    activeListings: 77,
    sellerCount: 31,
    sellThroughRate: 62,
    rating: 4.4,
    reviews: 744,
    trendScore: 57,
    growthScore: 53,
    priceStability: 76,
  }),
  product({
    _id: "prod_019",
    externalId: "ebay-1019",
    marketplace: "Amazon",
    title: "Mini Air Fryer 2Qt Compact",
    description: "Compact 2-quart air fryer for small kitchens. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80",
    category: "Home & Garden",
    price: 54.99,
    soldCount: 11240,
    revenue: 618100,
    activeListings: 148,
    sellerCount: 62,
    sellThroughRate: 77,
    rating: 4.7,
    reviews: 3650,
    trendScore: 71,
    growthScore: 68,
    priceStability: 64,
  }),
  product({
    _id: "prod_020",
    externalId: "ebay-1020",
    marketplace: "eBay",
    title: "Nail Gel Lamp UV LED 48W",
    description: "48W UV/LED nail lamp with 4 timer settings. Demo catalog item.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    category: "Beauty",
    price: 23.99,
    soldCount: 9050,
    revenue: 217100,
    activeListings: 205,
    sellerCount: 99,
    sellThroughRate: 65,
    rating: 4.5,
    reviews: 2210,
    trendScore: 54,
    growthScore: 50,
    priceStability: 70,
  }),
];

export const DEMO_COMPETITORS: CompetitorDoc[] = [
  {
    _id: "comp_001",
    externalSellerId: "techdeals_pro",
    username: "techdeals_pro",
    marketplace: "eBay",
    feedbackScore: 12480,
    feedbackPercentage: 99.4,
    activeListings: 312,
    soldItems: 54800,
    estimatedRevenue: 1420000,
    averagePrice: 34.2,
    sellThroughRate: 71,
    growthRate: 18.4,
    categories: ["Electronics", "Automotive"],
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    dataStatus: "demo",
    lastScanned: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    _id: "comp_002",
    externalSellerId: "homehaven_outlet",
    username: "homehaven_outlet",
    marketplace: "eBay",
    feedbackScore: 8920,
    feedbackPercentage: 98.7,
    activeListings: 268,
    soldItems: 33100,
    estimatedRevenue: 890000,
    averagePrice: 28.6,
    sellThroughRate: 66,
    growthRate: 12.1,
    categories: ["Home & Garden"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    dataStatus: "demo",
    lastScanned: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    _id: "comp_003",
    externalSellerId: "beautyboost_shop",
    username: "beautyboost_shop",
    marketplace: "Amazon",
    feedbackScore: 15600,
    feedbackPercentage: 99.1,
    activeListings: 194,
    soldItems: 72040,
    estimatedRevenue: 1180000,
    averagePrice: 19.4,
    sellThroughRate: 74,
    growthRate: 22.8,
    categories: ["Beauty"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    dataStatus: "demo",
    lastScanned: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    _id: "comp_004",
    externalSellerId: "petpalace_deals",
    username: "petpalace_deals",
    marketplace: "eBay",
    feedbackScore: 6740,
    feedbackPercentage: 98.9,
    activeListings: 142,
    soldItems: 21900,
    estimatedRevenue: 540000,
    averagePrice: 31.8,
    sellThroughRate: 69,
    growthRate: 15.2,
    categories: ["Pet Supplies"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    dataStatus: "demo",
    lastScanned: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    _id: "comp_005",
    externalSellerId: "autogear_hub",
    username: "autogear_hub",
    marketplace: "eBay",
    feedbackScore: 4310,
    feedbackPercentage: 97.8,
    activeListings: 188,
    soldItems: 16200,
    estimatedRevenue: 610000,
    averagePrice: 41.5,
    sellThroughRate: 63,
    growthRate: 9.6,
    categories: ["Automotive"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    dataStatus: "demo",
    lastScanned: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    _id: "comp_006",
    externalSellerId: "sportslife_store",
    username: "sportslife_store",
    marketplace: "Amazon",
    feedbackScore: 10120,
    feedbackPercentage: 99.0,
    activeListings: 226,
    soldItems: 40500,
    estimatedRevenue: 760000,
    averagePrice: 24.1,
    sellThroughRate: 72,
    growthRate: 14.7,
    categories: ["Sports"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    dataStatus: "demo",
    lastScanned: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const DEMO_COMPETITOR_PRODUCTS: Array<{ competitorId: string; productId: string }> = [
  { competitorId: "comp_001", productId: "prod_004" },
  { competitorId: "comp_001", productId: "prod_005" },
  { competitorId: "comp_001", productId: "prod_007" },
  { competitorId: "comp_001", productId: "prod_008" },
  { competitorId: "comp_001", productId: "prod_015" },
  { competitorId: "comp_002", productId: "prod_002" },
  { competitorId: "comp_002", productId: "prod_003" },
  { competitorId: "comp_002", productId: "prod_013" },
  { competitorId: "comp_002", productId: "prod_019" },
  { competitorId: "comp_003", productId: "prod_009" },
  { competitorId: "comp_003", productId: "prod_014" },
  { competitorId: "comp_003", productId: "prod_020" },
  { competitorId: "comp_004", productId: "prod_006" },
  { competitorId: "comp_004", productId: "prod_012" },
  { competitorId: "comp_004", productId: "prod_018" },
  { competitorId: "comp_005", productId: "prod_001" },
  { competitorId: "comp_005", productId: "prod_011" },
  { competitorId: "comp_005", productId: "prod_017" },
  { competitorId: "comp_006", productId: "prod_010" },
  { competitorId: "comp_006", productId: "prod_016" },
];

export const DEMO_KEYWORDS: KeywordDoc[] = [
  kw("wireless car charger", 54000, "MEDIUM", "up", 27.5, 78),
  kw("portable blender", 41000, "HIGH", "stable", 23.2, 61),
  kw("led strip lights", 120000, "HIGH", "up", 17.8, 66),
  kw("phone holder car", 88000, "HIGH", "stable", 14.1, 52),
  kw("mini projector", 36000, "MEDIUM", "up", 74.0, 81),
  kw("pet water fountain", 29000, "MEDIUM", "up", 31.4, 76),
  kw("usb hub 3.0", 22000, "MEDIUM", "down", 21.9, 48),
  kw("smart watch fitness", 95000, "HIGH", "stable", 38.5, 58),
  kw("hair straightener ceramic", 33000, "MEDIUM", "stable", 26.4, 55),
  kw("resistance bands set", 67000, "HIGH", "up", 16.2, 60),
  kw("magsafe car mount", 18000, "LOW", "up", 22.1, 84),
  kw("air fryer mini", 49000, "MEDIUM", "up", 52.4, 73),
  kw("tire inflator portable", 27000, "LOW", "up", 48.9, 82),
  kw("vitamin c serum", 110000, "HIGH", "stable", 15.2, 49),
];

function kw(
  keyword: string,
  searchVolume: number,
  competition: KeywordDoc["competition"],
  trend: KeywordDoc["trend"],
  averagePrice: number,
  opportunityScore: number,
): KeywordDoc {
  const id = `kw_${keyword.replace(/\s+/g, "_")}`;
  return {
    _id: id,
    keyword,
    searchVolume,
    competition,
    trend,
    averagePrice,
    opportunityScore,
    marketplace: "eBay",
    dataStatus: "demo",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const DEMO_MARKET_TRENDS: MarketTrendDoc[] = [
  trend("Electronics", 78, "HIGH", 36.4, 11.2),
  trend("Home & Garden", 71, "MEDIUM", 32.1, 14.8),
  trend("Beauty", 69, "HIGH", 21.7, 9.4),
  trend("Pet Supplies", 66, "MEDIUM", 34.6, 12.6),
  trend("Automotive", 74, "MEDIUM", 33.8, 16.1),
  trend("Sports", 63, "MEDIUM", 26.5, 8.7),
];

function trend(
  category: string,
  demand: number,
  competition: MarketTrendDoc["competition"],
  averagePrice: number,
  growth: number,
): MarketTrendDoc {
  const products = DEMO_PRODUCTS.filter((p) => p.category === category);
  return {
    _id: `cat_${category.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    category,
    demand,
    competition,
    averagePrice,
    growth,
    productCount: products.length,
    dataStatus: "demo",
    updatedAt: NOW,
  };
}

function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildProductHistory(product: ProductDoc, days = 30): ProductHistoryPoint[] {
  const rand = seededRandom(product._id);
  const points: ProductHistoryPoint[] = [];
  const baseSales = Math.max(8, Math.round(product.soldCount / 180));
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const wave = product.trend === "up" ? 1 + (days - i) / (days * 4) : product.trend === "down" ? 1 - (days - i) / (days * 5) : 1;
    const sales = Math.max(1, Math.round(baseSales * wave * (0.75 + rand() * 0.5)));
    const price = Math.round((product.price * (0.94 + rand() * 0.12)) * 100) / 100;
    points.push({
      date: date.toISOString().slice(0, 10),
      sales,
      price,
      revenue: Math.round(sales * price * 100) / 100,
      dataStatus: "demo",
    });
  }
  return points;
}

function matchesQuery(text: string, q?: string): boolean {
  if (!q) return true;
  return text.toLowerCase().includes(q.toLowerCase());
}

export class MockMarketplaceProvider implements MarketplaceProvider {
  readonly name = "mock";
  readonly dataStatus: DataStatus = "demo";

  async searchProducts(input: SearchProductsInput): Promise<ProductDoc[]> {
    const q = input.query?.toLowerCase() ?? "";
    return DEMO_PRODUCTS.filter((p) => {
      const text = `${p.title} ${p.description} ${p.category} ${p.marketplace}`;
      if (q && !text.toLowerCase().includes(q)) return false;
      if (input.category && p.category !== input.category) return false;
      if (input.marketplace && p.marketplace !== input.marketplace) return false;
      if (input.minPrice !== undefined && p.price < input.minPrice) return false;
      if (input.maxPrice !== undefined && p.price > input.maxPrice) return false;
      if (input.minScore !== undefined && p.opportunityScore < input.minScore) return false;
      return true;
    });
  }

  async getProduct(input: GetProductInput): Promise<ProductDoc> {
    const found = DEMO_PRODUCTS.find((p) => p._id === input.id || p.externalId === input.id);
    if (!found) throw AppError.notFound("Product not found");
    return found;
  }

  async getProductHistory(input: GetProductHistoryInput): Promise<ProductHistoryPoint[]> {
    const product = await this.getProduct({ id: input.id });
    return buildProductHistory(product, input.days ?? 30);
  }

  async searchCompetitors(input: SearchCompetitorsInput): Promise<CompetitorDoc[]> {
    return DEMO_COMPETITORS.filter((c) => {
      if (input.query && !matchesQuery(`${c.username} ${c.categories.join(" ")}`, input.query)) return false;
      if (input.marketplace && c.marketplace !== input.marketplace) return false;
      return true;
    });
  }

  async getCompetitor(input: GetCompetitorInput): Promise<CompetitorDoc> {
    const found = DEMO_COMPETITORS.find(
      (c) => c._id === input.sellerId || c.username === input.sellerId || c.externalSellerId === input.sellerId,
    );
    if (!found) throw AppError.notFound("Competitor not found");
    return found;
  }

  async getMarketData(input: GetMarketDataInput): Promise<MarketTrendDoc[]> {
    if (input.categoryId) {
      return DEMO_MARKET_TRENDS.filter(
        (t) => t._id === input.categoryId || t.category.toLowerCase() === input.categoryId?.toLowerCase(),
      );
    }
    return DEMO_MARKET_TRENDS;
  }

  async getKeywordData(input: GetKeywordDataInput): Promise<KeywordDoc[]> {
    const q = input.keyword.toLowerCase();
    return DEMO_KEYWORDS.filter((k) => k.keyword.includes(q) || q.includes(k.keyword));
  }
}

export const mockMarketplaceProvider = new MockMarketplaceProvider();
