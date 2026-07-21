"use client";

import { basketAssets } from "@/data/assets";
import { AssetLogo } from "@/components/assets/AssetLogo";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { getDataStateLabel } from "@/lib/market-data/normalize";
import {
  buildStripUpdatedLabel,
  getDataStateDisplay,
} from "@/lib/market-data/labels";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

export function MarketTicker() {
  const {
    quotesByAssetId,
    loading,
    lastUpdated,
    isStale,
    isDevelopmentMock,
    status,
  } = useMarketQuotes();
  const { selectAsset, selectedId } = useAssetSelection();

  const publicItems = basketAssets.filter((asset) => !asset.isPrivate);
  const updatedLabel = buildStripUpdatedLabel(lastUpdated, isStale);

  const renderItem = (asset: (typeof basketAssets)[number], keySuffix = "") => {
    const quote = quotesByAssetId[asset.id] ?? null;
    const positive = (quote?.changePercent ?? 0) >= 0;
    const selected = selectedId === asset.id;
    const dataLabel = quote ? getDataStateDisplay(getDataStateLabel(quote)) : null;

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
        <AssetLogo
          src={asset.logoPath}
          alt={asset.name}
          size={32}
          fallbackText={asset.displayTicker ?? "SPX"}
          containerClassName="rounded-lg"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">{asset.displayTicker}</span>
            {dataLabel ? (
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted">
                {dataLabel}
              </span>
            ) : null}
          </div>
          {quote?.unavailable ? (
            <span className="text-xs text-muted">
              {quote.unavailableReason ?? "Unavailable"}
            </span>
          ) : quote?.price !== null && quote?.price !== undefined ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs">
              <span className="text-foreground/85">
                {formatPrice(quote.price, quote.currency, quote.assetType)}
              </span>
              <span className={positive ? "text-lime" : "text-danger"}>
                {formatPercent(quote.changePercent)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted">
              {loading ? "Loading…" : status === "setup_required" ? "Setup required" : "—"}
            </span>
          )}
        </div>
      </button>
    );
  };

  const duplicated = [...publicItems, ...publicItems];

  return (
    <section id="market" className="scroll-mt-24 border-y border-border py-8 sm:py-10">
      <div className="section-shell mb-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Live market watch</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Market Strip
          </h2>
          {updatedLabel ? (
            <p className="mt-1 text-[11px] text-muted">{updatedLabel}</p>
          ) : null}
        </div>
        {isDevelopmentMock ? (
          <p className="text-[11px] uppercase tracking-[0.14em] text-lime">
            Development mock data
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
    </section>
  );
}
