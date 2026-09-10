import type {
  CompetitorDoc,
  KeywordDoc,
  MarketTrendDoc,
  ProductDoc,
  ProductHistoryPoint,
} from "../types";

export interface SearchProductsInput {
  query?: string;
  category?: string;
  marketplace?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
}

export interface GetProductInput {
  id: string;
}

export interface GetProductHistoryInput {
  id: string;
  days?: number;
}

export interface SearchCompetitorsInput {
  query?: string;
  marketplace?: string;
}

export interface GetCompetitorInput {
  sellerId: string;
}

export interface GetMarketDataInput {
  categoryId?: string;
}

export interface GetKeywordDataInput {
  keyword: string;
}

export interface MarketplaceProvider {
  readonly name: string;
  searchProducts(input: SearchProductsInput): Promise<ProductDoc[]>;
  getProduct(input: GetProductInput): Promise<ProductDoc>;
  getProductHistory(input: GetProductHistoryInput): Promise<ProductHistoryPoint[]>;
  searchCompetitors(input: SearchCompetitorsInput): Promise<CompetitorDoc[]>;
  getCompetitor(input: GetCompetitorInput): Promise<CompetitorDoc>;
  getMarketData(input: GetMarketDataInput): Promise<MarketTrendDoc[]>;
  getKeywordData(input: GetKeywordDataInput): Promise<KeywordDoc[]>;
}
