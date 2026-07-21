import type { MarketQuote, MarketState, DataStateLabel } from "./types";
import { inferUsMarketState } from "./market-hours";

export function parseProviderNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return num;
}

export function calculateChange(
  price: number | null,
  previousClose: number | null,
): { change: number | null; changePercent: number | null } {
  if (price === null || previousClose === null || previousClose === 0) {
    return { change: null, changePercent: null };
  }
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;
  return {
    change: Number(change.toFixed(4)),
    changePercent: Number(changePercent.toFixed(4)),
  };
}

export function reconcileChange(
  price: number | null,
  previousClose: number | null,
  providerChange: number | null,
  providerChangePercent: number | null,
): { change: number | null; changePercent: number | null } {
  const computed = calculateChange(price, previousClose);
  if (computed.change !== null && computed.changePercent !== null) {
    return computed;
  }
  if (providerChange !== null && providerChangePercent !== null) {
    return { change: providerChange, changePercent: providerChangePercent };
  }
  if (providerChange !== null && price !== null && previousClose === null) {
    const inferredPrev = price - providerChange;
    if (inferredPrev !== 0) {
      return {
        change: providerChange,
        changePercent: Number(((providerChange / inferredPrev) * 100).toFixed(4)),
      };
    }
  }
  return { change: null, changePercent: null };
}

export function parseProviderTimestamp(
  datetime: string | null | undefined,
  timestamp: number | null | undefined,
): string | null {
  if (timestamp && Number.isFinite(timestamp)) {
    const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
    return new Date(ms).toISOString();
  }
  if (datetime) {
    const normalized = datetime.includes("T")
      ? datetime
      : datetime.replace(" ", "T") + "Z";
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return null;
}

export function getDataStateLabel(quote: MarketQuote): DataStateLabel {
  if (quote.unavailable) {
    if (quote.assetType === "index") return "index_unavailable";
    return "unavailable";
  }
  if (quote.isDelayed && quote.delayMinutes) return "delayed";
  if (quote.marketState === "closed") return "market_closed";
  if (!quote.isDelayed && quote.marketState === "open") return "live";
  if (quote.marketState === "premarket" || quote.marketState === "after-hours") {
    return quote.isDelayed ? "delayed" : "live";
  }
  return "last_close";
}

export function getAggregateMarketState(
  quotes: MarketQuote[],
): MarketState {
  const states = quotes
    .filter((q) => !q.unavailable)
    .map((q) => q.marketState);
  if (states.includes("open")) return "open";
  if (states.includes("premarket")) return "premarket";
  if (states.includes("after-hours")) return "after-hours";
  if (states.includes("closed")) return "closed";
  return inferUsMarketState();
}

export function candlesToChartPoints(
  candles: { timestamp: string; close: number }[],
): { date: string; value: number; timestamp: string }[] {
  return candles.map((c) => ({
    date: c.timestamp.slice(0, 10),
    value: c.close,
    timestamp: c.timestamp,
  }));
}

export function computePeriodChangePercent(
  candles: { close: number }[],
): number | null {
  if (candles.length < 2) return null;
  const first = candles[0]?.close;
  const last = candles[candles.length - 1]?.close;
  if (first === undefined || last === undefined || first === 0) return null;
  return Number((((last - first) / first) * 100).toFixed(4));
}

export function isSafeNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}
