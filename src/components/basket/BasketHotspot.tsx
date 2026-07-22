"use client";

import { motion } from "framer-motion";
import type { BasketAsset } from "@/data/assets";
import { cn } from "@/lib/utils";

type BasketHotspotProps = {
  asset: BasketAsset;
  selected: boolean;
  hovered: boolean;
  debugMode: boolean;
  tabIndex?: number;
  onSelect: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

export function BasketHotspot({
  asset,
  selected,
  hovered,
  debugMode,
  tabIndex = 0,
  onSelect,
  onPointerEnter,
  onPointerLeave,
}: BasketHotspotProps) {
  const { hotspot } = asset;
  const hitWidth = hotspot.hitWidth ?? hotspot.width * 1.14;
  const hitHeight = hotspot.hitHeight ?? hotspot.height * 1.14;
  const rotation = hotspot.rotation ?? 0;
  const priority = hotspot.priority ?? 10;
  const tickerLabel = asset.displayTicker ?? "Private Company";
  const tooltipAbove = hotspot.y >= 42;
  const visualWidthPct = (hotspot.width / hitWidth) * 100;
  const visualHeightPct = (hotspot.height / hitHeight) * 100;

  return (
    <button
      type="button"
      aria-label={`Inspect ${asset.name}${asset.displayTicker ? `, ${asset.displayTicker}` : ", private company"}`}
      aria-pressed={selected}
      tabIndex={tabIndex}
      className={cn(
        "basket-hotspot-hit absolute cursor-pointer border-0 bg-transparent p-0 outline-none pointer-events-auto",
        debugMode && "border border-dashed border-lime/60",
      )}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hitWidth}%`,
        height: `${hitHeight}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: hovered ? priority + 30 : selected ? priority + 20 : priority,
        touchAction: "manipulation",
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
        event.currentTarget.blur();
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerLeave}
    >
      {selected && !hovered ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-lime/75 bg-lime/8 shadow-[0_0_18px_rgba(199,240,0,0.16)] transition duration-200 ease-out"
          style={{
            width: `${visualWidthPct}%`,
            height: `${visualHeightPct}%`,
          }}
        />
      ) : null}

      {hovered ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 block rounded-[999px] border border-lime bg-lime/12 shadow-[0_8px_20px_rgba(0,0,0,0.38),0_0_24px_rgba(199,240,0,0.22)]"
          style={{
            width: `${visualWidthPct}%`,
            height: `${visualHeightPct}%`,
          }}
          initial={{ x: "-50%", y: "-50%", scale: 1 }}
          animate={{
            x: "-50%",
            y: "calc(-50% - 4px)",
            scale: 1.04,
          }}
          exit={{ x: "-50%", y: "-50%", scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ) : null}

      {hovered ? (
        <span
          className={cn(
            "pointer-events-none absolute left-1/2 z-40 min-w-[7.5rem] -translate-x-1/2 rounded-xl border border-border bg-background/95 px-3 py-2 text-center shadow-lg",
            tooltipAbove ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          <span className="block text-xs font-semibold text-foreground">{asset.name}</span>
          <span className="block text-[11px] text-lime">{tickerLabel}</span>
        </span>
      ) : null}

      {debugMode ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-[999px] border-2 border-solid border-lime/90"
            style={{
              width: `${visualWidthPct}%`,
              height: `${visualHeightPct}%`,
            }}
          />
          <span className="pointer-events-none absolute -left-1 -top-1 z-50 max-w-[9rem] rounded bg-black/85 px-1.5 py-1 text-[9px] leading-snug text-lime">
            <span className="font-semibold">{tickerLabel}</span>
            <br />
            x{hotspot.x} y{hotspot.y}
            <br />
            {hotspot.width}×{hotspot.height}
            {rotation ? ` · ${rotation}°` : ""}
          </span>
        </>
      ) : null}
    </button>
  );
}
