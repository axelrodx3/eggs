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
import { formatPrice } from "@/lib/utils";

export function MiniChart({
  data,
  positive,
}: {
  data: HistoricalPoint[];
  positive: boolean;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-border text-sm text-muted">
        Chart unavailable
      </div>
    );
  }

  const stroke = positive ? "#c7f000" : "#ff5c5c";
  const fill = positive ? "rgba(199,240,0,0.18)" : "rgba(255,92,92,0.12)";

  return (
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
            type="monotone"
            dataKey="value"
            stroke={stroke}
            fill="url(#chartFill)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
