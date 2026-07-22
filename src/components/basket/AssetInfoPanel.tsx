"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { BasketAsset } from "@/data/assets";
import { getRobinhoodStockUrl } from "@/data/assets";
import type { MarketQuote } from "@/lib/market-data/types";
import type { ChartRange } from "@/lib/market-data/config";
import { CHART_RANGE_ALLOWLIST } from "@/lib/market-data/config";
import { AssetLogo } from "@/components/assets/AssetLogo";
import { MiniChart } from "@/components/market/MiniChart";
import { useMarketHistory } from "@/hooks/useMarketQuotes";
import { getDataStateLabel } from "@/lib/market-data/normalize";
import {
  buildUpdatedLabel,
  getDataStateDisplay,
} from "@/lib/market-data/labels";
import {
  cn,
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatVolume,
} from "@/lib/utils";

type AssetInfoPanelProps = {
  asset: BasketAsset;
  quote: MarketQuote | null;
  loading: boolean;
  isDevelopmentMock: boolean;
  onClose?: () => void;
  mobile?: boolean;
};

export function AssetInfoPanel({
  asset,
  quote,
  loading,
  isDevelopmentMock,
  onClose,
  mobile = false,
}: AssetInfoPanelProps) {
  const reducedMotion = useReducedMotion();
  const [range, setRange] = useState<ChartRange>("1M");
  const positive = (quote?.change ?? 0) >= 0;
  const typeLabel = asset.isPrivate
    ? "Private Company"
    : asset.assetType === "index"
      ? "Index"
      : asset.sector;

  const { chartPoints, loading: historyLoading, periodChangePercent, isSyntheticHistory } =
    useMarketHistory(asset.isPrivate ? null : asset.id, range, !asset.isPrivate);

  const dataLabel = quote ? getDataStateDisplay(getDataStateLabel(quote)) : null;
  const updatedLabel = buildUpdatedLabel(quote, quote?.providerTimestamp ?? null, quote?.isStale ?? false);
  const robinhoodUrl = getRobinhoodStockUrl(asset);

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={asset.id}
        id="asset-info-panel"
        initial={reducedMotion ? false : { opacity: 0, y: mobile ? 16 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: mobile ? 16 : 10 }}
        transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
        className={cn(
          "glass-panel relative flex h-full flex-col border-border/90 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-6",
          mobile && "rounded-t-3xl border-b-0",
        )}
        aria-live="polite"
      >
        {mobile && onClose ? (
          <button
            type="button"
            className="focus-ring absolute right-4 top-4 rounded-full border border-border p-2"
            aria-label="Close asset panel"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <div className="mx-auto shrink-0 rounded-2xl border border-border/80 bg-black/20 p-2">
          <AssetLogo
            src={asset.logoPath}
            alt={asset.name}
            size={64}
            fallbackText={asset.displayTicker ?? "SPX"}
            containerClassName="rounded-xl"
          />
        </div>

        <div className="mt-5 space-y-1 border-b border-border/70 pb-4 text-center lg:text-left">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {typeLabel}
          </p>
          <h3 className="text-2xl font-semibold leading-tight">{asset.name}</h3>
          <p className="text-sm text-muted">
            {asset.isPrivate
              ? "Private Company · No public ticker"
              : asset.displayTicker}
          </p>
        </div>

        {asset.isPrivate ? (
          <div className="mt-5 space-y-5">
            <p className="text-sm leading-relaxed text-foreground/80">
              {asset.description}
            </p>
            <p className="rounded-xl border border-border bg-black/30 p-4 text-sm text-muted">
              Live market pricing and ticker data are unavailable for private
              companies. SpaceX is included as a thematic representation only.
            </p>
            <a
              href={asset.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 text-sm text-lime"
            >
              Official site
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {isDevelopmentMock ? (
              <p className="inline-flex rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-medium text-lime">
                Development mock data
              </p>
            ) : null}

            {loading ? (
              <div className="space-y-3">
                <div className="h-8 w-32 animate-pulse rounded bg-surface" />
                <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              </div>
            ) : quote?.unavailable ? (
              <p className="rounded-xl border border-border bg-black/30 p-4 text-sm text-muted">
                {quote.unavailableReason ?? "Market data unavailable."}
              </p>
            ) : quote?.price !== null && quote?.price !== undefined ? (
              <>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-3xl font-semibold tracking-tight">
                      {formatPrice(quote.price, quote.currency, quote.assetType)}
                    </p>
                    {dataLabel ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                        {dataLabel}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-sm font-medium",
                      positive ? "text-lime" : "text-danger",
                    )}
                  >
                    {formatChange(quote.change)} (
                    {formatPercent(quote.changePercent)})
                  </p>
                  {updatedLabel ? (
                    <p className="mt-1 text-[11px] text-muted">{updatedLabel}</p>
                  ) : null}
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <Stat label="Open" value={formatPrice(quote.open, quote.currency, quote.assetType)} />
                  <Stat label="Previous close" value={formatPrice(quote.previousClose, quote.currency, quote.assetType)} />
                  <Stat label="Day high" value={formatPrice(quote.high, quote.currency, quote.assetType)} />
                  <Stat label="Day low" value={formatPrice(quote.low, quote.currency, quote.assetType)} />
                  <Stat label="Volume" value={formatVolume(quote.volume)} />
                  {asset.assetType === "equity" ? (
                    <Stat label="Market cap" value={formatMarketCap(quote.marketCap)} />
                  ) : (
                    <Stat label="Type" value="Index" />
                  )}
                  {quote.exchange ? (
                    <Stat label="Exchange" value={quote.exchange} />
                  ) : null}
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">Market data unavailable.</p>
            )}

            <p className="text-sm leading-relaxed text-foreground/80">
              {asset.description}
            </p>

            {!asset.isPrivate ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {CHART_RANGE_ALLOWLIST.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "focus-ring rounded-full border px-3 py-1 text-xs transition duration-200 ease-out",
                        range === item
                          ? "border-lime/50 bg-lime/10 text-lime"
                          : "border-border text-muted hover:border-lime/30",
                      )}
                      onClick={() => setRange(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <MiniChart
                  data={chartPoints}
                  loading={historyLoading}
                  positive={(periodChangePercent ?? quote?.changePercent ?? 0) >= 0}
                  assetTicker={asset.displayTicker ?? asset.id.toUpperCase()}
                  periodChangePercent={periodChangePercent}
                  range={range}
                  synthetic={isSyntheticHistory}
                />
              </>
            ) : null}

            {robinhoodUrl ? (
              <a
                href={robinhoodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center gap-2 text-sm text-lime"
              >
                View on Robinhood
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        )}

        {mobile ? (
          <button
            type="button"
            className="focus-ring mt-5 inline-flex w-full justify-center rounded-full border border-border px-4 py-2.5 text-sm transition hover:border-lime/40 hover:text-lime"
            onClick={() => {
              onClose?.();
              document
                .getElementById("basket")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Return to Basket
          </button>
        ) : (
          <button
            type="button"
            className="focus-ring mt-5 inline-flex w-fit rounded-full border border-border px-4 py-2 text-sm transition hover:border-lime/40 hover:text-lime"
            onClick={onClose}
          >
            Return to Basket
          </button>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-black/20 px-3 py-2.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
