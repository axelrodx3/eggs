import { mockMarketProvider } from "./mock-provider";
import type { MarketDataProvider, QuoteBundle } from "./types";

function resolveProvider(): MarketDataProvider {
  const provider = process.env.MARKET_DATA_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return mockMarketProvider;
  }
}

export async function fetchMarketQuotes(
  symbols: string[],
): Promise<QuoteBundle> {
  const unique = [...new Set(symbols.filter(Boolean))];
  if (unique.length === 0) {
    return {
      quotes: {},
      history: {},
      source: "demo",
      stale: false,
      error: null,
    };
  }

  try {
    const provider = resolveProvider();
    return await provider.fetchQuotes(unique);
  } catch (error) {
    return {
      quotes: {},
      history: {},
      source: "demo",
      stale: true,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load market data.",
    };
  }
}
