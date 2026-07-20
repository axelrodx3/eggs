"use client";

import { useCallback, useEffect, useState } from "react";
import { basketAssets, basketFocusOrder } from "@/data/assets";
import { useMarketData } from "@/hooks/useMarketData";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { AssetInfoPanel } from "@/components/basket/AssetInfoPanel";
import { BasketControls } from "@/components/basket/BasketControls";
import { BasketHotspot } from "@/components/basket/BasketHotspot";
import { BasketVisual } from "@/components/basket/BasketVisual";

const MIN_ZOOM = 0.9;
const MAX_ZOOM = 1.35;
const PAN_STEP = 10;
const MAX_PAN = 36;

function clampPan(x: number, y: number) {
  return {
    x: Math.max(-MAX_PAN, Math.min(MAX_PAN, x)),
    y: Math.max(-MAX_PAN, Math.min(MAX_PAN, y)),
  };
}

export function BasketInspector() {
  const { selectedId, selectedAsset, selectAsset } = useAssetSelection();
  const { data, loading } = useMarketData();
  const [inspectMode, setInspectMode] = useState(false);
  const [panMode, setPanMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [resetKey, setResetKey] = useState(0);
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
    setPan((current) => {
      const next = { ...current };
      switch (direction) {
        case "left":
          next.x += PAN_STEP;
          break;
        case "right":
          next.x -= PAN_STEP;
          break;
        case "up":
          next.y += PAN_STEP;
          break;
        case "down":
          next.y -= PAN_STEP;
          break;
      }
      return clampPan(next.x, next.y);
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setInspectMode(false);
    setPanMode(false);
    setResetKey((value) => value + 1);
  };

  return (
    <section id="basket" className="scroll-mt-24 py-16 sm:py-24">
      <div className="section-shell">
        <p className="section-kicker">Interactive inspector</p>
        <h2 className="section-title">Explore the Basket</h2>
        <p className="mt-4 max-w-2xl text-foreground/75">
          Click an egg to explore the basket.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="min-w-0">
            <div className="inspector-stage relative px-1 py-2 sm:px-2">
              <div
                className="relative mx-auto w-full max-w-4xl transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                <BasketVisual
                  variant="inspector"
                  floating={false}
                  tilt={!inspectMode && !panMode}
                  resetKey={resetKey}
                >
                  {basketFocusOrder.map((assetId) => {
                    const asset = basketAssets.find((item) => item.id === assetId);
                    if (!asset) return null;
                    return (
                      <BasketHotspot
                        key={asset.id}
                        asset={asset}
                        selected={selectedId === asset.id}
                        inspectMode={inspectMode}
                        tabIndex={basketFocusOrder.indexOf(asset.id) + 1}
                        onSelect={() => handleSelect(asset.id)}
                      />
                    );
                  })}
                </BasketVisual>
              </div>
              <BasketControls
                inspectMode={inspectMode}
                panMode={panMode}
                zoom={zoom}
                onInspectToggle={() => {
                  setInspectMode((value) => !value);
                  setPanMode(false);
                }}
                onPanToggle={() => {
                  setPanMode((value) => !value);
                  setInspectMode(false);
                }}
                onPan={onPan}
                onZoomIn={() =>
                  setZoom((value) => Math.min(value + 0.08, MAX_ZOOM))
                }
                onZoomOut={() =>
                  setZoom((value) => Math.max(value - 0.08, MIN_ZOOM))
                }
                onReset={handleReset}
              />
            </div>
          </div>

          <div className="hidden lg:block lg:sticky lg:top-24 lg:max-w-md lg:justify-self-end">
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
