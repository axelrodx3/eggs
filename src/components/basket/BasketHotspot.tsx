"use client";

import { motion } from "framer-motion";
import type { BasketAsset } from "@/data/assets";
import { cn } from "@/lib/utils";

type BasketHotspotProps = {
  asset: BasketAsset;
  selected: boolean;
  hovered: boolean;
  debugMode: boolean;
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
  debugMode,
  disabled = false,
  tabIndex = 0,
  onSelect,
  onHover,
  onLeave,
}: BasketHotspotProps) {
  const label = asset.ticker ?? "Private";
  const showHighlight = hovered;

  return (
    <motion.button
      type="button"
      aria-label={`Inspect ${asset.name}${asset.ticker ? `, ${asset.ticker}` : ", private company"}`}
      aria-pressed={selected}
      tabIndex={disabled ? -1 : tabIndex}
      disabled={disabled}
      className={cn(
        "group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-[999px] border-2 transition focus-ring pointer-events-auto",
        disabled ? "cursor-default opacity-40" : "cursor-pointer",
        debugMode && "border-lime/40 bg-lime/5",
        showHighlight
          ? "z-20 border-lime bg-lime/12 lime-glow"
          : "border-transparent bg-transparent",
      )}
      style={{
        left: `${asset.hotspot.x}%`,
        top: `${asset.hotspot.y}%`,
        width: `${asset.hotspot.width}%`,
        height: `${asset.hotspot.height}%`,
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onSelect();
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      whileHover={
        disabled ? undefined : { y: -3, scale: 1.03, transition: { duration: 0.15 } }
      }
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      {debugMode ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-lime">
          {label}
        </span>
      ) : null}
      <span className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-medium opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        {asset.name} · {label}
      </span>
    </motion.button>
  );
}
