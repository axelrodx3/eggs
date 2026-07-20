"use client";

import { motion } from "framer-motion";
import type { BasketAsset } from "@/data/assets";
import { cn } from "@/lib/utils";

type BasketHotspotProps = {
  asset: BasketAsset;
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  debugMode: boolean;
  panMode?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
};

export function BasketHotspot({
  asset,
  selected,
  hovered,
  dimmed,
  debugMode,
  panMode = false,
  disabled = false,
  tabIndex = 0,
  onSelect,
  onHover,
  onLeave,
}: BasketHotspotProps) {
  const { hotspot } = asset;
  const hitWidth = hotspot.hitWidth ?? hotspot.width * 1.14;
  const hitHeight = hotspot.hitHeight ?? hotspot.height * 1.14;
  const rotation = hotspot.rotation ?? 0;
  const priority = hotspot.priority ?? 10;
  const tickerLabel = asset.ticker ?? "Private Company";
  const active = hovered || selected;
  const tooltipAbove = hotspot.y >= 42;
  const visualWidthPct = (hotspot.width / hitWidth) * 100;
  const visualHeightPct = (hotspot.height / hitHeight) * 100;

  return (
    <button
      type="button"
      aria-label={`Inspect ${asset.name}${asset.ticker ? `, ${asset.ticker}` : ", private company"}`}
      aria-pressed={selected}
      tabIndex={disabled ? -1 : tabIndex}
      disabled={disabled}
      className={cn(
        "group/basket-hotspot basket-hotspot-hit absolute border-0 bg-transparent p-0 outline-none",
        disabled || panMode
          ? "pointer-events-none cursor-default"
          : "cursor-pointer pointer-events-auto",
        debugMode && "border border-dashed border-lime/60",
      )}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hitWidth}%`,
        height: `${hitHeight}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: active ? priority + 30 : priority,
        touchAction: panMode ? "none" : "manipulation",
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled && !panMode) onSelect();
      }}
      onMouseEnter={() => {
        if (!panMode) onHover();
      }}
      onMouseLeave={onLeave}
      onFocus={() => {
        if (!panMode) onHover();
      }}
      onBlur={onLeave}
    >
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 block rounded-[999px] border transition-[box-shadow,border-color,background-color]",
          selected && !hovered && "border-lime/75 bg-lime/8",
          hovered &&
            "border-lime bg-lime/12 shadow-[0_8px_20px_rgba(0,0,0,0.38),0_0_24px_rgba(199,240,0,0.2)]",
          !active && "border-transparent bg-transparent",
          "group-focus-visible/basket-hotspot:border-lime group-focus-visible/basket-hotspot:bg-lime/10",
        )}
        style={{
          width: `${visualWidthPct}%`,
          height: `${visualHeightPct}%`,
        }}
        initial={false}
        animate={{
          x: "-50%",
          y: hovered ? "-56%" : "-50%",
          scale: hovered ? 1.05 : selected ? 1.02 : 1,
          opacity: dimmed ? 0.9 : 1,
        }}
        transition={{
          duration: hovered ? 0.16 : 0.14,
          ease: "easeOut",
        }}
      />

      {hovered && !panMode ? (
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
