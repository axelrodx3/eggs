/** Centralized refresh, cache, and request timing configuration. */
export const MARKET_REFRESH_CONFIG = {
  /** During regular U.S. session (9:30 AM – 4:00 PM ET). */
  openMs: 60_000,
  /** Premarket and after-hours. */
  extendedHoursMs: 90_000,
  /** Market closed (weekends, holidays, overnight). */
  closedMs: 10 * 60_000,
  /** Upstream HTTP request timeout. */
  requestTimeoutMs: 12_000,
  /** Client/server stale threshold after a successful fetch. */
  staleAfterMs: 90_000,
  /** Server-side quote cache TTL during open session. */
  serverCacheOpenMs: 60_000,
  serverCacheExtendedMs: 90_000,
  serverCacheClosedMs: 8 * 60_000,
  /** Market cap statistics cache (slow-moving). */
  marketCapCacheMs: 6 * 60 * 60_000,
  /** Historical candle cache per asset+range. */
  historyCacheMs: 5 * 60_000,
  /** Max symbols per Twelve Data quote request (free tier ≈8 credits/min). */
  quoteChunkSize: 4,
  /** Pause between chunked quote requests when bootstrapping. */
  quoteChunkDelayMs: 61_000,
  maxRetries: 2,
  retryBaseMs: 800,
} as const;

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export const CHART_RANGE_ALLOWLIST: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

export const CHART_RANGE_CONFIG: Record<
  ChartRange,
  { interval: string; outputsize: number }
> = {
  "1D": { interval: "15min", outputsize: 32 },
  "1W": { interval: "1h", outputsize: 40 },
  "1M": { interval: "1day", outputsize: 30 },
  "3M": { interval: "1day", outputsize: 90 },
  "1Y": { interval: "1day", outputsize: 252 },
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
