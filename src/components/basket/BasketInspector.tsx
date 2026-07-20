"use client";

import { useCallback, useEffect, useState } from "react";
import { basketAssets } from "@/data/assets";
import { useMarketData } from "@/hooks/useMarketData";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { AssetInfoPanel } from "@/components/basket/AssetInfoPanel";
import { BasketControls } from "@/components/basket/BasketControls";
import { BasketHotspot } from "@/components/basket/BasketHotspot";
import { BasketVisual } from "@/components/basket/BasketVisual";

export function BasketInspector() {
  const { selectedId, selectedAsset, selectAsset } = useAssetSelection();
  const { data, loading } = useMarketData();
  const [inspectMode, setInspectMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);

  const quote =
    selectedAsset.marketDataSymbol && data?.quotes
      ? data.quotes[selectedAsset.marketDataSymbol]
      : null;
  const history =
    selectedAsset.marketDataSymbol && data?.history
      ? data.history[selectedAsset.marketDataSymbol] ?? []
      : [];

  const handleSelect = useCallback(
    (id: string) => {
      selectAsset(id);
      setMobilePanelOpen(true);
      if (window.innerWidth < 1024) {
        document
          .getElementById("asset-info-panel")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [selectAsset],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobilePanelOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onPan = (direction: "left" | "right" | "up" | "down") => {
    const delta = 12;
    setPan((current) => {
      switch (direction) {
        case "left":
          return { ...current, x: current.x + delta };
        case "right":
          return { ...current, x: current.x - delta };
        case "up":
          return { ...current, y: current.y + delta };
        case "down":
          return { ...current, y: current.y - delta };
        default:
          return current;
      }
    });
  };

  return (
    <section id="basket" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">Interactive inspector</p>
        <h2 className="section-title">Explore the Basket</h2>
        <p className="mt-4 max-w-2xl text-foreground/75">
          Select any egg to inspect its profile. Hotspots stay aligned to the
          basket artwork across screen sizes.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-surface/60 p-4 sm:p-6">
              <div
                className="relative mx-auto max-w-xl transition-transform duration-300"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                <BasketVisual floating={false} tilt={!inspectMode}>
                  {basketAssets.map((asset) => (
                    <BasketHotspot
                      key={asset.id}
                      asset={asset}
                      selected={selectedId === asset.id}
                      inspectMode={inspectMode}
                      onSelect={() => handleSelect(asset.id)}
                    />
                  ))}
                </BasketVisual>
              </div>
              <BasketControls
                inspectMode={inspectMode}
                zoom={zoom}
                onInspectToggle={() => setInspectMode((value) => !value)}
                onPan={onPan}
                onZoomIn={() => setZoom((value) => Math.min(value + 0.1, 1.5))}
                onZoomOut={() => setZoom((value) => Math.max(value - 0.1, 0.85))}
                onReset={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setInspectMode(false);
                }}
              />
            </div>
          </div>

          <div className="hidden lg:block lg:sticky lg:top-24">
            <AssetInfoPanel
              asset={selectedAsset}
              quote={quote}
              history={history}
              loading={loading}
              isDemo={data?.source === "demo" || quote?.isDemo === true}
              onClose={() =>
                document
                  .getElementById("basket")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            />
          </div>
        </div>

        <div
          className={`mt-6 lg:hidden ${mobilePanelOpen ? "block" : "hidden"}`}
        >
          <AssetInfoPanel
            asset={selectedAsset}
            quote={quote}
            history={history}
            loading={loading}
            isDemo={data?.source === "demo" || quote?.isDemo === true}
            mobile
            onClose={() => setMobilePanelOpen(false)}
          />
        </div>
      </div>
    </section>
  );
}
