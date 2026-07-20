"use client";

import Image from "next/image";
import { basketAssets } from "@/data/assets";
import { useMarketData } from "@/hooks/useMarketData";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

export function MarketTicker() {
  const { data, loading } = useMarketData();
  const { selectAsset, selectedId } = useAssetSelection();

  const publicItems = basketAssets.filter((asset) => !asset.isPrivate);
  const spacex = basketAssets.find((asset) => asset.id === "spacex");

  const renderItem = (asset: (typeof basketAssets)[number], keySuffix = "") => {
    const symbol = asset.marketDataSymbol;
    const quote = symbol && data?.quotes ? data.quotes[symbol] : null;
    const positive = (quote?.changePercent ?? 0) >= 0;
    const selected = selectedId === asset.id;

    return (
      <button
        key={`${asset.id}${keySuffix}`}
        type="button"
        className={cn(
          "focus-ring inline-flex min-w-[168px] shrink-0 items-center gap-2.5 rounded-xl border bg-surface-elevated/70 px-3 py-2 text-left transition",
          selected
            ? "border-lime/50 bg-lime/5"
            : "border-border/80 hover:border-lime/35",
        )}
        onClick={() => selectAsset(asset.id, { scrollToInspector: true })}
      >
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-black/30">
          <Image src={asset.logoPath} alt="" fill className="object-contain p-1" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">{asset.ticker}</span>
            {data?.source === "demo" ? (
              <span className="rounded bg-lime/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-lime">
                Demo
              </span>
            ) : null}
          </div>
          {quote ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs">
              <span className="text-foreground/85">
                {formatPrice(quote.price, quote.currency)}
              </span>
              <span className={positive ? "text-lime" : "text-danger"}>
                {formatPercent(quote.changePercent)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted">
              {loading ? "Loading…" : "—"}
            </span>
          )}
        </div>
      </button>
    );
  };

  const duplicated = [...publicItems, ...publicItems];

  return (
    <section id="market" className="scroll-mt-24 border-y border-border py-8 sm:py-10">
      <div className="section-shell mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Live market watch</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Market Strip
          </h2>
        </div>
        {data?.source === "demo" ? (
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Demo data in development
          </p>
        ) : null}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:w-12" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent sm:w-12" />
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className={cn("flex w-max gap-2 px-4 sm:gap-2.5 sm:px-6 lg:px-8 ticker-track")}>
            {duplicated.map((asset, index) => renderItem(asset, `-${index}`))}
          </div>
        </div>
      </div>

      {spacex ? (
        <div className="section-shell mt-3">
          <button
            type="button"
            className={cn(
              "focus-ring inline-flex w-full items-center gap-2.5 rounded-xl border bg-surface px-3 py-2 text-left transition sm:w-auto",
              selectedId === spacex.id
                ? "border-lime/50"
                : "border-border hover:border-lime/35",
            )}
            onClick={() => selectAsset(spacex.id, { scrollToInspector: true })}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-border bg-black/30">
              <Image
                src={spacex.logoPath}
                alt=""
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">SpaceX</p>
              <p className="text-xs text-muted">Private Company · No live pricing</p>
            </div>
          </button>
        </div>
      ) : null}
    </section>
  );
}
