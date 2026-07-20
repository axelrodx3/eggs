"use client";

import { useRef } from "react";
import { Maximize2, Minimize2, Move, RotateCcw, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

type PanDirection = "left" | "right" | "up" | "down";

type BasketControlsProps = {
  inspectMode: boolean;
  zoom: number;
  onInspectToggle: () => void;
  onPan: (direction: PanDirection) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function BasketControls({
  inspectMode,
  zoom,
  onInspectToggle,
  onPan,
  onZoomIn,
  onZoomOut,
  onReset,
}: BasketControlsProps) {
  const panStep = useRef<PanDirection[]>(["right", "down", "left", "up"]);
  const panIndex = useRef(0);

  const buttonClass =
    "focus-ring inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium transition hover:border-lime/40 hover:text-lime";

  const handlePan = () => {
    const direction = panStep.current[panIndex.current % panStep.current.length];
    panIndex.current += 1;
    onPan(direction);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={cn(buttonClass, inspectMode && "border-lime/50 text-lime")}
        onClick={onInspectToggle}
        aria-pressed={inspectMode}
      >
        <ScanSearch className="h-4 w-4" />
        Inspect mode
      </button>
      <button type="button" className={buttonClass} onClick={handlePan}>
        <Move className="h-4 w-4" />
        Pan slightly
      </button>
      <button type="button" className={buttonClass} onClick={onZoomIn}>
        <Maximize2 className="h-4 w-4" />
        Zoom in
      </button>
      <button type="button" className={buttonClass} onClick={onZoomOut}>
        <Minimize2 className="h-4 w-4" />
        Zoom out
      </button>
      <button type="button" className={buttonClass} onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>
      <span className="ml-auto text-xs text-muted">{Math.round(zoom * 100)}%</span>
    </div>
  );
}
