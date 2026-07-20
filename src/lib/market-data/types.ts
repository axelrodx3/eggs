export type QuoteChange = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  currency: string;
  updatedAt: string;
  isDemo: boolean;
};

export type HistoricalPoint = {
  date: string;
  value: number;
};

export type QuoteBundle = {
  quotes: Record<string, QuoteChange>;
  history: Record<string, HistoricalPoint[]>;
  source: "demo" | "live";
  stale: boolean;
  error: string | null;
};

export type MarketDataProvider = {
  name: string;
  fetchQuotes(symbols: string[]): Promise<QuoteBundle>;
};
