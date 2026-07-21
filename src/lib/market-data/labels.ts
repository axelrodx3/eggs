import type { DataStateLabel, MarketQuote } from "./types";
import { formatTimestampEt, formatTimestampEtShort } from "./market-hours";

export function getDataStateDisplay(label: DataStateLabel): string {
  switch (label) {
    case "live":
      return "Live";
    case "delayed":
      return "Delayed 15 min";
    case "market_closed":
      return "Market closed";
    case "last_close":
      return "Last close";
    case "index_unavailable":
      return "Index unavailable";
    case "development":
      return "Development only";
    case "unavailable":
    default:
      return "Temporarily unavailable";
  }
}

export function buildUpdatedLabel(
  quote: MarketQuote | null,
  lastUpdated: string | null,
  isStale: boolean,
): string | null {
  const ts = quote?.providerTimestamp ?? lastUpdated;
  const formatted = formatTimestampEt(ts);
  if (!formatted) return null;
  if (isStale) {
    const short = formatTimestampEtShort(ts);
    return short
      ? `Data may be delayed · Last update ${short} ET`
      : "Data may be delayed";
  }
  return `Updated ${formatted} ET`;
}

export function buildStripUpdatedLabel(
  lastUpdated: string | null,
  isStale: boolean,
): string | null {
  const formatted = formatTimestampEt(lastUpdated);
  if (!formatted) return null;
  if (isStale) {
    const short = formatTimestampEtShort(lastUpdated);
    return short
      ? `Data may be delayed · Last update ${short} ET`
      : "Data may be delayed";
  }
  return `Updated ${formatted} ET`;
}
