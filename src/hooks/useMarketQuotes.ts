"use client";

export { useMarketQuotes } from "@/providers/MarketQuotesProvider";

/** @deprecated Use useMarketQuotes */
export { useMarketQuotes as useMarketData } from "@/providers/MarketQuotesProvider";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChartRange } from "@/lib/market-data/config";
import type { MarketHistoryResponse } from "@/lib/market-data/types";
import { candlesToChartPoints } from "@/lib/market-data/normalize";

const historyInflight = new Map<string, Promise<MarketHistoryResponse>>();

async function fetchHistory(
  assetId: string,
  range: ChartRange,
): Promise<MarketHistoryResponse> {
  const key = `${assetId}:${range}`;
  const existing = historyInflight.get(key);
  if (existing) return existing;

  const promise = fetch(
    `/api/market/history?asset=${encodeURIComponent(assetId)}&range=${range}`,
    { cache: "no-store" },
  )
    .then(async (response) => {
      if (!response.ok) throw new Error("History request failed");
      return (await response.json()) as MarketHistoryResponse;
    })
    .finally(() => {
      historyInflight.delete(key);
    });

  historyInflight.set(key, promise);
  return promise;
}

export function useMarketHistory(
  assetId: string | null,
  range: ChartRange = "1M",
  enabled = true,
) {
  const [data, setData] = useState<MarketHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!assetId || !enabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const payload = await fetchHistory(assetId, range);
      if (!controller.signal.aborted) setData(payload);
    } catch {
      if (!controller.signal.aborted) {
        setData({
          assetId,
          range,
          candles: [],
          status: "error",
          error: "Chart unavailable.",
          errorCode: "historical_unavailable",
          fetchedAt: new Date().toISOString(),
          periodChangePercent: null,
        });
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [assetId, enabled, range]);

  useEffect(() => {
    if (!assetId || !enabled) return;

    let cancelled = false;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    fetchHistory(assetId, range)
      .then((payload) => {
        if (!cancelled && !controller.signal.aborted) setData(payload);
      })
      .catch(() => {
        if (!cancelled && !controller.signal.aborted) {
          setData({
            assetId,
            range,
            candles: [],
            status: "error",
            error: "Chart unavailable.",
            errorCode: "historical_unavailable",
            fetchedAt: new Date().toISOString(),
            periodChangePercent: null,
          });
        }
      })
      .finally(() => {
        if (!cancelled && !controller.signal.aborted) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assetId, enabled, range]);

  const chartPoints =
    !assetId || !enabled || !data?.candles || data.candles.length === 0
      ? []
      : candlesToChartPoints(data.candles);

  return {
    data,
    chartPoints,
    loading,
    refresh,
    periodChangePercent: data?.periodChangePercent ?? null,
    isSyntheticHistory: data?.isSyntheticHistory ?? false,
  };
}
