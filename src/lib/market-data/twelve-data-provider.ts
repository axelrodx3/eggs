import "server-only";

import { z } from "zod";
import {
  getPublicMarketAssets,
  buildProviderSymbolMap,
  assertPublicAssetId,
} from "./allowlist";
import {
  CHART_RANGE_CONFIG,
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
import { resolveMarketState } from "./market-hours";
import {
  calculateChange,
  computePeriodChangePercent,
  parseProviderNumber,
  parseProviderTimestamp,
  reconcileChange,
  getAggregateMarketState,
} from "./normalize";
import type {
  MarketCandle,
  MarketDataProviderInterface,
  MarketHistoryResponse,
  MarketQuote,
  MarketQuotesResponse,
} from "./types";
import { getServerCacheTtlMs } from "./config";

const TWELVE_DATA_BASE = "https://api.twelvedata.com";

let quoteChunkRotation = 0;

const twelveDataErrorSchema = z.object({
  code: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
  status: z.string().optional(),
});

const twelveDataQuoteSchema = z
  .object({
    symbol: z.string().optional(),
    name: z.string().optional(),
    exchange: z.string().optional(),
    currency: z.string().optional(),
    datetime: z.string().optional(),
    timestamp: z.union([z.number(), z.string()]).optional(),
    open: z.union([z.string(), z.number()]).optional(),
    high: z.union([z.string(), z.number()]).optional(),
    low: z.union([z.string(), z.number()]).optional(),
    close: z.union([z.string(), z.number()]).optional(),
    volume: z.union([z.string(), z.number()]).optional(),
    previous_close: z.union([z.string(), z.number()]).optional(),
    change: z.union([z.string(), z.number()]).optional(),
    percent_change: z.union([z.string(), z.number()]).optional(),
    is_market_open: z.union([z.boolean(), z.string(), z.number()]).optional(),
  })
  .passthrough();

const twelveDataTimeSeriesSchema = z.object({
  meta: z
    .object({
      symbol: z.string().optional(),
      interval: z.string().optional(),
    })
    .optional(),
  values: z
    .array(
      z.object({
        datetime: z.string(),
        open: z.string(),
        high: z.string(),
        low: z.string(),
        close: z.string(),
        volume: z.string().optional(),
      }),
    )
    .optional(),
  status: z.string().optional(),
  code: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
});

function getApiKey(): string {
  const key = process.env.TWELVE_DATA_API_KEY?.trim();
  if (!key) {
    throw new MarketDataError(
      "missing_api_key",
      "TWELVE_DATA_API_KEY is not configured.",
    );
  }
  return key;
}

function parseIsMarketOpen(value: unknown): boolean | null {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return null;
}

async function fetchWithTimeout(
  url: string,
  options?: { signal?: AbortSignal },
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    MARKET_REFRESH_CONFIG.requestTimeoutMs,
  );
  const onAbort = () => controller.abort();
  options?.signal?.addEventListener("abort", onAbort);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
    options?.signal?.removeEventListener("abort", onAbort);
  }
}

async function fetchJsonWithRetry<T>(
  url: string,
  label: string,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MARKET_REFRESH_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after")) || 60_000;
        throw new MarketDataError("rate_limit", "Rate limit reached.", {
          retryAfterMs: retryAfter * 1000,
        });
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
        if (error.code === "rate_limit") throw error;
      }
      if (attempt < MARKET_REFRESH_CONFIG.maxRetries) {
        await new Promise((r) =>
          setTimeout(r, MARKET_REFRESH_CONFIG.retryBaseMs * 2 ** attempt),
        );
        continue;
      }
    }
  }
  if (lastError instanceof MarketDataError) throw lastError;
  throw new MarketDataError(
    "timeout",
    `${label} timed out.`,
    { cause: lastError },
  );
}

function unavailableQuote(
  assetId: string,
  assetName: string,
  displaySymbol: string,
  assetType: "equity" | "index",
  reason: string,
  fetchedAt: string,
): MarketQuote {
  return {
    assetId,
    symbol: displaySymbol,
    name: assetName,
    assetType,
    currency: "USD",
    price: null,
    previousClose: null,
    open: null,
    high: null,
    low: null,
    volume: null,
    marketCap: null,
    change: null,
    changePercent: null,
    marketState: "unknown",
    provider: "twelve-data",
    providerTimestamp: null,
    fetchedAt,
    isDelayed: true,
    delayMinutes: null,
    isStale: false,
    unavailable: true,
    unavailableReason: reason,
  };
}

function normalizeQuoteEntry(
  assetId: string,
  assetName: string,
  displaySymbol: string,
  assetType: "equity" | "index",
  raw: z.infer<typeof twelveDataQuoteSchema>,
  fetchedAt: string,
  marketCap: number | null,
): MarketQuote {
  const price =
    parseProviderNumber(raw.close) ?? parseProviderNumber(raw.open);
  const previousClose = parseProviderNumber(raw.previous_close);
  const providerChange = parseProviderNumber(raw.change);
  const providerChangePercent = parseProviderNumber(raw.percent_change);
  const { change, changePercent } = reconcileChange(
    price,
    previousClose,
    providerChange,
    providerChangePercent,
  );

  const providerIsOpen = parseIsMarketOpen(raw.is_market_open);
  const marketState = resolveMarketState(providerIsOpen);

  return {
    assetId,
    symbol: displaySymbol,
    name: raw.name ?? assetName,
    assetType,
    currency: raw.currency ?? "USD",
    exchange: raw.exchange,
    price,
    previousClose,
    open: parseProviderNumber(raw.open),
    high: parseProviderNumber(raw.high),
    low: parseProviderNumber(raw.low),
    volume: parseProviderNumber(raw.volume),
    marketCap,
    change,
    changePercent,
    marketState,
    provider: "twelve-data",
    providerTimestamp: parseProviderTimestamp(
      raw.datetime,
      typeof raw.timestamp === "string"
        ? Number(raw.timestamp)
        : (raw.timestamp ?? null),
    ),
    fetchedAt,
    isDelayed: true,
    delayMinutes: 15,
    isStale: false,
  };
}

async function fetchQuoteChunk(
  chunkAssetIds: string[],
  fetchedAt: string,
): Promise<Record<string, MarketQuote>> {
  const assets = getPublicMarketAssets();
  const symbolMap = buildProviderSymbolMap("twelve-data");
  const symbols = chunkAssetIds
    .map((id) => symbolMap.get(id))
    .filter((symbol): symbol is string => Boolean(symbol));

  if (symbols.length === 0) return {};

  const apiKey = getApiKey();
  const url = `${TWELVE_DATA_BASE}/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`;
  const json = await fetchJsonWithRetry<unknown>(url, "Quote");

  const topLevelError = twelveDataErrorSchema.safeParse(json);
  if (topLevelError.success && topLevelError.data.status === "error") {
    const code = topLevelError.data.code;
    if (code === 429 || code === "429") {
      throw new MarketDataError("rate_limit", "Rate limit reached.", {
        retryAfterMs: 60_000,
      });
    }
    if (!("symbol" in (json as object))) {
      throw new MarketDataError(
        "provider_unavailable",
        topLevelError.data.message ?? "Provider returned an error.",
      );
    }
  }

  const quotesByAssetId: Record<string, MarketQuote> = {};
  const reverseMap = new Map<string, string>();
  for (const assetId of chunkAssetIds) {
    const symbol = symbolMap.get(assetId);
    if (symbol) reverseMap.set(symbol.toUpperCase(), assetId);
  }

  const processEntry = (
    symbolKey: string,
    entry: z.infer<typeof twelveDataQuoteSchema>,
  ) => {
    const assetId = reverseMap.get(symbolKey.toUpperCase());
    if (!assetId) return;
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const entryError = twelveDataErrorSchema.safeParse(entry);
    if (entryError.success && entryError.data.status === "error") {
      const reason =
        asset.assetType === "index"
          ? "Index data unavailable on current provider plan."
          : (entryError.data.message ?? "Symbol unavailable.");
      quotesByAssetId[assetId] = unavailableQuote(
        assetId,
        asset.name,
        asset.displayTicker ?? symbolKey,
        asset.assetType === "index" ? "index" : "equity",
        reason,
        fetchedAt,
      );
      return;
    }

    const parsed = twelveDataQuoteSchema.safeParse(entry);
    if (!parsed.success) {
      quotesByAssetId[assetId] = unavailableQuote(
        assetId,
        asset.name,
        asset.displayTicker ?? symbolKey,
        asset.assetType === "index" ? "index" : "equity",
        "Invalid provider response.",
        fetchedAt,
      );
      return;
    }

    quotesByAssetId[assetId] = normalizeQuoteEntry(
      assetId,
      asset.name,
      asset.displayTicker ?? symbolKey,
      asset.assetType === "index" ? "index" : "equity",
      parsed.data,
      fetchedAt,
      null,
    );
  };

  if (typeof json === "object" && json !== null && "symbol" in json) {
    const single = twelveDataQuoteSchema.safeParse(json);
    if (single.success && single.data.symbol) {
      processEntry(single.data.symbol, single.data);
    }
  } else if (typeof json === "object" && json !== null) {
    for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
      if (key === "status" || key === "code" || key === "message") continue;
      processEntry(key, value as z.infer<typeof twelveDataQuoteSchema>);
    }
  }

  for (const assetId of chunkAssetIds) {
    if (quotesByAssetId[assetId]) continue;
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) continue;
    quotesByAssetId[assetId] = unavailableQuote(
      assetId,
      asset.name,
      asset.displayTicker ?? assetId.toUpperCase(),
      asset.assetType === "index" ? "index" : "equity",
      asset.assetType === "index"
        ? "Index data unavailable on current provider plan."
        : "Symbol unavailable.",
      fetchedAt,
    );
  }

  return quotesByAssetId;
}

async function fetchBatchQuotes(
  existingQuotes: Record<string, MarketQuote> = {},
): Promise<MarketQuotesResponse> {
  const fetchedAt = new Date().toISOString();
  const assets = getPublicMarketAssets();
  const assetIds = assets.map((a) => a.id);
  if (assetIds.length === 0) {
    return {
      quotesByAssetId: {},
      status: "error",
      provider: "twelve-data",
      marketState: "unknown",
      lastUpdated: null,
      fetchedAt,
      isStale: false,
      error: "No quotable assets configured.",
      errorCode: "provider_unavailable",
      isDevelopmentMock: false,
    };
  }

  const chunkSize = MARKET_REFRESH_CONFIG.quoteChunkSize;
  const totalChunks = Math.ceil(assetIds.length / chunkSize);
  const hasBootstrapGap = assetIds.some((id) => !existingQuotes[id]?.price);
  const chunkIndex = hasBootstrapGap
    ? Math.floor(
        assetIds.findIndex((id) => !existingQuotes[id]?.price) / chunkSize,
      )
    : quoteChunkRotation % totalChunks;
  if (!hasBootstrapGap) quoteChunkRotation += 1;

  const chunkAssetIds = assetIds.slice(
    chunkIndex * chunkSize,
    (chunkIndex + 1) * chunkSize,
  );

  const freshChunk = await fetchQuoteChunk(chunkAssetIds, fetchedAt);
  const quotesByAssetId: Record<string, MarketQuote> = {
    ...existingQuotes,
    ...freshChunk,
  };

  const validQuotes = Object.values(quotesByAssetId).filter((q) => !q.unavailable);
  const marketState = getAggregateMarketState(Object.values(quotesByAssetId));
  const lastUpdated =
    validQuotes
      .map((q) => q.providerTimestamp)
      .filter(Boolean)
      .sort()
      .at(-1) ?? fetchedAt;

  const unavailableCount = Object.values(quotesByAssetId).filter(
    (q) => q.unavailable,
  ).length;

  return {
    quotesByAssetId,
    status:
      validQuotes.length === 0
        ? "error"
        : unavailableCount > 0
          ? "partial"
          : "ok",
    provider: "twelve-data",
    marketState,
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
  const providerSymbol = buildProviderSymbolMap("twelve-data").get(asset.id);
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

  const cacheKey = `history:${asset.id}:${range}`;
  const cached = getCached<MarketHistoryResponse>(cacheKey);
  if (cached) return cached;

  const { interval, outputsize } = CHART_RANGE_CONFIG[range];
  const apiKey = getApiKey();
  const url = `${TWELVE_DATA_BASE}/time_series?symbol=${encodeURIComponent(providerSymbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${apiKey}`;

  try {
    const json = await fetchJsonWithRetry<unknown>(url, "Time series");
    const parsed = twelveDataTimeSeriesSchema.safeParse(json);
    if (!parsed.success || parsed.data.status === "error") {
      const message =
        parsed.success && parsed.data.message
          ? parsed.data.message
          : "Historical data unavailable.";
      const response: MarketHistoryResponse = {
        assetId,
        range,
        candles: [],
        status: "unavailable",
        error:
          asset.assetType === "index"
            ? "Index historical data unavailable on current provider plan."
            : message,
        errorCode: "historical_unavailable",
        fetchedAt,
        periodChangePercent: null,
      };
      return setCached(cacheKey, response, MARKET_REFRESH_CONFIG.historyCacheMs);
    }

    const values = parsed.data.values ?? [];
    const candles: MarketCandle[] = values
      .map((row) => ({
        timestamp: row.datetime.includes("T")
          ? new Date(row.datetime).toISOString()
          : new Date(`${row.datetime.replace(" ", "T")}Z`).toISOString(),
        open: parseProviderNumber(row.open) ?? 0,
        high: parseProviderNumber(row.high) ?? 0,
        low: parseProviderNumber(row.low) ?? 0,
        close: parseProviderNumber(row.close) ?? 0,
        volume: parseProviderNumber(row.volume),
      }))
      .filter((c) => c.close > 0)
      .reverse();

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

export async function getTwelveDataQuotes(): Promise<MarketQuotesResponse> {
  const cacheKey = "quotes:twelve-data";
  const stale = getStaleCached<MarketQuotesResponse>(cacheKey);
  const marketStateGuess = stale?.value.marketState ?? "unknown";
  const ttl = getServerCacheTtlMs(marketStateGuess);

  if (stale && !stale.expired) {
    return stale.value;
  }

  return dedupeRequest(cacheKey, async () => {
    try {
      const existing = stale?.value.quotesByAssetId ?? {};
      const fresh = await fetchBatchQuotes(existing);
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

export const twelveDataProvider: MarketDataProviderInterface = {
  name: "twelve-data",
  fetchQuotes: getTwelveDataQuotes,
  fetchHistory: (assetId, range) =>
    fetchHistoryForAsset(assetId, range.toUpperCase() as ChartRange),
};

export { calculateChange };
