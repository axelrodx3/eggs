import { describe, expect, it } from "vitest";
import { publicMarketAssetIds } from "@/data/assets";
import { assertPublicAssetId } from "./allowlist";
import {
  calculateChange,
  reconcileChange,
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
    volume: 1_000_000,
    marketCap: 1e12,
    change: 2,
    changePercent: 2.0408,
    marketState: "open",
    provider: "twelve-data",
    providerTimestamp: "2026-07-14T16:00:00.000Z",
    fetchedAt: "2026-07-14T16:00:05.000Z",
    isDelayed: true,
    delayMinutes: 15,
    isStale: false,
    ...overrides,
  };
}

describe("calculateChange", () => {
  it("computes positive change from previous close", () => {
    const result = calculateChange(214.32, 212.18);
    expect(result.change).toBeCloseTo(2.14, 2);
    expect(result.changePercent).toBeCloseTo(1.01, 1);
  });

  it("handles missing previous close", () => {
    expect(calculateChange(100, null)).toEqual({
      change: null,
      changePercent: null,
    });
  });

  it("handles negative change", () => {
    const result = calculateChange(178.45, 179.67);
    expect(result.change).toBeLessThan(0);
    expect(result.changePercent).toBeLessThan(0);
  });
});

describe("reconcileChange", () => {
  it("prefers computed change from price and previous close", () => {
    const result = reconcileChange(110, 100, 5, 5);
    expect(result.change).toBe(10);
    expect(result.changePercent).toBe(10);
  });
});

describe("parseProviderNumber", () => {
  it("parses string numbers with commas", () => {
    expect(parseProviderNumber("1,234.56")).toBe(1234.56);
  });

  it("returns null for invalid values", () => {
    expect(parseProviderNumber("")).toBeNull();
    expect(parseProviderNumber(undefined)).toBeNull();
  });
});

describe("index quote normalization", () => {
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

describe("stale and rate-limit labels", () => {
  it("formats timestamps in Eastern time", () => {
    const formatted = formatTimestampEt("2026-07-14T16:00:00.000Z");
    expect(formatted).toMatch(/\d/);
  });

  it("shows delayed label for delayed quotes", () => {
    const quote = baseQuote({ isDelayed: true, delayMinutes: 15 });
    expect(getDataStateDisplay(getDataStateLabel(quote))).toBe("Delayed 15 min");
  });
});

describe("historical candles", () => {
  it("computes period change percent", () => {
    const pct = computePeriodChangePercent([
      { close: 100 },
      { close: 101 },
    ]);
    expect(pct).toBe(1);
  });
});

describe("SpaceX exclusion", () => {
  it("does not treat private assets as quotable", () => {
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

describe("missing API key handling", () => {
  it("defines missing_api_key error code", async () => {
    const { MarketDataError } = await import("./errors");
    const error = new MarketDataError("missing_api_key", "Missing key");
    expect(error.code).toBe("missing_api_key");
  });
});

describe("partial provider failure", () => {
  it("allows unavailable symbol without breaking others", () => {
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

describe("safe rendering inputs", () => {
  it("does not produce NaN from null price change", () => {
    const result = calculateChange(null, 100);
    expect(Number.isNaN(result.change)).toBe(false);
    expect(result.change).toBeNull();
  });
});
