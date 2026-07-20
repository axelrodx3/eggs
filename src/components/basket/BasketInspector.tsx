"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { basketAssets, basketFocusOrder } from "@/data/assets";
import { useMarketData } from "@/hooks/useMarketData";
import { useAssetSelection } from "@/providers/AssetSelectionProvider";
import { AssetInfoPanel } from "@/components/basket/AssetInfoPanel";
import { BasketControls } from "@/components/basket/BasketControls";
import { BasketHotspot } from "@/components/basket/BasketHotspot";
import { BasketVisual } from "@/components/basket/BasketVisual";
import {
  isHotspotDebugEnabled,
  logHotspotCalibration,
} from "@/lib/basket-hotspot-debug";
import { cn } from "@/lib/utils";

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
  const searchParams = useSearchParams();
  const { selectedId, selectedAsset, selectAsset } = useAssetSelection();
  const { data, loading } = useMarketData();
  const [inspectMode, setInspectMode] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [resetKey, setResetKey] = useState(0);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const stageRef = useRef<HTMLDivElement>(null);

  const debugMode = isHotspotDebugEnabled(searchParams);
  const hotspotsEnabled = inspectMode && !panMode;

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
    setInspectMode(true);
    setPanMode(false);
    setHoveredId(null);
    setResetKey((value) => value + 1);
  };

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panMode) return;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panMode || !dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setPan(
      clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy),
    );
  };

  const handleStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panMode) return;
    dragStart.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleDebugStageClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!debugMode || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    logHotspotCalibration(xPercent, yPercent, hoveredId ?? selectedId);
  };

  const anyHighlight = hoveredId !== null;

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

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="min-w-0">
            <div className="inspector-stage pointer-events-auto relative px-1 py-2 sm:px-2">
              <div className="basket-viewport relative mx-auto w-full max-w-4xl overflow-visible">
                <div
                  ref={stageRef}
                  className={cn(
                    "basket-stage relative origin-center transition-transform duration-300 ease-out",
                    panMode && (isDragging ? "cursor-grabbing" : "cursor-grab"),
                  )}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    touchAction: panMode ? "none" : "auto",
                  }}
                  onPointerDown={handleStagePointerDown}
                  onPointerMove={handleStagePointerMove}
                  onPointerUp={handleStagePointerUp}
                  onPointerCancel={handleStagePointerUp}
                  onClick={handleDebugStageClick}
                >
                  <BasketVisual
                    variant="inspector"
                    floating={false}
                    tilt={false}
                    interactive
                    resetKey={resetKey}
                  >
                    <div className="basket-hotspot-layer absolute inset-0">
                      {basketFocusOrder.map((assetId) => {
                        const asset = basketAssets.find((item) => item.id === assetId);
                        if (!asset) return null;
                        const hovered = hoveredId === asset.id;
                        const selected = selectedId === asset.id;
                        const dimmed =
                          anyHighlight && !hovered && !selected;
                        return (
                          <BasketHotspot
                            key={asset.id}
                            asset={asset}
                            selected={selected}
                            hovered={hovered}
                            dimmed={dimmed}
                            debugMode={debugMode}
                            panMode={panMode}
                            disabled={!hotspotsEnabled}
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
              <BasketControls
                inspectMode={inspectMode}
                panMode={panMode}
                zoom={zoom}
                onInspectToggle={() => {
                  setInspectMode(true);
                  setPanMode(false);
                }}
                onPanToggle={() => {
                  setPanMode((value) => {
                    const next = !value;
                    if (next) {
                      setInspectMode(false);
                      setHoveredId(null);
                    } else {
                      setInspectMode(true);
                    }
                    return next;
                  });
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
