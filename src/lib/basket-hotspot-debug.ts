/** Enable with ?debugHotspots=true (development or explicit query param). */
export function isHotspotDebugEnabled(searchParams: URLSearchParams | null) {
  if (searchParams?.get("debugHotspots") === "true") return true;
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_BASKET_HOTSPOT_DEBUG === "true"
  );
}

export function logHotspotCalibration(
  xPercent: number,
  yPercent: number,
  assetId?: string,
) {
  console.info("[basket-hotspot-calibration]", {
    assetId,
    xPercent: Number(xPercent.toFixed(2)),
    yPercent: Number(yPercent.toFixed(2)),
  });
}
