import { NextResponse } from "next/server";
import { assertChartRange, assertPublicAssetId } from "@/lib/market-data/allowlist";
import { MARKET_REFRESH_CONFIG } from "@/lib/market-data/config";
import { MarketDataError } from "@/lib/market-data/errors";
import { fetchMarketHistoryResponse } from "@/lib/market-data/provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetParam = searchParams.get("asset");
  const rangeParam = searchParams.get("range") ?? "1M";

  if (!assetParam) {
    return NextResponse.json(
      { error: "Missing asset parameter.", errorCode: "unsupported_asset" },
      { status: 400 },
    );
  }

  try {
    const asset = assertPublicAssetId(assetParam.toLowerCase());
    const range = assertChartRange(rangeParam);
    const payload = await fetchMarketHistoryResponse(asset.id, range);

    const cacheSeconds = Math.floor(MARKET_REFRESH_CONFIG.historyCacheMs / 1000);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`,
      },
    });
  } catch (error) {
    if (error instanceof MarketDataError) {
      const status =
        error.code === "unsupported_asset" || error.code === "unsupported_range"
          ? 400
          : 503;
      return NextResponse.json(
        {
          assetId: assetParam.toLowerCase(),
          range: rangeParam,
          candles: [],
          status: "error",
          error: error.message,
          errorCode: error.code,
          fetchedAt: new Date().toISOString(),
          periodChangePercent: null,
        },
        { status },
      );
    }
    return NextResponse.json(
      {
        assetId: assetParam.toLowerCase(),
        range: rangeParam,
        candles: [],
        status: "error",
        error: "Historical data unavailable.",
        errorCode: "historical_unavailable",
        fetchedAt: new Date().toISOString(),
        periodChangePercent: null,
      },
      { status: 503 },
    );
  }
}
