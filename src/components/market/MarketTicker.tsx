"use client";

import Image from "next/image";
import { basketAssets } from "@/data/assets";
import { useMarketData } from "@/hooks/useMarketData";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

export function MarketTicker() {
  const { data, loading } = useMarketData();
  const { selectAsset } = useAssetSelection();

  const publicItems = basketAssets.filter((asset) => !asset.isPrivate);
  const spacex = basketAssets.find((asset) => asset.id === "spacex");

  const renderItem = (asset: (typeof basketAssets)[number], keySuffix = "") => {
    const symbol = asset.marketDataSymbol;
    const quote = symbol && data?.quotes ? data.quotes[symbol] : null;
    const positive = (quote?.changePercent ?? 0) >= 0;

    return (
      <button
        key={`${asset.id}${keySuffix}`}
        type="button"
        className="focus-ring inline-flex min-w-[220px] items-center gap-3 rounded-2xl border border-border bg-surface-elevated/80 px-4 py-3 text-left transition hover:border-lime/40"
        onClick={() => selectAsset(asset.id, { scrollToInspector: true })}
      >
        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-border bg-black/30">
          <Image src={asset.logoPath} alt="" fill className="object-contain p-1.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{asset.ticker ?? asset.name}</span>
            {data?.source === "demo" ? (
              <span className="rounded-full bg-lime/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-lime">
                Demo
              </span>
            ) : null}
          </div>
          {quote ? (
            <div className="mt-0.5 flex items-center gap-2 text-sm">
              <span>{formatPrice(quote.price, quote.currency)}</span>
              <span className={positive ? "text-lime" : "text-danger"}>
                {formatPercent(quote.changePercent)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted">
              {loading ? "Loading…" : "Unavailable"}
            </span>
          )}
        </div>
      </button>
    );
  };

  const duplicated = [...publicItems, ...publicItems];

  return (
    <section id="market" className="scroll-mt-24 border-y border-border py-10">
      <div className="section-shell mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Live market watch</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Market Strip
          </h2>
        </div>
        {data?.source === "demo" ? (
          <p className="text-xs text-muted">Demo data in development</p>
        ) : null}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:w-16" />
        <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className={cn("flex w-max gap-3 px-4 sm:px-6 lg:px-8 ticker-track")}>
            {duplicated.map((asset, index) => renderItem(asset, `-${index}`))}
          </div>
        </div>
      </div>

      {spacex ? (
        <div className="section-shell mt-4">
          <button
            type="button"
            className="focus-ring inline-flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition hover:border-lime/40 sm:w-auto"
            onClick={() => selectAsset(spacex.id, { scrollToInspector: true })}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-border bg-black/30">
              <Image
                src={spacex.logoPath}
                alt=""
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div>
              <p className="font-semibold">SpaceX</p>
              <p className="text-sm text-muted">Private Company · No live pricing</p>
            </div>
          </button>
        </div>
      ) : null}
    </section>
  );
}
