"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuoteBundle } from "@/lib/market-data/types";

type MarketState = {
  data: QuoteBundle | null;
  loading: boolean;
};

async function loadMarketData(): Promise<QuoteBundle> {
  const response = await fetch("/api/market");
  if (!response.ok) throw new Error("Market request failed");
  return (await response.json()) as QuoteBundle;
}

const FALLBACK: QuoteBundle = {
  quotes: {},
  history: {},
  source: "demo",
  stale: true,
  error: "Unable to load market data.",
};

export function useMarketData() {
  const [state, setState] = useState<MarketState>({ data: null, loading: true });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const data = await loadMarketData();
      setState({ data, loading: false });
    } catch {
      setState({ data: FALLBACK, loading: false });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadMarketData()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ data: FALLBACK, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...state, refresh };
}
