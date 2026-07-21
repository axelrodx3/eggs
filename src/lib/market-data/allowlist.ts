import {
  basketAssets,
  getProviderSymbol,
  publicMarketAssetIds,
  type BasketAsset,
} from "@/data/assets";
import type { ChartRange } from "./config";
import { CHART_RANGE_ALLOWLIST } from "./config";
import { MarketDataError } from "./errors";

export function isPublicMarketAssetId(assetId: string): boolean {
  return publicMarketAssetIds.includes(assetId);
}

export function getPublicMarketAssets(): BasketAsset[] {
  return basketAssets.filter((a) => !a.isPrivate && a.assetType !== "private");
}

export function resolveAssetById(assetId: string): BasketAsset | null {
  const normalized = assetId.toLowerCase();
  return basketAssets.find((a) => a.id === normalized) ?? null;
}

export function assertPublicAssetId(assetId: string): BasketAsset {
  const asset = resolveAssetById(assetId);
  if (!asset || asset.isPrivate || asset.assetType === "private") {
    throw new MarketDataError("unsupported_asset", "Unsupported asset.", {
      assetId,
    });
  }
  return asset;
}

export function assertChartRange(range: string): ChartRange {
  const upper = range.toUpperCase() as ChartRange;
  if (!CHART_RANGE_ALLOWLIST.includes(upper)) {
    throw new MarketDataError("unsupported_range", "Unsupported chart range.");
  }
  return upper;
}

export function buildProviderSymbolMap(
  provider: "finnhub" | "massive",
): Map<string, string> {
  const map = new Map<string, string>();
  for (const asset of getPublicMarketAssets()) {
    const symbol = getProviderSymbol(asset, provider);
    if (symbol) map.set(asset.id, symbol);
  }
  return map;
}

export { publicMarketAssetIds };
