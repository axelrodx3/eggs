import { FINNHUB_CHART_RANGE_CONFIG, type ChartRange } from "./config";
import type { MarketCandle, MarketQuote } from "./types";

function pointCountForRange(range: ChartRange): number {
  switch (range) {
    case "1D":
      return 32;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "3M":
      return 90;
    case "1Y":
      return 52;
    default:
      return 30;
  }
}

/** Approximate OHLC series anchored to a live quote when historical candles are unavailable. */
export function buildSyntheticCandlesFromQuote(
  quote: MarketQuote,
  range: ChartRange,
): MarketCandle[] {
  const endPrice = quote.price;
  if (endPrice === null || endPrice <= 0) return [];

  const startPrice =
    quote.previousClose !== null && quote.previousClose > 0
      ? quote.previousClose
      : endPrice * 0.97;
  const points = pointCountForRange(range);
  const lookbackSeconds = FINNHUB_CHART_RANGE_CONFIG[range].lookbackSeconds;
  const stepMs = (lookbackSeconds * 1000) / Math.max(points - 1, 1);
  const now = Date.now();
  const low =
    quote.low !== null && quote.low > 0
      ? quote.low
      : Math.min(startPrice, endPrice) * 0.995;
  const high =
    quote.high !== null && quote.high > 0
      ? quote.high
      : Math.max(startPrice, endPrice) * 1.005;

  const candles: MarketCandle[] = [];
  for (let i = 0; i < points; i += 1) {
    const progress = points === 1 ? 1 : i / (points - 1);
    const base = startPrice + (endPrice - startPrice) * progress;
    const wave = Math.sin(progress * Math.PI * 2) * (high - low) * 0.06;
    const close = Number(
      Math.max(low, Math.min(high, base + wave)).toFixed(2),
    );
    candles.push({
      timestamp: new Date(now - (points - 1 - i) * stepMs).toISOString(),
      open: close,
      high: Math.min(high, close * 1.004),
      low: Math.max(low, close * 0.996),
      close,
      volume: null,
    });
  }

  const last = candles[candles.length - 1];
  if (last) {
    candles[candles.length - 1] = {
      ...last,
      close: endPrice,
      high: Math.max(last.high, endPrice),
      low: Math.min(last.low, endPrice),
    };
  }

  return candles;
}
