/** Centralized refresh, cache, and request timing configuration. */
export const MARKET_REFRESH_CONFIG = {
  /** Client poll interval (Finnhub free tier — avoid aggressive polling). */
  openMs: 90_000,
  extendedHoursMs: 120_000,
  closedMs: 10 * 60_000,
  requestTimeoutMs: 12_000,
  staleAfterMs: 120_000,
  /** Server-side quote cache (60–120s per requirements). */
  serverCacheOpenMs: 90_000,
  serverCacheExtendedMs: 120_000,
  serverCacheClosedMs: 8 * 60_000,
  historyCacheMs: 5 * 60_000,
  maxRetries: 1,
  retryBaseMs: 1_000,
} as const;

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export const CHART_RANGE_ALLOWLIST: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

/** Finnhub /stock/candle resolution and lookback windows. */
export const FINNHUB_CHART_RANGE_CONFIG: Record<
  ChartRange,
  { resolution: string; lookbackSeconds: number }
> = {
  "1D": { resolution: "15", lookbackSeconds: 86_400 },
  "1W": { resolution: "60", lookbackSeconds: 7 * 86_400 },
  "1M": { resolution: "D", lookbackSeconds: 30 * 86_400 },
  "3M": { resolution: "D", lookbackSeconds: 90 * 86_400 },
  "1Y": { resolution: "D", lookbackSeconds: 365 * 86_400 },
};

export function getClientRefreshIntervalMs(
  marketState: "premarket" | "open" | "after-hours" | "closed" | "unknown",
): number {
  switch (marketState) {
    case "open":
      return MARKET_REFRESH_CONFIG.openMs;
    case "premarket":
    case "after-hours":
      return MARKET_REFRESH_CONFIG.extendedHoursMs;
    case "closed":
      return MARKET_REFRESH_CONFIG.closedMs;
    default:
      return MARKET_REFRESH_CONFIG.extendedHoursMs;
  }
}

export function getServerCacheTtlMs(
  marketState: "premarket" | "open" | "after-hours" | "closed" | "unknown",
): number {
  switch (marketState) {
    case "open":
      return MARKET_REFRESH_CONFIG.serverCacheOpenMs;
    case "premarket":
    case "after-hours":
      return MARKET_REFRESH_CONFIG.serverCacheExtendedMs;
    case "closed":
      return MARKET_REFRESH_CONFIG.serverCacheClosedMs;
    default:
      return MARKET_REFRESH_CONFIG.serverCacheExtendedMs;
  }
}
