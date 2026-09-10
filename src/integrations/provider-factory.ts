import { env } from "../config/env";
import type { MarketplaceProvider } from "./marketplace-provider";
import { ebayProvider } from "./ebay.provider";
import { mockMarketplaceProvider } from "./mock-marketplace.provider";

export function getMarketplaceProvider(): MarketplaceProvider {
  if (env.DEMO_MODE || !env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) {
    return mockMarketplaceProvider;
  }
  return ebayProvider;
}
