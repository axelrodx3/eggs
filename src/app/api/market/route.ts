import { NextResponse } from "next/server";
import { publicMarketAssets } from "@/data/assets";
import { fetchMarketQuotes } from "@/lib/market-data/provider";

export const revalidate = 60;

export async function GET() {
  const symbols = publicMarketAssets
    .map((asset) => asset.marketDataSymbol)
    .filter((symbol): symbol is string => Boolean(symbol));

  const bundle = await fetchMarketQuotes(symbols);
  return NextResponse.json(bundle, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
