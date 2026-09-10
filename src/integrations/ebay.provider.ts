import { AppError } from "../utils/app-error";
import { env } from "../config/env";
import type { MarketplaceProvider } from "./marketplace-provider";

export class EbayProvider implements MarketplaceProvider {
  readonly name = "ebay";

  private ensureConfigured(): never {
    if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) {
      throw AppError.badRequest("eBay credentials not configured", "INTEGRATION_NOT_CONFIGURED");
    }
    throw AppError.badRequest("eBay live integration is not enabled in this environment", "INTEGRATION_NOT_CONFIGURED");
  }

  async searchProducts(): Promise<never> {
    return this.ensureConfigured();
  }

  async getProduct(): Promise<never> {
    return this.ensureConfigured();
  }

  async getProductHistory(): Promise<never> {
    return this.ensureConfigured();
  }

  async searchCompetitors(): Promise<never> {
    return this.ensureConfigured();
  }

  async getCompetitor(): Promise<never> {
    return this.ensureConfigured();
  }

  async getMarketData(): Promise<never> {
    return this.ensureConfigured();
  }

  async getKeywordData(): Promise<never> {
    return this.ensureConfigured();
  }
}

export const ebayProvider = new EbayProvider();
