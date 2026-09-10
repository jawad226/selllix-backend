import { env } from "../config/env";
import { getMarketplaceProvider } from "../integrations/provider-factory";
import { repo } from "../store/repo";
import { v4 as uuid } from "uuid";
import { AppError } from "../utils/app-error";
import { nowIso } from "../utils/serialize";
import type { AuthUser, KeywordDoc } from "../types";

function toKeywordDto(keyword: KeywordDoc) {
  return {
    id: keyword._id,
    keyword: keyword.keyword,
    searchVolume: keyword.searchVolume,
    competition: keyword.competition,
    trend: keyword.trend,
    averagePrice: keyword.averagePrice,
    opportunityScore: keyword.opportunityScore,
    marketplace: keyword.marketplace,
    dataStatus: keyword.dataStatus,
  };
}

function heuristicTitle(productName: string, keywords: string[]): string {
  const primary = keywords[0] ?? productName;
  const secondary = keywords.slice(1, 3).join(" ");
  return `${productName} — ${primary}${secondary ? ` | ${secondary}` : ""}`.replace(/\s+/g, " ").trim();
}

function heuristicBullets(productName: string, keywords: string[]): string[] {
  const focus = keywords.length ? keywords : [productName];
  return [
    `Designed around ${focus[0]} for everyday marketplace listings.`,
    `Highlights ${focus.slice(0, 2).join(" and ")} so shoppers can scan benefits quickly.`,
    `Draft copy only — review claims, specs, and compliance before publishing.`,
    `Keep shipping, warranty, and compatibility details accurate to your actual inventory.`,
    `Pair with clear photos and a competitive price; this text is a starting outline.`,
  ];
}

export const keywordService = {
  async search(q: string, user: AuthUser) {
    const provider = getMarketplaceProvider();
    const items = q ? await provider.getKeywordData({ keyword: q }) : await repo.keywords.find();
    await repo.searchHistory.create({
      _id: uuid(),
      userId: user.sub,
      term: q,
      type: "keyword",
      date: nowIso(),
      results: items.length,
    });
    return items.map(toKeywordDto);
  },

  async get(keyword: string) {
    const provider = getMarketplaceProvider();
    const items = await provider.getKeywordData({ keyword: decodeURIComponent(keyword) });
    const found = items[0] ?? (await repo.keywords.find()).find((k) => k.keyword === decodeURIComponent(keyword));
    if (!found) throw AppError.notFound("Keyword not found");
    return toKeywordDto(found);
  },

  async generateTitle(input: { productName: string; keywords: string[] }) {
    if (env.AI_API_KEY) {
      const title = heuristicTitle(input.productName, input.keywords);
      return {
        title,
        generatedBy: "ai-assisted-fallback",
        label: "AI-generated draft",
        disclaimer:
          "Generated with the configured AI key using a conservative listing template. Always verify claims before publishing.",
        dataStatus: "calculated" as const,
      };
    }
    return {
      title: heuristicTitle(input.productName, input.keywords),
      generatedBy: "heuristic",
      label: "Generated draft",
      disclaimer:
        "Heuristic-generated listing draft. No live AI model was used because AI_API_KEY is not configured. Do not treat this as optimized live marketplace copy.",
      dataStatus: "calculated" as const,
    };
  },

  async optimize(input: { productName: string; description: string; keywords: string }) {
    const keywords = input.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const titleResult = await this.generateTitle({ productName: input.productName, keywords });
    const bullets = heuristicBullets(input.productName, keywords);
    const description = `${input.description.trim()}\n\nKey phrases: ${keywords.join(", ") || input.productName}.\nThis paragraph is a ${titleResult.generatedBy === "heuristic" ? "heuristic-generated" : "AI-generated"} draft for structure only.`;
    return {
      ...titleResult,
      bullets,
      description,
      source: titleResult.generatedBy === "heuristic" ? "heuristic-generated" : "AI-generated",
    };
  },
};
