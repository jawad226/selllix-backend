import mongoose, { Schema } from "mongoose";

function modelOf(name: string, schema: Schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    avatar: String,
    role: { type: String, enum: ["USER", "ADMIN", "SUPER_ADMIN"], default: "USER" },
    plan: { type: String, enum: ["FREE", "STARTER", "PRO", "BUSINESS"], default: "FREE" },
    credits: { type: Number, default: 10 },
    subscriptionStatus: {
      type: String,
      enum: ["active", "trialing", "canceled", "past_due", "none"],
      default: "none",
    },
    emailVerified: { type: Boolean, default: false },
    timezone: { type: String, default: "UTC" },
    accountStatus: { type: String, enum: ["active", "suspended"], default: "active" },
    emailVerifyToken: String,
    passwordResetToken: String,
    passwordResetExpires: String,
  },
  { timestamps: true },
);

const productSchema = new Schema(
  {
    _id: { type: String, required: true },
    externalId: { type: String, required: true, index: true },
    marketplace: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: String,
    category: { type: String, required: true },
    price: Number,
    currency: { type: String, default: "USD" },
    soldCount: Number,
    revenue: Number,
    activeListings: Number,
    sellerCount: Number,
    sellThroughRate: Number,
    competitionScore: Number,
    competitionLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    demandScore: Number,
    demandLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    profitScore: Number,
    trendScore: Number,
    trend: { type: String, enum: ["up", "stable", "down"] },
    opportunityScore: Number,
    rating: Number,
    reviews: Number,
    dataStatus: { type: String, enum: ["actual", "estimated", "calculated", "demo"], default: "demo" },
    lastUpdated: String,
  },
  { timestamps: true },
);

const competitorSchema = new Schema(
  {
    _id: { type: String, required: true },
    externalSellerId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    marketplace: String,
    feedbackScore: Number,
    feedbackPercentage: Number,
    activeListings: Number,
    soldItems: Number,
    estimatedRevenue: Number,
    averagePrice: Number,
    sellThroughRate: Number,
    growthRate: Number,
    categories: [String],
    avatar: String,
    dataStatus: { type: String, default: "demo" },
    lastScanned: String,
  },
  { timestamps: true },
);

const subscriptionSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    plan: { type: String, enum: ["FREE", "STARTER", "PRO", "BUSINESS"] },
    status: { type: String, enum: ["active", "trialing", "canceled", "past_due", "none"] },
    billingCycle: { type: String, enum: ["monthly", "yearly"] },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: String,
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const keywordSchema = new Schema(
  {
    _id: { type: String, required: true },
    keyword: { type: String, required: true },
    searchVolume: Number,
    competition: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    trend: { type: String, enum: ["up", "stable", "down"] },
    averagePrice: Number,
    opportunityScore: Number,
    marketplace: String,
    dataStatus: { type: String, default: "demo" },
  },
  { timestamps: true },
);

const trackedSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    currentPrice: Number,
    previousPrice: Number,
    currentSales: Number,
    previousSales: Number,
    opportunityScore: Number,
    alertsEnabled: { type: Boolean, default: true },
    lastChecked: String,
  },
  { timestamps: true },
);

const savedProductSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  productId: String,
  notes: { type: String, default: "" },
  createdAt: String,
});

const savedSearchSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  name: String,
  query: String,
  filters: Schema.Types.Mixed,
  createdAt: String,
});

const searchHistorySchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  term: String,
  type: { type: String, enum: ["product", "competitor", "keyword"] },
  date: String,
  results: Number,
});

const supplierSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: String,
    productCost: Number,
    shipping: Number,
    deliveryDays: String,
    rating: Number,
    stock: Number,
    estimatedProfit: Number,
    categories: [String],
    productIds: [String],
    dataStatus: { type: String, default: "demo" },
  },
  { timestamps: true },
);

const notificationSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  type: String,
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  href: String,
  createdAt: String,
});

const profitSchema = new Schema({
  _id: { type: String, required: true },
  userId: String,
  sellingPrice: Number,
  productCost: Number,
  shipping: Number,
  marketplaceFees: Number,
  advertisingCost: Number,
  otherCosts: Number,
  profit: Number,
  profitMargin: Number,
  roi: Number,
  createdAt: String,
});

const researchSchema = new Schema({
  _id: { type: String, required: true },
  userId: String,
  productId: String,
  query: String,
  notes: String,
  createdAt: String,
});

const salesSchema = new Schema({
  _id: { type: String, required: true },
  productId: { type: String, index: true },
  date: String,
  sales: Number,
  price: Number,
  revenue: Number,
  dataStatus: { type: String, default: "demo" },
});

const marketTrendSchema = new Schema({
  _id: { type: String, required: true },
  category: String,
  demand: Number,
  competition: String,
  averagePrice: Number,
  growth: Number,
  productCount: Number,
  dataStatus: { type: String, default: "demo" },
  updatedAt: String,
});

const usageSchema = new Schema({
  _id: { type: String, required: true },
  userId: String,
  method: String,
  path: String,
  statusCode: Number,
  usageType: String,
  createdAt: String,
});

const paymentSchema = new Schema({
  _id: { type: String, required: true },
  userId: String,
  amount: Number,
  currency: String,
  plan: String,
  status: String,
  stripePaymentId: String,
  dataStatus: { type: String, default: "demo" },
  createdAt: String,
});

const alertSchema = new Schema({
  _id: { type: String, required: true },
  userId: String,
  productId: String,
  type: String,
  message: String,
  triggered: Boolean,
  createdAt: String,
});

const sessionSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  refreshTokenHash: String,
  userAgent: String,
  expiresAt: String,
  revoked: { type: Boolean, default: false },
  createdAt: String,
});

const competitorProductSchema = new Schema({
  _id: { type: String, required: true },
  competitorId: String,
  productId: String,
  createdAt: String,
});

export const UserModel = modelOf("User", userSchema);
export const ProductModel = modelOf("Product", productSchema);
export const CompetitorModel = modelOf("Competitor", competitorSchema);
export const SubscriptionModel = modelOf("Subscription", subscriptionSchema);
export const KeywordModel = modelOf("Keyword", keywordSchema);
export const TrackedProductModel = modelOf("TrackedProduct", trackedSchema);
export const SavedProductModel = modelOf("SavedProduct", savedProductSchema);
export const SavedSearchModel = modelOf("SavedSearch", savedSearchSchema);
export const SearchHistoryModel = modelOf("SearchHistory", searchHistorySchema);
export const SupplierModel = modelOf("Supplier", supplierSchema);
export const NotificationModel = modelOf("Notification", notificationSchema);
export const ProfitCalculationModel = modelOf("ProfitCalculation", profitSchema);
export const ProductResearchModel = modelOf("ProductResearch", researchSchema);
export const ProductSalesModel = modelOf("ProductSales", salesSchema);
export const MarketTrendModel = modelOf("MarketTrend", marketTrendSchema);
export const ApiUsageModel = modelOf("ApiUsage", usageSchema);
export const PaymentModel = modelOf("Payment", paymentSchema);
export const AlertModel = modelOf("Alert", alertSchema);
export const SessionModel = modelOf("Session", sessionSchema);
export const CompetitorProductModel = modelOf("CompetitorProduct", competitorProductSchema);
