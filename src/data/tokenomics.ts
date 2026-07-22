export const TOKENOMICS = {
  buyTaxPercent: 2,
  sellTaxPercent: 3,
  allocation: {
    stocks: 100,
    burn: 0,
    dividendTracker: 0,
    liquidity: 0,
    unallocated: 0,
  },
  minimumEligibleBalance: 100_000,
} as const;

export type TaxAllocationKey = keyof typeof TOKENOMICS.allocation;

export const TAX_ALLOCATION_ROWS: {
  key: TaxAllocationKey;
  label: string;
}[] = [
  { key: "stocks", label: "Stocks Vault" },
  { key: "burn", label: "Burn" },
  { key: "dividendTracker", label: "Dividend Tracker" },
  { key: "liquidity", label: "Liquidity" },
  { key: "unallocated", label: "Unallocated" },
];

export function formatEggsBalance(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export function allocationTotal(
  allocation: typeof TOKENOMICS.allocation = TOKENOMICS.allocation,
): number {
  return Object.values(allocation).reduce<number>(
    (sum, value) => sum + value,
    0,
  );
}
