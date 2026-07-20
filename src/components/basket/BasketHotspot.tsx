"use client";

import { motion } from "framer-motion";
import type { BasketAsset } from "@/data/assets";
import { cn } from "@/lib/utils";

type BasketHotspotProps = {
  asset: BasketAsset;
  selected: boolean;
  inspectMode: boolean;
  tabIndex?: number;
  onSelect: () => void;
};

export function BasketHotspot({
  asset,
  selected,
  inspectMode,
  tabIndex = 0,
  onSelect,
}: BasketHotspotProps) {
  const label = asset.ticker ?? "Private";

  return (
    <motion.button
      type="button"
      aria-label={`${asset.name}${asset.ticker ? `, ${asset.ticker}` : ", private company"}`}
      aria-pressed={selected}
      tabIndex={tabIndex}
      className={cn(
        "group absolute -translate-x-1/2 -translate-y-1/2 rounded-[999px] border-2 transition focus-ring",
        inspectMode ? "cursor-crosshair" : "cursor-pointer",
        selected
          ? "z-20 border-lime bg-lime/12 lime-glow"
          : "border-transparent bg-transparent hover:border-lime/60 hover:bg-lime/8",
      )}
      style={{
        left: `${asset.hotspot.x}%`,
        top: `${asset.hotspot.y}%`,
        width: `${asset.hotspot.width}%`,
        height: `${asset.hotspot.height}%`,
      }}
      onClick={onSelect}
      whileHover={
        inspectMode ? undefined : { y: -3, scale: 1.02, transition: { duration: 0.15 } }
      }
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <span className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-medium opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        {asset.name} · {label}
      </span>
    </motion.button>
  );
}
