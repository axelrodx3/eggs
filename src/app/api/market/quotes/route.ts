import { NextResponse } from "next/server";
import { getServerCacheTtlMs } from "@/lib/market-data/config";
import { fetchMarketQuotesResponse } from "@/lib/market-data/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await fetchMarketQuotesResponse();
    const ttl = getServerCacheTtlMs(payload.marketState);
    const cacheControl = `public, s-maxage=${Math.floor(ttl / 1000)}, stale-while-revalidate=${Math.floor(ttl / 500)}`;

    return NextResponse.json(payload, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch {
    return NextResponse.json(
      {
        quotesByAssetId: {},
        status: "error",
        provider: null,
        marketState: "unknown",
        lastUpdated: null,
        fetchedAt: new Date().toISOString(),
        isStale: false,
        error: "Market data temporarily unavailable.",
        errorCode: "provider_unavailable",
        isDevelopmentMock: false,
      },
      { status: 503 },
    );
  }
}
