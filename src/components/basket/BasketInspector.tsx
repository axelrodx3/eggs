"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useSearchParams } from "next/navigation";
import { basketAssets, basketFocusOrder } from "@/data/assets";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { AssetInfoPanel } from "@/components/basket/AssetInfoPanel";
import { BasketHotspot } from "@/components/basket/BasketHotspot";
import { BasketVisual } from "@/components/basket/BasketVisual";
import {
  isHotspotDebugEnabled,
  logHotspotCalibration,
} from "@/lib/basket-hotspot-debug";

export function BasketInspector() {
  const searchParams = useSearchParams();
  const { selectedId, selectedAsset, selectAsset } = useAssetSelection();
  const { quotesByAssetId, loading, isDevelopmentMock } = useMarketQuotes();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

  const debugMode = isHotspotDebugEnabled(searchParams);
  const quote = quotesByAssetId[selectedAsset.id] ?? null;

  const handleSelect = useCallback(
    (id: string) => {
      selectAsset(id);
      setMobilePanelOpen(true);
      if (window.innerWidth < 1024) {
        const panel = document.getElementById("asset-info-panel");
        if (panel) {
          const rect = panel.getBoundingClientRect();
          const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!inView) {
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
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

  const handleDebugStageClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!debugMode || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    logHotspotCalibration(xPercent, yPercent, hoveredId ?? selectedId);
  };

  return (
    <section id="basket" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">Interactive inspector</p>
        <h2 className="section-title">Explore the Basket</h2>
        <p className="mt-4 max-w-2xl text-foreground/75">
          Click an egg to explore the basket.
        </p>

        {debugMode ? (
          <p className="mt-2 rounded-lg border border-lime/30 bg-lime/5 px-3 py-2 text-xs text-lime">
            Hotspot debug enabled · hovered: {hoveredId ?? "—"} · selected:{" "}
            {selectedId}
          </p>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
          <div className="min-w-0">
            <div className="inspector-stage relative px-1 py-2 sm:px-2">
              <div className="basket-viewport relative mx-auto w-full max-w-5xl overflow-visible">
                <div
                  ref={stageRef}
                  className="relative"
                  onClick={handleDebugStageClick}
                >
                  <BasketVisual
                    variant="inspector"
                    floating={false}
                    tilt={false}
                    interactive
                  >
                    <div className="basket-hotspot-layer absolute inset-0">
                      {basketFocusOrder.map((assetId) => {
                        const asset = basketAssets.find((item) => item.id === assetId);
                        if (!asset) return null;
                        const hovered = hoveredId === asset.id;
                        const selected = selectedId === asset.id;
                        return (
                          <BasketHotspot
                            key={asset.id}
                            asset={asset}
                            selected={selected}
                            hovered={hovered}
                            debugMode={debugMode}
                            tabIndex={basketFocusOrder.indexOf(asset.id) + 1}
                            onSelect={() => handleSelect(asset.id)}
                            onHover={() => setHoveredId(asset.id)}
                            onLeave={() =>
                              setHoveredId((current) =>
                                current === asset.id ? null : current,
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </BasketVisual>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:sticky lg:top-24 lg:max-w-lg lg:justify-self-end">
            <AssetInfoPanel
              asset={selectedAsset}
              quote={quote}
              loading={loading}
              isDevelopmentMock={isDevelopmentMock}
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
            loading={loading}
            isDevelopmentMock={isDevelopmentMock}
            mobile
            onClose={() => setMobilePanelOpen(false)}
          />
        </div>
      </div>
    </section>
  );
}
