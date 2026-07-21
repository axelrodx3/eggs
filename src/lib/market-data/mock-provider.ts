import type {
  MarketDataProviderInterface,
  MarketHistoryResponse,
  MarketQuote,
  MarketQuotesResponse,
} from "./types";
import { inferUsMarketState } from "./market-hours";
import { getPublicMarketAssets } from "./allowlist";

const MOCK_BASE: Record<
  string,
  Omit<
    MarketQuote,
    | "assetId"
    | "symbol"
    | "name"
    | "fetchedAt"
    | "providerTimestamp"
    | "marketState"
    | "isStale"
  >
> = {
  aapl: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 214.32,
    previousClose: 212.18,
    open: 213.1,
    high: 215.4,
    low: 212.5,
    volume: 52_340_000,
    marketCap: 3.28e12,
    change: 2.14,
    changePercent: 1.01,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  googl: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 178.45,
    previousClose: 179.67,
    open: 179.2,
    high: 180.1,
    low: 177.8,
    volume: 18_200_000,
    marketCap: 2.19e12,
    change: -1.22,
    changePercent: -0.68,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  nvda: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 132.8,
    previousClose: 129.35,
    open: 130.5,
    high: 134.2,
    low: 129.9,
    volume: 245_000_000,
    marketCap: 3.25e12,
    change: 3.45,
    changePercent: 2.67,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  msft: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 428.9,
    previousClose: 428.02,
    open: 428.5,
    high: 431.2,
    low: 426.8,
    volume: 14_800_000,
    marketCap: 3.18e12,
    change: 0.88,
    changePercent: 0.21,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  amzn: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 198.12,
    previousClose: 198.66,
    open: 198.4,
    high: 199.5,
    low: 196.9,
    volume: 32_100_000,
    marketCap: 2.06e12,
    change: -0.54,
    changePercent: -0.27,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  meta: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 512.4,
    previousClose: 508.28,
    open: 509.0,
    high: 514.8,
    low: 507.2,
    volume: 11_400_000,
    marketCap: 1.31e12,
    change: 4.12,
    changePercent: 0.81,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  tsla: {
    assetType: "equity",
    currency: "USD",
    exchange: "NASDAQ",
    price: 248.6,
    previousClose: 253.9,
    open: 252.0,
    high: 254.5,
    low: 246.8,
    volume: 98_700_000,
    marketCap: 7.92e11,
    change: -5.3,
    changePercent: -2.09,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  sp500: {
    assetType: "index",
    currency: "USD",
    price: 5284.5,
    previousClose: 5272.2,
    open: 5275.0,
    high: 5290.1,
    low: 5268.4,
    volume: null,
    marketCap: null,
    change: 12.3,
    changePercent: 0.23,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
  ndx: {
    assetType: "index",
    currency: "USD",
    price: 18432.1,
    previousClose: 18477.3,
    open: 18480.0,
    high: 18510.2,
    low: 18390.5,
    volume: null,
    marketCap: null,
    change: -45.2,
    changePercent: -0.24,
    provider: "mock",
    isDelayed: false,
    delayMinutes: null,
  },
};

function buildMockHistory(base: number, points = 30) {
  const candles = [];
  let value = base * 0.94;
  const now = Date.now();
  for (let i = points - 1; i >= 0; i -= 1) {
    const drift = (Math.sin(i / 4) + Math.cos(i / 7)) * base * 0.008;
    value = Math.max(base * 0.85, value + drift);
    const ts = new Date(now - i * 86_400_000).toISOString();
    candles.push({
      timestamp: ts,
      open: value,
      high: value * 1.01,
      low: value * 0.99,
      close: Number(value.toFixed(2)),
      volume: 1_000_000,
    });
  }
  return candles;
}

export const mockMarketProvider: MarketDataProviderInterface = {
  name: "mock",
  async fetchQuotes(): Promise<MarketQuotesResponse> {
    const fetchedAt = new Date().toISOString();
    const marketState = inferUsMarketState();
    const quotesByAssetId: Record<string, MarketQuote> = {};

    for (const asset of getPublicMarketAssets()) {
      const base = MOCK_BASE[asset.id];
      if (!base) continue;
      quotesByAssetId[asset.id] = {
        ...base,
        assetId: asset.id,
        symbol: asset.displayTicker ?? asset.id.toUpperCase(),
        name: asset.name,
        providerTimestamp: fetchedAt,
        fetchedAt,
        marketState,
        isStale: false,
      };
    }

    return {
      quotesByAssetId,
      status: "ok",
      provider: "mock",
      marketState,
      lastUpdated: fetchedAt,
      fetchedAt,
      isStale: false,
      error: null,
      errorCode: null,
      isDevelopmentMock: true,
    };
  },

  async fetchHistory(assetId: string, range: string): Promise<MarketHistoryResponse> {
    const base = MOCK_BASE[assetId]?.price ?? 100;
    const candles = buildMockHistory(base, range === "1D" ? 32 : 30);
    const first = candles[0]?.close ?? 0;
    const last = candles[candles.length - 1]?.close ?? 0;
    const periodChangePercent =
      first > 0 ? Number((((last - first) / first) * 100).toFixed(4)) : null;

    return {
      assetId,
      range,
      candles,
      status: "ok",
      error: null,
      errorCode: null,
      fetchedAt: new Date().toISOString(),
      periodChangePercent,
    };
  },
};
