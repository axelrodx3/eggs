"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { basketAssetByTicker, defaultSelectedAssetId } from "@/data/assets";
import { AssetSelectionProvider } from "@/providers/AssetSelectionProvider";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { HeroSection } from "@/components/hero/HeroSection";
import { BasketInspector } from "@/components/basket/BasketInspector";
import { MarketTicker } from "@/components/market/MarketTicker";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { HowToBuySection } from "@/components/how-to-buy/HowToBuySection";
import { TokenomicsSection } from "@/components/tokenomics/TokenomicsSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { SiteFooter } from "@/components/footer/SiteFooter";

function resolveInitialAsset(search: string | null) {
  if (!search) return defaultSelectedAssetId;
  const byTicker = basketAssetByTicker[search.toUpperCase()];
  if (byTicker) return byTicker.id;
  return defaultSelectedAssetId;
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const assetParam = searchParams.get("asset");
  const initialAssetId = resolveInitialAsset(assetParam);

  useEffect(() => {
    if (!assetParam) return;
    const id = resolveInitialAsset(assetParam);
    if (id !== defaultSelectedAssetId) {
      document.getElementById("basket")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [assetParam]);

  return (
    <AssetSelectionProvider initialAssetId={initialAssetId}>
      <SiteNavigation />
      <main>
        <HeroSection />
        <BasketInspector />
        <MarketTicker />
        <AssetGrid />
        <HowToBuySection />
        <TokenomicsSection />
        <FaqSection />
      </main>
      <SiteFooter />
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
