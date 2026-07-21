import { NextResponse } from "next/server";
import { getServerCacheTtlMs } from "@/lib/market-data/config";
import { fetchMarketQuotesResponse } from "@/lib/market-data/provider";

export const dynamic = "force-dynamic";

/** @deprecated Use GET /api/market/quotes */
export async function GET() {
  const payload = await fetchMarketQuotesResponse();
  const ttl = getServerCacheTtlMs(payload.marketState);
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${Math.floor(ttl / 1000)}, stale-while-revalidate=${Math.floor(ttl / 500)}`,
    },
  });
}
