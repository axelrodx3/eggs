"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getClientRefreshIntervalMs, MARKET_REFRESH_CONFIG } from "@/lib/market-data/config";
import type { MarketQuotesResponse } from "@/lib/market-data/types";

type MarketQuotesContextValue = {
  quotesByAssetId: MarketQuotesResponse["quotesByAssetId"];
  status: MarketQuotesResponse["status"];
  lastUpdated: string | null;
  marketState: MarketQuotesResponse["marketState"];
  isStale: boolean;
  isDevelopmentMock: boolean;
  error: string | null;
  errorCode: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const MarketQuotesContext = createContext<MarketQuotesContextValue | null>(null);

let sharedInflight: Promise<MarketQuotesResponse> | null = null;

async function fetchQuotes(): Promise<MarketQuotesResponse> {
  if (sharedInflight) return sharedInflight;
  sharedInflight = fetch("/api/market/quotes", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Market quotes request failed");
      }
      return (await response.json()) as MarketQuotesResponse;
    })
    .finally(() => {
      sharedInflight = null;
    });
  return sharedInflight;
}

const EMPTY: MarketQuotesContextValue = {
  quotesByAssetId: {},
  status: "error",
  lastUpdated: null,
  marketState: "unknown",
  isStale: true,
  isDevelopmentMock: false,
  error: "Unable to load market data.",
  errorCode: "provider_unavailable",
  loading: false,
  refresh: async () => {},
};

export function MarketQuotesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MarketQuotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  const applyPayload = useCallback((payload: MarketQuotesResponse) => {
    const age = payload.fetchedAt
      ? Date.now() - new Date(payload.fetchedAt).getTime()
      : Infinity;
    setData({
      ...payload,
      isStale: payload.isStale || age > MARKET_REFRESH_CONFIG.staleAfterMs,
    });
  }, []);

  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (!hasLoadedRef.current) setLoading(true);

    try {
      const payload = await fetchQuotes();
      if (!controller.signal.aborted) {
        applyPayload(payload);
        hasLoadedRef.current = true;
      }
    } catch {
      if (!controller.signal.aborted) {
        setData((current) =>
          current
            ? { ...current, isStale: true, error: "Refresh failed." }
            : {
                quotesByAssetId: {},
                status: "error",
                provider: null,
                marketState: "unknown",
                lastUpdated: null,
                fetchedAt: new Date().toISOString(),
                isStale: true,
                error: "Unable to load market data.",
                errorCode: "provider_unavailable",
                isDevelopmentMock: false,
              },
        );
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [applyPayload]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const payload = await fetchQuotes();
        if (!cancelled && !controller.signal.aborted) {
          applyPayload(payload);
          hasLoadedRef.current = true;
        }
      } catch {
        if (!cancelled && !controller.signal.aborted) {
          setData((current) =>
            current
              ? { ...current, isStale: true, error: "Refresh failed." }
              : {
                  quotesByAssetId: {},
                  status: "error",
                  provider: null,
                  marketState: "unknown",
                  lastUpdated: null,
                  fetchedAt: new Date().toISOString(),
                  isStale: true,
                  error: "Unable to load market data.",
                  errorCode: "provider_unavailable",
                  isDevelopmentMock: false,
                },
          );
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyPayload]);

  useEffect(() => {
    const marketState = data?.marketState ?? "unknown";
    const intervalMs = getClientRefreshIntervalMs(marketState);

    const tick = () => {
      if (document.hidden) return;
      void refresh();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [data?.marketState, refresh]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }
      const hiddenAt = hiddenAtRef.current;
      if (
        hiddenAt &&
        Date.now() - hiddenAt > MARKET_REFRESH_CONFIG.staleAfterMs
      ) {
        void refresh();
      }
      hiddenAtRef.current = null;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refresh]);

  const value = useMemo<MarketQuotesContextValue>(
    () => ({
      quotesByAssetId: data?.quotesByAssetId ?? {},
      status: data?.status ?? "error",
      lastUpdated: data?.lastUpdated ?? null,
      marketState: data?.marketState ?? "unknown",
      isStale: data?.isStale ?? false,
      isDevelopmentMock: data?.isDevelopmentMock ?? false,
      error: data?.error ?? null,
      errorCode: data?.errorCode ?? null,
      loading,
      refresh,
    }),
    [data, loading, refresh],
  );

  return (
    <MarketQuotesContext.Provider value={value}>
      {children}
    </MarketQuotesContext.Provider>
  );
}

export function useMarketQuotes(): MarketQuotesContextValue {
  const ctx = useContext(MarketQuotesContext);
  if (!ctx) return EMPTY;
  return ctx;
}
