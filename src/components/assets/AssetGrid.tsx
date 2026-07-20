"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { basketAssets } from "@/data/assets";
import { useMarketData } from "@/hooks/useMarketData";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { cn, formatPercent } from "@/lib/utils";

export function AssetCard({
  asset,
  index,
}: {
  asset: (typeof basketAssets)[number];
  index: number;
}) {
  const { selectAsset, selectedId } = useAssetSelection();
  const { data } = useMarketData();
  const quote =
    asset.marketDataSymbol && data?.quotes
      ? data.quotes[asset.marketDataSymbol]
      : null;
  const positive = (quote?.changePercent ?? 0) >= 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={cn(
        "focus-ring group relative flex min-h-[220px] flex-col items-center rounded-[2rem] border bg-surface-elevated p-5 text-center transition hover:-translate-y-1 hover:border-lime/40",
        selectedId === asset.id ? "border-lime lime-glow" : "border-border",
      )}
      onClick={() => selectAsset(asset.id, { scrollToInspector: true })}
      aria-label={`${asset.name}${asset.ticker ? `, ${asset.ticker}` : ", private company"}`}
    >
      <div className="absolute inset-x-8 top-3 h-16 rounded-[999px] bg-[radial-gradient(circle_at_50%_0%,rgba(199,240,0,0.12),transparent_70%)]" />
      <div className="relative mt-4 h-16 w-16 overflow-hidden rounded-2xl border border-border bg-black/30">
        <Image src={asset.logoPath} alt="" fill className="object-contain p-2" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{asset.name}</h3>
      <p className="text-sm text-muted">
        {asset.ticker ?? "Private Company"} · {asset.type === "index" ? "Index" : asset.sector}
      </p>
      {asset.isPrivate ? (
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
          Private Company
        </p>
      ) : quote ? (
        <p
          className={cn(
            "mt-3 text-sm font-medium",
            positive ? "text-lime" : "text-danger",
          )}
        >
          {formatPercent(quote.changePercent)}
          {data?.source === "demo" ? " · Demo" : ""}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">—</p>
      )}
    </motion.button>
  );
}

export function AssetGrid() {
  return (
    <section className="py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">Ten assets</p>
        <h2 className="section-title">Basket Asset Grid</h2>
        <p className="mt-4 max-w-2xl text-foreground/75">
          Every egg in the basket—select a card to jump back to the inspector.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {basketAssets.map((asset, index) => (
            <AssetCard key={asset.id} asset={asset} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
