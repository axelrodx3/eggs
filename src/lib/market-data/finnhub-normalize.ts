import { inferUsMarketState } from "./market-hours";
import type { MarketQuote } from "./types";

export type FinnhubQuoteRaw = {
  c?: number;
  d?: number | null;
  dp?: number | null;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  t?: number;
};

function isValidQuoteNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value) && value > 0;
}

/** User-facing copy when a quote cannot be loaded — never expose provider plan/subscription errors. */
export function resolveUnavailableReason(assetType: "equity" | "index"): string {
  return assetType === "index" ? "Unavailable" : "Market data unavailable.";
}

export function sanitizePublicQuote(quote: MarketQuote): MarketQuote {
  if (quote.assetType !== "index" || !quote.unavailable) {
    return quote;
  }
  return {
    ...quote,
    unavailableReason: resolveUnavailableReason("index"),
  };
}

export function createUnavailableQuote(
  assetId: string,
  assetName: string,
  displaySymbol: string,
  assetType: "equity" | "index",
  reason: string,
  fetchedAt: string,
): MarketQuote {
  const message =
    assetType === "index" ? resolveUnavailableReason("index") : reason;
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
    provider: "finnhub",
    providerTimestamp: null,
    fetchedAt,
    isDelayed: false,
    delayMinutes: null,
    isStale: false,
    unavailable: true,
    unavailableReason: message,
  };
}

export function normalizeFinnhubQuote(
  assetId: string,
  displaySymbol: string,
  assetName: string,
  assetType: "equity" | "index",
  raw: FinnhubQuoteRaw,
  fetchedAt: string,
): MarketQuote {
  const price = isValidQuoteNumber(raw.c) ? raw.c : null;
  const previousClose = isValidQuoteNumber(raw.pc) ? raw.pc : null;
  const change =
    raw.d !== null && raw.d !== undefined && Number.isFinite(raw.d)
      ? raw.d
      : price !== null && previousClose !== null
        ? price - previousClose
        : null;
  const changePercent =
    raw.dp !== null && raw.dp !== undefined && Number.isFinite(raw.dp)
      ? raw.dp
      : change !== null && previousClose !== null && previousClose !== 0
        ? (change / previousClose) * 100
        : null;

  const hasData = price !== null && price > 0;

  if (!hasData) {
    return createUnavailableQuote(
      assetId,
      assetName,
      displaySymbol,
      assetType,
      resolveUnavailableReason(assetType),
      fetchedAt,
    );
  }

  const timestamp = raw.t && raw.t > 0 ? raw.t : null;
  const providerTimestamp = timestamp
    ? new Date(timestamp * 1000).toISOString()
    : null;

  return {
    assetId,
    symbol: displaySymbol,
    name: assetName,
    assetType,
    currency: "USD",
    price,
    previousClose,
    open: isValidQuoteNumber(raw.o) ? raw.o : null,
    high: isValidQuoteNumber(raw.h) ? raw.h : null,
    low: isValidQuoteNumber(raw.l) ? raw.l : null,
    volume: null,
    marketCap: null,
    change,
    changePercent,
    marketState: inferUsMarketState(),
    provider: "finnhub",
    providerTimestamp,
    fetchedAt,
    isDelayed: false,
    delayMinutes: null,
    isStale: false,
  };
}
