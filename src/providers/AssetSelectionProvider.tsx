"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  basketAssetById,
  defaultSelectedAssetId,
  type BasketAsset,
} from "@/data/assets";

type AssetSelectionContextValue = {
  selectedId: string;
  selectedAsset: BasketAsset;
  selectAsset: (id: string, options?: { scrollToInspector?: boolean }) => void;
};

const AssetSelectionContext =
  createContext<AssetSelectionContextValue | null>(null);

export function AssetSelectionProvider({
  children,
  initialAssetId,
}: {
  children: ReactNode;
  initialAssetId?: string | null;
}) {
  const [selectedId, setSelectedId] = useState(
    initialAssetId && basketAssetById[initialAssetId]
      ? initialAssetId
      : defaultSelectedAssetId,
  );

  const selectAsset = useCallback(
    (id: string, options?: { scrollToInspector?: boolean }) => {
      if (!basketAssetById[id]) return;
      setSelectedId(id);

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("asset", basketAssetById[id].ticker ?? id.toUpperCase());
        const next = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", next);
      }

      if (options?.scrollToInspector) {
        document
          .getElementById("basket")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      selectedId,
      selectedAsset: basketAssetById[selectedId] ?? basketAssetById[defaultSelectedAssetId],
      selectAsset,
    }),
    [selectedId, selectAsset],
  );

  return (
    <AssetSelectionContext.Provider value={value}>
      {children}
    </AssetSelectionContext.Provider>
  );
}

export function useAssetSelection() {
  const context = useContext(AssetSelectionContext);
  if (!context) {
    throw new Error("useAssetSelection must be used within AssetSelectionProvider");
  }
  return context;
}
