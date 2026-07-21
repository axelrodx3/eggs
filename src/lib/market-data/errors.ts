export type MarketDataErrorCode =
  | "missing_api_key"
  | "rate_limit"
  | "provider_unavailable"
  | "symbol_unavailable"
  | "invalid_response"
  | "timeout"
  | "historical_unavailable"
  | "unsupported_asset"
  | "unsupported_range";

export class MarketDataError extends Error {
  readonly code: MarketDataErrorCode;
  readonly assetId?: string;
  readonly retryAfterMs?: number;

  constructor(
    code: MarketDataErrorCode,
    message: string,
    options?: { assetId?: string; retryAfterMs?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "MarketDataError";
    this.code = code;
    this.assetId = options?.assetId;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export function normalizeClientError(error: unknown): {
  code: MarketDataErrorCode;
  message: string;
} {
  if (error instanceof MarketDataError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: "provider_unavailable", message: error.message };
  }
  return { code: "provider_unavailable", message: "Market data unavailable." };
}
