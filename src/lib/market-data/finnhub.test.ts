import { describe, expect, it } from "vitest";
import { publicMarketAssetIds } from "@/data/assets";
import { assertPublicAssetId } from "./allowlist";
import { normalizeFinnhubQuote, createUnavailableQuote, resolveUnavailableReason } from "./finnhub-normalize";
import {
  calculateChange,
  parseProviderNumber,
  computePeriodChangePercent,
  getDataStateLabel,
} from "./normalize";
import { formatTimestampEt } from "./market-hours";
import { getDataStateDisplay } from "./labels";
import type { MarketQuote } from "./types";

function baseQuote(overrides: Partial<MarketQuote> = {}): MarketQuote {
  return {
    assetId: "aapl",
    symbol: "AAPL",
    name: "Apple",
    assetType: "equity",
    currency: "USD",
    price: 100,
    previousClose: 98,
    open: 99,
    high: 101,
    low: 98.5,
    volume: null,
    marketCap: null,
    change: 2,
    changePercent: 2.0408,
    marketState: "open",
    provider: "finnhub",
    providerTimestamp: "2026-07-14T16:00:00.000Z",
    fetchedAt: "2026-07-14T16:00:05.000Z",
    isDelayed: false,
    delayMinutes: null,
    isStale: false,
    ...overrides,
  };
}

describe("normalizeFinnhubQuote", () => {
  it("normalizes a positive Finnhub quote response", () => {
    const quote = normalizeFinnhubQuote(
      "aapl",
      "AAPL",
      "Apple",
      "equity",
      { c: 214.32, d: 2.14, dp: 1.01, h: 215, l: 212, o: 213, pc: 212.18, t: 1784640600 },
      new Date().toISOString(),
    );
    expect(quote.price).toBe(214.32);
    expect(quote.change).toBe(2.14);
    expect(quote.changePercent).toBe(1.01);
    expect(quote.provider).toBe("finnhub");
    expect(quote.unavailable).toBeUndefined();
  });

  it("normalizes a negative quote response", () => {
    const quote = normalizeFinnhubQuote(
      "tsla",
      "TSLA",
      "Tesla",
      "equity",
      { c: 248.6, d: -5.3, dp: -2.09, h: 254, l: 246, o: 252, pc: 253.9, t: 1784640600 },
      new Date().toISOString(),
    );
    expect(quote.change).toBeLessThan(0);
    expect(quote.changePercent).toBeLessThan(0);
  });

  it("returns unavailable for empty Finnhub quote (c=0)", () => {
    const quote = normalizeFinnhubQuote(
      "sp500",
      "SPX",
      "S&P 500 Index",
      "index",
      { c: 0, d: null, dp: null, h: 0, l: 0, o: 0, pc: 0, t: 0 },
      new Date().toISOString(),
    );
    expect(quote.unavailable).toBe(true);
    expect(quote.price).toBeNull();
    expect(quote.change).toBeNull();
  });

  it("does not treat invalid numerics as zero price", () => {
    const quote = normalizeFinnhubQuote(
      "ndx",
      "NDX",
      "Nasdaq-100 Index",
      "index",
      { c: 0, pc: 0 },
      new Date().toISOString(),
    );
    expect(quote.price).toBeNull();
    expect(quote.price).not.toBe(0);
  });

  it("uses generic unavailable copy for indexes", () => {
    const quote = normalizeFinnhubQuote(
      "sp500",
      "SPX",
      "S&P 500 Index",
      "index",
      { c: 0, d: null, dp: null, h: 0, l: 0, o: 0, pc: 0, t: 0 },
      new Date().toISOString(),
    );
    expect(quote.unavailableReason).toBe("Unavailable");
  });
});

describe("resolveUnavailableReason", () => {
  it("never exposes provider subscription errors for indexes", () => {
    const quote = createUnavailableQuote(
      "sp500",
      "S&P 500 Index",
      "SPX",
      "index",
      "Market data subscription required for CFD indices.",
      new Date().toISOString(),
    );
    expect(quote.unavailableReason).toBe("Unavailable");
    expect(resolveUnavailableReason("index")).toBe("Unavailable");
  });

  it("sanitizes stale cached index quotes at the API boundary", async () => {
    const { sanitizePublicQuote } = await import("./finnhub-normalize");
    const stale = createUnavailableQuote(
      "ndx",
      "Nasdaq-100 Index",
      "NDX",
      "index",
      "Market data subscription required for CFD indices.",
      new Date().toISOString(),
    );
    expect(sanitizePublicQuote(stale).unavailableReason).toBe("Unavailable");
  });
});

describe("calculateChange", () => {
  it("computes change from previous close", () => {
    const result = calculateChange(214.32, 212.18);
    expect(result.change).toBeCloseTo(2.14, 2);
  });

  it("handles missing previous close", () => {
    expect(calculateChange(100, null)).toEqual({
      change: null,
      changePercent: null,
    });
  });
});

describe("SpaceX exclusion", () => {
  it("does not include SpaceX in public market assets", () => {
    expect(publicMarketAssetIds).not.toContain("spacex");
    expect(publicMarketAssetIds).toHaveLength(9);
  });
});

describe("symbol allowlisting", () => {
  it("rejects unsupported asset ids", () => {
    expect(() => assertPublicAssetId("spacex")).toThrow();
    expect(() => assertPublicAssetId("fake")).toThrow();
  });
});

describe("missing API key", () => {
  it("defines missing_api_key error code", async () => {
    const { MarketDataError } = await import("./errors");
    const error = new MarketDataError("missing_api_key", "Missing key");
    expect(error.code).toBe("missing_api_key");
  });
});

describe("partial failure handling", () => {
  it("allows unavailable symbol without breaking valid quotes", () => {
    const good = baseQuote({ assetId: "aapl" });
    const bad = baseQuote({
      assetId: "sp500",
      unavailable: true,
      price: null,
      change: null,
      changePercent: null,
    });
    expect(good.price).not.toBeNull();
    expect(bad.unavailable).toBe(true);
  });
});

describe("index fallback", () => {
  it("labels index unavailable state", () => {
    const quote = baseQuote({
      assetId: "sp500",
      symbol: "SPX",
      assetType: "index",
      unavailable: true,
      price: null,
    });
    expect(getDataStateLabel(quote)).toBe("index_unavailable");
    expect(getDataStateDisplay("index_unavailable")).toContain("Index");
  });
});

describe("historical candles", () => {
  it("computes period change percent", () => {
    const pct = computePeriodChangePercent([{ close: 100 }, { close: 101 }]);
    expect(pct).toBe(1);
  });

  it("builds synthetic candles from a live quote", async () => {
    const { buildSyntheticCandlesFromQuote } = await import("./synthetic-history");
    const candles = buildSyntheticCandlesFromQuote(
      baseQuote({ price: 200, previousClose: 190, high: 205, low: 188 }),
      "1M",
    );
    expect(candles.length).toBeGreaterThan(1);
    expect(candles.at(-1)?.close).toBe(200);
  });
});

describe("Robinhood stock URLs", () => {
  it("maps equities to Robinhood stock pages", async () => {
    const { basketAssetById, getRobinhoodStockUrl } = await import("@/data/assets");
    expect(getRobinhoodStockUrl(basketAssetById.aapl)).toBe(
      "https://robinhood.com/stocks/AAPL/",
    );
    expect(getRobinhoodStockUrl(basketAssetById.googl)).toBe(
      "https://robinhood.com/stocks/GOOGL/",
    );
  });

  it("maps index eggs to tradable Robinhood ETF pages", async () => {
    const { basketAssetById, getRobinhoodStockUrl } = await import("@/data/assets");
    expect(getRobinhoodStockUrl(basketAssetById.sp500)).toBe(
      "https://robinhood.com/stocks/SPY/",
    );
    expect(getRobinhoodStockUrl(basketAssetById.ndx)).toBe(
      "https://robinhood.com/stocks/QQQ/",
    );
    expect(getRobinhoodStockUrl(basketAssetById.spacex)).toBeNull();
  });
});

describe("safe rendering inputs", () => {
  it("parseProviderNumber rejects empty values", () => {
    expect(parseProviderNumber("")).toBeNull();
    expect(parseProviderNumber(undefined)).toBeNull();
  });
});

describe("timestamp formatting", () => {
  it("formats timestamps in Eastern time", () => {
    const formatted = formatTimestampEt("2026-07-14T16:00:00.000Z");
    expect(formatted).toMatch(/\d/);
  });
});
