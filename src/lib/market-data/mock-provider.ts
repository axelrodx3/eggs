import type { HistoricalPoint, QuoteBundle, QuoteChange } from "./types";

const DEMO_BASE: Record<
  string,
  Omit<QuoteChange, "symbol" | "updatedAt" | "isDemo">
> = {
  AAPL: { price: 214.32, change: 2.14, changePercent: 1.01, marketCap: 3.28e12, currency: "USD" },
  GOOGL: { price: 178.45, change: -1.22, changePercent: -0.68, marketCap: 2.19e12, currency: "USD" },
  NVDA: { price: 132.8, change: 3.45, changePercent: 2.67, marketCap: 3.25e12, currency: "USD" },
  MSFT: { price: 428.9, change: 0.88, changePercent: 0.21, marketCap: 3.18e12, currency: "USD" },
  AMZN: { price: 198.12, change: -0.54, changePercent: -0.27, marketCap: 2.06e12, currency: "USD" },
  META: { price: 512.4, change: 4.12, changePercent: 0.81, marketCap: 1.31e12, currency: "USD" },
  TSLA: { price: 248.6, change: -5.3, changePercent: -2.09, marketCap: 7.92e11, currency: "USD" },
  SPX: { price: 5284.5, change: 12.3, changePercent: 0.23, marketCap: null, currency: "USD" },
  NDX: { price: 18432.1, change: -45.2, changePercent: -0.24, marketCap: null, currency: "USD" },
};

function buildHistory(base: number, points = 30): HistoricalPoint[] {
  const result: HistoricalPoint[] = [];
  let value = base * 0.94;
  const now = Date.now();
  for (let i = points - 1; i >= 0; i -= 1) {
    const drift = (Math.sin(i / 4) + Math.cos(i / 7)) * base * 0.008;
    value = Math.max(base * 0.85, value + drift);
    result.push({
      date: new Date(now - i * 86_400_000).toISOString().slice(0, 10),
      value: Number(value.toFixed(2)),
    });
  }
  return result;
}

export const mockMarketProvider = {
  name: "mock",
  async fetchQuotes(symbols: string[]): Promise<QuoteBundle> {
    const quotes: Record<string, QuoteChange> = {};
    const history: Record<string, HistoricalPoint[]> = {};
    const updatedAt = new Date().toISOString();

    for (const symbol of symbols) {
      const base = DEMO_BASE[symbol];
      if (!base) continue;
      quotes[symbol] = {
        symbol,
        ...base,
        updatedAt,
        isDemo: true,
      };
      history[symbol] = buildHistory(base.price);
    }

    return {
      quotes,
      history,
      source: "demo",
      stale: false,
      error: null,
    };
  },
};
