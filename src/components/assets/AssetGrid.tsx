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
  const selected = selectedId === asset.id;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={cn(
        "focus-ring group relative flex min-h-[190px] flex-col items-center rounded-[1.75rem] border bg-surface-elevated px-4 py-5 text-center transition hover:-translate-y-0.5",
        selected
          ? "border-lime lime-glow"
          : "border-border hover:border-lime/40",
      )}
      onClick={() => selectAsset(asset.id, { scrollToInspector: true })}
      aria-label={`${asset.name}${asset.ticker ? `, ${asset.ticker}` : ", private company"}`}
      aria-pressed={selected}
    >
      <div className="egg-highlight absolute inset-x-6 top-2 h-20" aria-hidden />
      <div className="relative mt-2 h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl border border-border/80 bg-black/30">
        <Image src={asset.logoPath} alt="" fill className="object-contain p-2.5" />
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug">{asset.name}</h3>
      <p className="mt-1 text-xs text-muted">
        {asset.ticker ?? "Private Company"} ·{" "}
        {asset.type === "index" ? "Index" : asset.isPrivate ? "Private" : asset.sector}
      </p>
      {asset.isPrivate ? (
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">
          Private Company
        </p>
      ) : quote ? (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            positive ? "text-lime" : "text-danger",
          )}
        >
          {formatPercent(quote.changePercent)}
          {data?.source === "demo" ? " · Demo" : ""}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">—</p>
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
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {basketAssets.map((asset, index) => (
            <AssetCard key={asset.id} asset={asset} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
