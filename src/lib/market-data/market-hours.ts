import type { MarketState } from "./types";

const NY_TIMEZONE = "America/New_York";

/** U.S. equity market holidays (NYSE full closures) — extend annually. */
const US_MARKET_HOLIDAYS_2025_2026 = new Set([
  "2025-01-01",
  "2025-01-20",
  "2025-02-17",
  "2025-04-18",
  "2025-05-26",
  "2025-06-19",
  "2025-07-04",
  "2025-09-01",
  "2025-11-27",
  "2025-12-25",
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-04-03",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-11-26",
  "2026-12-25",
]);

type NyParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  dateKey: string;
};

function getNyParts(date = new Date()): NyParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const year = Number(lookup.year);
  const month = Number(lookup.month);
  const day = Number(lookup.day);
  const hour = Number(lookup.hour === "24" ? "0" : lookup.hour);
  const minute = Number(lookup.minute);
  const weekday = weekdayMap[lookup.weekday ?? "Mon"] ?? 1;
  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, weekday, hour, minute, dateKey };
}

function minutesSinceMidnight(parts: NyParts): number {
  return parts.hour * 60 + parts.minute;
}

/** Isolated U.S. session fallback when provider metadata is absent. */
export function inferUsMarketState(date = new Date()): MarketState {
  const ny = getNyParts(date);
  if (ny.weekday === 0 || ny.weekday === 6) return "closed";
  if (US_MARKET_HOLIDAYS_2025_2026.has(ny.dateKey)) return "closed";

  const mins = minutesSinceMidnight(ny);
  const premarketStart = 4 * 60;
  const sessionOpen = 9 * 60 + 30;
  const sessionClose = 16 * 60;
  const afterHoursEnd = 20 * 60;

  if (mins >= sessionOpen && mins < sessionClose) return "open";
  if (mins >= premarketStart && mins < sessionOpen) return "premarket";
  if (mins >= sessionClose && mins < afterHoursEnd) return "after-hours";
  return "closed";
}

export function resolveMarketState(
  providerIsMarketOpen: boolean | null | undefined,
  date = new Date(),
): MarketState {
  if (providerIsMarketOpen === true) return "open";
  if (providerIsMarketOpen === false) {
    const fallback = inferUsMarketState(date);
    if (fallback === "open") return "unknown";
    return fallback;
  }
  return inferUsMarketState(date);
}

export function formatTimestampEt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTimestampEtShort(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export { NY_TIMEZONE };
