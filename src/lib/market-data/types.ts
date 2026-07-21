export type MarketState =
  | "premarket"
  | "open"
  | "after-hours"
  | "closed"
  | "unknown";

export type DataStateLabel =
  | "live"
  | "delayed"
  | "market_closed"
  | "last_close"
  | "unavailable"
  | "development"
  | "index_unavailable";

export type MarketProviderName = "twelve-data" | "mock";

export type MarketQuote = {
  assetId: string;
  symbol: string;
  name: string;
  assetType: "equity" | "index";
  currency: string;
  exchange?: string;
  price: number | null;
  previousClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  marketCap: number | null;
  change: number | null;
  changePercent: number | null;
  marketState: MarketState;
  provider: MarketProviderName;
  providerTimestamp: string | null;
  fetchedAt: string;
  isDelayed: boolean;
  delayMinutes: number | null;
  isStale: boolean;
  unavailable?: boolean;
  unavailableReason?: string;
};

export type MarketCandle = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

export type MarketQuotesResponse = {
  quotesByAssetId: Record<string, MarketQuote>;
  status: "ok" | "partial" | "error" | "setup_required";
  provider: MarketProviderName | null;
  marketState: MarketState;
  lastUpdated: string | null;
  fetchedAt: string;
  isStale: boolean;
  error: string | null;
  errorCode: string | null;
  isDevelopmentMock: boolean;
};

export type MarketHistoryResponse = {
  assetId: string;
  range: string;
  candles: MarketCandle[];
  status: "ok" | "unavailable" | "error";
  error: string | null;
  errorCode: string | null;
  fetchedAt: string;
  periodChangePercent: number | null;
};

export interface MarketDataProviderInterface {
  readonly name: MarketProviderName;
  fetchQuotes(assetIds: string[]): Promise<MarketQuotesResponse>;
  fetchHistory(assetId: string, range: string): Promise<MarketHistoryResponse>;
}

/** @deprecated Use MarketQuote — kept for gradual migration in tests. */
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

/** @deprecated Use MarketCandle — kept for chart compatibility layer. */
export type HistoricalPoint = {
  date: string;
  value: number;
  timestamp?: string;
};
