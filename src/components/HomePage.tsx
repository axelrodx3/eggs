"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { basketAssetById, basketAssetByTicker, defaultSelectedAssetId } from "@/data/assets";
import { AssetSelectionProvider } from "@/providers/AssetSelectionProvider";
import { MarketQuotesProvider } from "@/providers/MarketQuotesProvider";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { HeroSection } from "@/components/hero/HeroSection";
import { BasketInspector } from "@/components/basket/BasketInspector";
import { MarketTicker } from "@/components/market/MarketTicker";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { TokenomicsSection } from "@/components/tokenomics/TokenomicsSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { SectionReveal } from "@/components/layout/SectionReveal";
import { SiteFooter } from "@/components/footer/SiteFooter";

function resolveInitialAsset(search: string | null) {
  if (!search) return defaultSelectedAssetId;
  const byTicker = basketAssetByTicker[search.toUpperCase()];
  if (!byTicker) return defaultSelectedAssetId;
  // Open with live equity data by default — indexes are unavailable on the free plan.
  if (byTicker.assetType === "index") return defaultSelectedAssetId;
  return byTicker.id;
}

function syncDefaultAssetUrl(assetParam: string | null) {
  if (typeof window === "undefined") return;
  const resolvedId = resolveInitialAsset(assetParam);
  const resolvedTicker =
    basketAssetById[defaultSelectedAssetId]?.displayTicker ??
    defaultSelectedAssetId.toUpperCase();
  const params = new URLSearchParams(window.location.search);
  const current = params.get("asset")?.toUpperCase() ?? null;

  if (!assetParam) {
    if (current !== resolvedTicker) {
      params.set("asset", resolvedTicker);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
    return;
  }

  if (resolvedId === defaultSelectedAssetId && current !== resolvedTicker) {
    params.set("asset", resolvedTicker);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const assetParam = searchParams.get("asset");
  const initialAssetId = resolveInitialAsset(assetParam);

  useEffect(() => {
    syncDefaultAssetUrl(assetParam);
  }, [assetParam]);

  useEffect(() => {
    if (!assetParam) return;
    const id = resolveInitialAsset(assetParam);
    if (id !== defaultSelectedAssetId) {
      document.getElementById("basket")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [assetParam]);

  return (
    <AssetSelectionProvider initialAssetId={initialAssetId}>
      <MarketQuotesProvider>
        <SiteNavigation />
        <main>
          <HeroSection />
          <SectionReveal>
            <BasketInspector />
          </SectionReveal>
          <SectionReveal>
            <MarketTicker />
          </SectionReveal>
          <SectionReveal>
            <AssetGrid />
          </SectionReveal>
          <SectionReveal>
            <TokenomicsSection />
          </SectionReveal>
          <SectionReveal>
            <FaqSection />
          </SectionReveal>
        </main>
        <SiteFooter />
      </MarketQuotesProvider>
    </AssetSelectionProvider>
  );
}

export function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomePageInner />
    </Suspense>
  );
}
