"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoricalPoint } from "@/lib/market-data/types";
import { formatPercent, formatPrice } from "@/lib/utils";

export function MiniChart({
  data,
  positive,
  loading = false,
  assetTicker = "",
  periodChangePercent = null,
  range = "1M",
  synthetic = false,
}: {
  data: HistoricalPoint[];
  positive: boolean;
  loading?: boolean;
  assetTicker?: string;
  periodChangePercent?: number | null;
  range?: string;
  synthetic?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-border text-sm text-muted">
        Loading chart…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-border text-sm text-muted">
        Chart unavailable
      </div>
    );
  }

  const stroke = positive ? "#c7f000" : "#ff5c5c";
  const fill = positive ? "rgba(199,240,0,0.18)" : "rgba(255,92,92,0.12)";
  const summary =
    periodChangePercent !== null && assetTicker
      ? `${assetTicker} ${periodChangePercent >= 0 ? "gained" : "lost"} ${formatPercent(Math.abs(periodChangePercent)).replace("+", "")} during the displayed ${range} period.`
      : null;

  return (
    <div className="space-y-2">
      {summary ? (
        <p className="sr-only">{summary}</p>
      ) : null}
      <div className="h-36 w-full rounded-xl border border-border bg-black/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fill} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              contentStyle={{
                background: "#111",
                border: "1px solid #1c1c1c",
                borderRadius: 12,
                color: "#fff",
              }}
              formatter={(value) => formatPrice(Number(value))}
            />
            <Area
              type="linear"
              dataKey="value"
              stroke={stroke}
              fill="url(#chartFill)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {summary ? (
        <p className="text-xs text-muted" aria-hidden="true">
          {summary}
        </p>
      ) : null}
      {synthetic ? (
        <p className="text-[11px] text-muted">
          Approximate trend from live quote (not full historical data).
        </p>
      ) : null}
    </div>
  );
}
