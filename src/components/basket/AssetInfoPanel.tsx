"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { BasketAsset } from "@/data/assets";
import type { QuoteChange } from "@/lib/market-data/types";
import { AssetLogo } from "@/components/assets/AssetLogo";
import { MiniChart } from "@/components/market/MiniChart";
import {
  cn,
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
} from "@/lib/utils";

type AssetInfoPanelProps = {
  asset: BasketAsset;
  quote: QuoteChange | null;
  history: { date: string; value: number }[];
  loading: boolean;
  isDemo: boolean;
  onClose?: () => void;
  mobile?: boolean;
};

export function AssetInfoPanel({
  asset,
  quote,
  history,
  loading,
  isDemo,
  onClose,
  mobile = false,
}: AssetInfoPanelProps) {
  const positive = (quote?.change ?? 0) >= 0;
  const typeLabel = asset.isPrivate
    ? "Private Company"
    : asset.type === "index"
      ? "Index"
      : asset.sector;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={asset.id}
        id="asset-info-panel"
        initial={{ opacity: 0, y: mobile ? 24 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: mobile ? 24 : 12 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "glass-panel relative flex h-full flex-col p-5 sm:p-6",
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

        <div className="mx-auto shrink-0">
          <AssetLogo
            src={asset.logoPath}
            alt={asset.name}
            size={64}
            fallbackText={asset.ticker ?? "SPX"}
            containerClassName="rounded-2xl bg-black/40"
          />
        </div>

        <div className="mt-4 space-y-1 text-center lg:text-left">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {typeLabel}
          </p>
          <h3 className="text-2xl font-semibold leading-tight">{asset.name}</h3>
          <p className="text-sm text-muted">
            {asset.ticker ?? "Private Company"}
          </p>
        </div>

        {asset.isPrivate ? (
          <div className="mt-5 space-y-4">
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
          <div className="mt-5 space-y-4">
            {isDemo ? (
              <p className="inline-flex rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-medium text-lime">
                Demo data
              </p>
            ) : null}

            {loading ? (
              <div className="space-y-3">
                <div className="h-8 w-32 animate-pulse rounded bg-surface" />
                <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              </div>
            ) : quote ? (
              <>
                <div>
                  <p className="text-3xl font-semibold tracking-tight">
                    {formatPrice(quote.price, quote.currency)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-medium",
                      positive ? "text-lime" : "text-danger",
                    )}
                  >
                    {formatChange(quote.change)} (
                    {formatPercent(quote.changePercent)})
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-border/80 bg-black/20 px-3 py-2.5">
                    <dt className="text-xs text-muted">
                      {asset.type === "index" ? "Type" : "Sector"}
                    </dt>
                    <dd className="font-medium">{typeLabel}</dd>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-black/20 px-3 py-2.5">
                    <dt className="text-xs text-muted">Market cap</dt>
                    <dd className="font-medium">
                      {formatMarketCap(quote.marketCap)}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">Market data unavailable.</p>
            )}

            <p className="text-sm leading-relaxed text-foreground/80">
              {asset.description}
            </p>

            {!loading && quote ? (
              <MiniChart data={history} positive={positive} />
            ) : null}

            <a
              href={asset.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 text-sm text-lime"
            >
              External information
              <ExternalLink className="h-4 w-4" />
            </a>
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
