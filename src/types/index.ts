export type DataStatus = "actual" | "estimated" | "calculated" | "demo";
export type Plan = "FREE" | "STARTER" | "PRO" | "BUSINESS";
export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";
export type CompetitionLevel = "LOW" | "MEDIUM" | "HIGH";
export type DemandLevel = "LOW" | "MEDIUM" | "HIGH";
export type TrendDirection = "up" | "stable" | "down";
export type SubscriptionStatus = "active" | "trialing" | "canceled" | "past_due" | "none";
export type AccountStatus = "active" | "suspended";
export type BillingCycle = "monthly" | "yearly";
export type UsageType = "searches" | "competitors" | "tracked";
export type NotificationType = "price" | "sales" | "competition" | "trend" | "opportunity" | "system";
export type SearchHistoryType = "product" | "competitor" | "keyword";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
}

export interface AuthPayload {
  sub: string;
  role: Role;
  plan: Plan;
}

export interface AuthUser extends AuthPayload {
  email: string;
  name: string;
}

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: Role;
  plan: Plan;
  credits: number;
  subscriptionStatus: SubscriptionStatus;
  emailVerified: boolean;
  timezone: string;
  accountStatus: AccountStatus;
  emailVerifyToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  plan: Plan;
  credits: number;
  creditLimit: number;
  subscriptionStatus: SubscriptionStatus;
  emailVerified: boolean;
  timezone?: string;
  accountStatus: AccountStatus;
  createdAt: string;
}

export interface ProductDoc {
  _id: string;
  externalId: string;
  marketplace: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  currency: string;
  soldCount: number;
  revenue: number;
  activeListings: number;
  sellerCount: number;
  sellThroughRate: number;
  competitionScore: number;
  competitionLevel: CompetitionLevel;
  demandScore: number;
  demandLevel: DemandLevel;
  profitScore: number;
  trendScore: number;
  trend: TrendDirection;
  opportunityScore: number;
  rating: number;
  reviews: number;
  dataStatus: DataStatus;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductHistoryPoint {
  date: string;
  sales: number;
  price: number;
  revenue: number;
  dataStatus: DataStatus;
}

export interface CompetitorDoc {
  _id: string;
  externalSellerId: string;
  username: string;
  marketplace: string;
  feedbackScore: number;
  feedbackPercentage: number;
  activeListings: number;
  soldItems: number;
  estimatedRevenue: number;
  averagePrice: number;
  sellThroughRate: number;
  growthRate: number;
  categories: string[];
  avatar?: string;
  dataStatus: DataStatus;
  lastScanned: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorProductDoc {
  _id: string;
  competitorId: string;
  productId: string;
  createdAt: string;
}

export interface KeywordDoc {
  _id: string;
  keyword: string;
  searchVolume: number;
  competition: CompetitionLevel;
  trend: TrendDirection;
  averagePrice: number;
  opportunityScore: number;
  marketplace: string;
  dataStatus: DataStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDoc {
  _id: string;
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedProductDoc {
  _id: string;
  userId: string;
  productId: string;
  currentPrice: number;
  previousPrice: number;
  currentSales: number;
  previousSales: number;
  opportunityScore: number;
  alertsEnabled: boolean;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProductDoc {
  _id: string;
  userId: string;
  productId: string;
  notes: string;
  createdAt: string;
}

export interface SavedSearchDoc {
  _id: string;
  userId: string;
  name: string;
  query: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

export interface SearchHistoryDoc {
  _id: string;
  userId: string;
  term: string;
  type: SearchHistoryType;
  date: string;
  results: number;
}

export interface SupplierDoc {
  _id: string;
  name: string;
  productCost: number;
  shipping: number;
  deliveryDays: string;
  rating: number;
  stock: number;
  estimatedProfit: number;
  categories: string[];
  productIds: string[];
  dataStatus: DataStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDoc {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  href?: string;
  createdAt: string;
}

export interface ProfitCalculationDoc {
  _id: string;
  userId: string;
  sellingPrice: number;
  productCost: number;
  shipping: number;
  marketplaceFees: number;
  advertisingCost: number;
  otherCosts: number;
  profit: number;
  profitMargin: number;
  roi: number;
  createdAt: string;
}

export interface ProductResearchDoc {
  _id: string;
  userId: string;
  productId: string;
  query: string;
  notes: string;
  createdAt: string;
}

export interface ProductSalesDoc {
  _id: string;
  productId: string;
  date: string;
  sales: number;
  price: number;
  revenue: number;
  dataStatus: DataStatus;
}

export interface MarketTrendDoc {
  _id: string;
  category: string;
  demand: number;
  competition: CompetitionLevel;
  averagePrice: number;
  growth: number;
  productCount: number;
  dataStatus: DataStatus;
  updatedAt: string;
}

export interface ApiUsageDoc {
  _id: string;
  userId?: string;
  method: string;
  path: string;
  statusCode: number;
  usageType?: UsageType;
  createdAt: string;
}

export interface PaymentDoc {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  plan: Plan;
  status: "succeeded" | "pending" | "failed" | "demo";
  stripePaymentId?: string;
  dataStatus: DataStatus;
  createdAt: string;
}

export interface AlertDoc {
  _id: string;
  userId: string;
  productId?: string;
  type: NotificationType;
  message: string;
  triggered: boolean;
  createdAt: string;
}

export interface SessionDoc {
  _id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

export interface OpportunityInput {
  demand: number;
  growth: number;
  competition: number;
  profit: number;
  priceStability: number;
  trend: number;
}

export interface OpportunityResult {
  score: number;
  label: string;
  breakdown: OpportunityInput;
  dataStatus: "calculated";
}

export interface CompetitionInput {
  sellerCount: number;
  activeListings: number;
  salesVelocity: number;
  marketSaturation: number;
  priceCompetition: number;
}

export interface CompetitionResult {
  score: number;
  level: CompetitionLevel;
  breakdown: CompetitionInput;
  dataStatus: "calculated";
}

export interface DemandInput {
  soldCount: number;
  sellThroughRate: number;
  reviews: number;
  rating: number;
}

export interface DemandResult {
  score: number;
  level: DemandLevel;
  breakdown: DemandInput;
  dataStatus: "calculated";
}

export interface ProfitInput {
  sellingPrice: number;
  productCost: number;
  shipping: number;
  marketplaceFees: number;
  advertisingCost: number;
  otherCosts: number;
}

export interface ProfitResult {
  sellingPrice: number;
  productCost: number;
  shipping: number;
  marketplaceFees: number;
  advertisingCost: number;
  otherCosts: number;
  revenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  roi: number;
  dataStatus: "calculated";
}

export type CollectionName =
  | "users"
  | "subscriptions"
  | "products"
  | "productResearch"
  | "productSales"
  | "competitors"
  | "competitorProducts"
  | "marketTrends"
  | "keywords"
  | "trackedProducts"
  | "savedProducts"
  | "searchHistory"
  | "profitCalculations"
  | "suppliers"
  | "notifications"
  | "savedSearches"
  | "apiUsage"
  | "payments"
  | "alerts"
  | "sessions";
