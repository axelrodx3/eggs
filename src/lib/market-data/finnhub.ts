import "server-only";

import { z } from "zod";
import {
  getPublicMarketAssets,
  buildProviderSymbolMap,
  assertPublicAssetId,
} from "./allowlist";
import {
  FINNHUB_CHART_RANGE_CONFIG,
  MARKET_REFRESH_CONFIG,
  type ChartRange,
} from "./config";
import {
  dedupeRequest,
  getCached,
  getStaleCached,
  setCached,
} from "./cache";
import { MarketDataError } from "./errors";
import {
  computePeriodChangePercent,
  getAggregateMarketState,
} from "./normalize";
import {
  createUnavailableQuote,
  normalizeFinnhubQuote,
  resolveUnavailableReason,
  sanitizePublicQuote,
} from "./finnhub-normalize";
import type {
  MarketCandle,
  MarketDataProviderInterface,
  MarketHistoryResponse,
  MarketQuote,
  MarketQuotesResponse,
} from "./types";
import { getServerCacheTtlMs } from "./config";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

const finnhubQuoteSchema = z.object({
  c: z.number().optional(),
  d: z.number().nullable().optional(),
  dp: z.number().nullable().optional(),
  h: z.number().optional(),
  l: z.number().optional(),
  o: z.number().optional(),
  pc: z.number().optional(),
  t: z.number().optional(),
});

const finnhubErrorSchema = z.object({
  error: z.string().optional(),
});

const finnhubCandleSchema = z.object({
  c: z.array(z.number()).optional(),
  h: z.array(z.number()).optional(),
  l: z.array(z.number()).optional(),
  o: z.array(z.number()).optional(),
  t: z.array(z.number()).optional(),
  v: z.array(z.number()).optional(),
  s: z.string().optional(),
});

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY?.trim();
  if (!key) {
    throw new MarketDataError(
      "missing_api_key",
      "FINNHUB_API_KEY is not configured.",
    );
  }
  return key;
}

function buildUrl(path: string, params: Record<string, string>): string {
  const apiKey = getApiKey();
  const search = new URLSearchParams({ ...params, token: apiKey });
  return `${FINNHUB_BASE}${path}?${search.toString()}`;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    MARKET_REFRESH_CONFIG.requestTimeoutMs,
  );
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson<T>(url: string, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MARKET_REFRESH_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.status === 429) {
        throw new MarketDataError("rate_limit", "Rate limit reached.", {
          retryAfterMs: 60_000,
        });
      }
      if (response.status === 401 || response.status === 403) {
        throw new MarketDataError(
          "missing_api_key",
          "Invalid Finnhub API credentials.",
        );
      }
      if (!response.ok) {
        throw new MarketDataError(
          "provider_unavailable",
          `${label} request failed (${response.status}).`,
        );
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (error instanceof MarketDataError) {
        if (error.code === "rate_limit" || error.code === "missing_api_key") {
          throw error;
        }
      }
      if (attempt < MARKET_REFRESH_CONFIG.maxRetries) {
        await new Promise((r) =>
          setTimeout(r, MARKET_REFRESH_CONFIG.retryBaseMs * 2 ** attempt),
        );
      }
    }
  }
  throw new MarketDataError("timeout", `${label} timed out.`, {
    cause: lastError,
  });
}

async function fetchSingleQuote(
  assetId: string,
  providerSymbol: string,
  displaySymbol: string,
  assetName: string,
  assetType: "equity" | "index",
  fetchedAt: string,
): Promise<MarketQuote> {
  try {
    const url = buildUrl("/quote", { symbol: providerSymbol });
    const json = await fetchJson<unknown>(url, `Quote ${providerSymbol}`);

    const errorParsed = finnhubErrorSchema.safeParse(json);
    if (errorParsed.success && errorParsed.data.error) {
      return createUnavailableQuote(
        assetId,
        assetName,
        displaySymbol,
        assetType,
        resolveUnavailableReason(assetType),
        fetchedAt,
      );
    }

    const parsed = finnhubQuoteSchema.safeParse(json);
    if (!parsed.success) {
      return createUnavailableQuote(
        assetId,
        assetName,
        displaySymbol,
        assetType,
        resolveUnavailableReason(assetType),
        fetchedAt,
      );
    }

    return normalizeFinnhubQuote(
      assetId,
      displaySymbol,
      assetName,
      assetType,
      parsed.data,
      fetchedAt,
    );
  } catch (error) {
    if (error instanceof MarketDataError && error.code === "rate_limit") {
      throw error;
    }
    return createUnavailableQuote(
      assetId,
      assetName,
      displaySymbol,
      assetType,
      resolveUnavailableReason(assetType),
      fetchedAt,
    );
  }
}

async function fetchAllQuotes(
  existingQuotes: Record<string, MarketQuote> = {},
): Promise<MarketQuotesResponse> {
  const fetchedAt = new Date().toISOString();
  const assets = getPublicMarketAssets();
  const symbolMap = buildProviderSymbolMap("finnhub");

  const results = await Promise.all(
    assets.map(async (asset) => {
      const providerSymbol = symbolMap.get(asset.id);
      if (!providerSymbol) {
        return createUnavailableQuote(
          asset.id,
          asset.name,
          asset.displayTicker ?? asset.id.toUpperCase(),
          asset.assetType === "index" ? "index" : "equity",
          "Symbol not configured.",
          fetchedAt,
        );
      }
      return fetchSingleQuote(
        asset.id,
        providerSymbol,
        asset.displayTicker ?? providerSymbol,
        asset.name,
        asset.assetType === "index" ? "index" : "equity",
        fetchedAt,
      );
    }),
  );

  const quotesByAssetId: Record<string, MarketQuote> = { ...existingQuotes };
  for (const quote of results) {
    quotesByAssetId[quote.assetId] = sanitizePublicQuote(
      quote.unavailable
        ? existingQuotes[quote.assetId]?.price
          ? { ...existingQuotes[quote.assetId], isStale: true }
          : quote
        : quote,
    );
  }

  const validQuotes = Object.values(quotesByAssetId).filter(
    (q) => !q.unavailable && q.price !== null,
  );
  const unavailableCount = Object.values(quotesByAssetId).filter(
    (q) => q.unavailable || q.price === null,
  ).length;

  const lastUpdated =
    validQuotes
      .map((q) => q.providerTimestamp)
      .filter(Boolean)
      .sort()
      .at(-1) ?? fetchedAt;

  return {
    quotesByAssetId,
    status:
      validQuotes.length === 0
        ? "error"
        : unavailableCount > 0
          ? "partial"
          : "ok",
    provider: "finnhub",
    marketState: getAggregateMarketState(Object.values(quotesByAssetId)),
    lastUpdated,
    fetchedAt,
    isStale: false,
    error: validQuotes.length === 0 ? "No quotes available." : null,
    errorCode: validQuotes.length === 0 ? "provider_unavailable" : null,
    isDevelopmentMock: false,
  };
}

async function fetchHistoryForAsset(
  assetId: string,
  range: ChartRange,
): Promise<MarketHistoryResponse> {
  const asset = assertPublicAssetId(assetId);
  const providerSymbol = buildProviderSymbolMap("finnhub").get(asset.id);
  const fetchedAt = new Date().toISOString();

  if (!providerSymbol) {
    return {
      assetId,
      range,
      candles: [],
      status: "unavailable",
      error: "Symbol not configured.",
      errorCode: "symbol_unavailable",
      fetchedAt,
      periodChangePercent: null,
    };
  }

  const cacheKey = `history:finnhub:${asset.id}:${range}`;
  const cached = getCached<MarketHistoryResponse>(cacheKey);
  if (cached) return cached;

  const { resolution, lookbackSeconds } = FINNHUB_CHART_RANGE_CONFIG[range];
  const to = Math.floor(Date.now() / 1000);
  const from = to - lookbackSeconds;

  try {
    const url = buildUrl("/stock/candle", {
      symbol: providerSymbol,
      resolution,
      from: String(from),
      to: String(to),
    });
    const json = await fetchJson<unknown>(url, `Candles ${providerSymbol}`);
    const parsed = finnhubCandleSchema.safeParse(json);

    if (!parsed.success || parsed.data.s !== "ok") {
      const response: MarketHistoryResponse = {
        assetId,
        range,
        candles: [],
        status: "unavailable",
        error:
          asset.assetType === "index"
            ? "Unavailable"
            : "Historical data unavailable.",
        errorCode: "historical_unavailable",
        fetchedAt,
        periodChangePercent: null,
      };
      return setCached(cacheKey, response, MARKET_REFRESH_CONFIG.historyCacheMs);
    }

    const { c = [], t = [], o = [], h = [], l = [], v = [] } = parsed.data;
    const candles: MarketCandle[] = c
      .map((close, i) => ({
        timestamp: new Date((t[i] ?? 0) * 1000).toISOString(),
        open: o[i] ?? close,
        high: h[i] ?? close,
        low: l[i] ?? close,
        close,
        volume: v[i] ?? null,
      }))
      .filter((candle) => candle.close > 0);

    const response: MarketHistoryResponse = {
      assetId,
      range,
      candles,
      status: candles.length > 0 ? "ok" : "unavailable",
      error: candles.length > 0 ? null : "No historical candles returned.",
      errorCode: candles.length > 0 ? null : "historical_unavailable",
      fetchedAt,
      periodChangePercent: computePeriodChangePercent(candles),
    };
    return setCached(cacheKey, response, MARKET_REFRESH_CONFIG.historyCacheMs);
  } catch (error) {
    const message =
      error instanceof MarketDataError
        ? error.message
        : "Historical data unavailable.";
    return {
      assetId,
      range,
      candles: [],
      status: "error",
      error: message,
      errorCode:
        error instanceof MarketDataError ? error.code : "historical_unavailable",
      fetchedAt,
      periodChangePercent: null,
    };
  }
}

export async function getFinnhubQuotes(): Promise<MarketQuotesResponse> {
  const cacheKey = "quotes:finnhub";
  const stale = getStaleCached<MarketQuotesResponse>(cacheKey);
  const marketStateGuess = stale?.value.marketState ?? "unknown";
  const ttl = getServerCacheTtlMs(marketStateGuess);

  if (stale && !stale.expired) {
    return {
      ...stale.value,
      quotesByAssetId: Object.fromEntries(
        Object.entries(stale.value.quotesByAssetId).map(([id, quote]) => [
          id,
          sanitizePublicQuote(quote),
        ]),
      ),
    };
  }

  return dedupeRequest(cacheKey, async () => {
    try {
      const existing = stale?.value.quotesByAssetId ?? {};
      const fresh = await fetchAllQuotes(existing);
      return setCached(cacheKey, fresh, ttl);
    } catch (error) {
      if (stale?.value) {
        return {
          ...stale.value,
          isStale: true,
          status: stale.value.status === "ok" ? "partial" : stale.value.status,
          error:
            error instanceof MarketDataError
              ? error.message
              : "Refresh failed; showing cached data.",
          errorCode:
            error instanceof MarketDataError ? error.code : "provider_unavailable",
        };
      }
      throw error;
    }
  });
}

export const finnhubProvider: MarketDataProviderInterface = {
  name: "finnhub",
  fetchQuotes: getFinnhubQuotes,
  fetchHistory: (assetId, range) =>
    fetchHistoryForAsset(assetId, range.toUpperCase() as ChartRange),
};
