import "server-only";

import { mockMarketProvider } from "./mock-provider";
import { finnhubProvider } from "./finnhub";
import { sanitizePublicQuote } from "./finnhub-normalize";
import type { MarketDataProviderInterface, MarketQuotesResponse } from "./types";
import { MarketDataError } from "./errors";

function sanitizeQuotesPayload(
  payload: MarketQuotesResponse,
): MarketQuotesResponse {
  return {
    ...payload,
    quotesByAssetId: Object.fromEntries(
      Object.entries(payload.quotesByAssetId).map(([id, quote]) => [
        id,
        sanitizePublicQuote(quote),
      ]),
    ),
  };
}

export function resolveMarketDataProvider(): MarketDataProviderInterface {
  const provider =
    process.env.MARKET_DATA_PROVIDER ??
    (process.env.NODE_ENV === "production" ? "finnhub" : "mock");

  switch (provider) {
    case "finnhub":
      return finnhubProvider;
    case "mock":
      return mockMarketProvider;
    default:
      return finnhubProvider;
  }
}

export async function fetchMarketQuotesResponse() {
  const provider = resolveMarketDataProvider();

  if (provider.name === "finnhub" && !process.env.FINNHUB_API_KEY?.trim()) {
    if (process.env.NODE_ENV === "production") {
      return {
        quotesByAssetId: {},
        status: "error" as const,
        provider: null,
        marketState: "unknown" as const,
        lastUpdated: null,
        fetchedAt: new Date().toISOString(),
        isStale: false,
        error: "Market data unavailable.",
        errorCode: "missing_api_key",
        isDevelopmentMock: false,
      };
    }

    return {
      quotesByAssetId: {},
      status: "setup_required" as const,
      provider: null,
      marketState: "unknown" as const,
      lastUpdated: null,
      fetchedAt: new Date().toISOString(),
      isStale: false,
      error: "Configure FINNHUB_API_KEY in .env.local for live quotes.",
      errorCode: "missing_api_key",
      isDevelopmentMock: false,
    };
  }

  try {
    return sanitizeQuotesPayload(await provider.fetchQuotes([]));
  } catch (error) {
    if (error instanceof MarketDataError && error.code === "missing_api_key") {
      if (process.env.NODE_ENV === "production") {
        console.error("[market-data] API key not configured.");
      } else {
        console.warn("[market-data] FINNHUB_API_KEY not configured.");
      }
      return {
        quotesByAssetId: {},
        status: process.env.NODE_ENV === "production" ? ("error" as const) : ("setup_required" as const),
        provider: null,
        marketState: "unknown" as const,
        lastUpdated: null,
        fetchedAt: new Date().toISOString(),
        isStale: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Market data unavailable."
            : "Configure FINNHUB_API_KEY in .env.local.",
        errorCode: "missing_api_key",
        isDevelopmentMock: false,
      };
    }

    console.error(
      "[market-data] Quote fetch failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return {
      quotesByAssetId: {},
      status: "error" as const,
      provider: provider.name,
      marketState: "unknown" as const,
      lastUpdated: null,
      fetchedAt: new Date().toISOString(),
      isStale: false,
      error: "Market data temporarily unavailable.",
      errorCode:
        error instanceof MarketDataError ? error.code : "provider_unavailable",
      isDevelopmentMock: false,
    };
  }
}

export async function fetchMarketHistoryResponse(assetId: string, range: string) {
  const provider = resolveMarketDataProvider();

  if (provider.name === "finnhub" && !process.env.FINNHUB_API_KEY?.trim()) {
    return {
      assetId,
      range,
      candles: [],
      status: "unavailable" as const,
      error:
        process.env.NODE_ENV === "production"
          ? "Market data unavailable."
          : "Configure FINNHUB_API_KEY in .env.local.",
      errorCode: "missing_api_key",
      fetchedAt: new Date().toISOString(),
      periodChangePercent: null,
    };
  }

  return provider.fetchHistory(assetId, range);
}
