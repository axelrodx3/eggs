import { describe, expect, it } from "vitest";
import {
  TOKENOMICS,
  allocationTotal,
  formatEggsBalance,
} from "./tokenomics";

describe("TOKENOMICS", () => {
  it("matches launch tax settings", () => {
    expect(TOKENOMICS.buyTaxPercent).toBe(2);
    expect(TOKENOMICS.sellTaxPercent).toBe(3);
  });

  it("allocates 100% to the Stocks Vault", () => {
    expect(TOKENOMICS.allocation.stocks).toBe(100);
    expect(TOKENOMICS.allocation.burn).toBe(0);
    expect(TOKENOMICS.allocation.dividendTracker).toBe(0);
    expect(TOKENOMICS.allocation.liquidity).toBe(0);
    expect(TOKENOMICS.allocation.unallocated).toBe(0);
    expect(allocationTotal()).toBe(100);
  });

  it("uses the configured holder eligibility threshold", () => {
    expect(TOKENOMICS.minimumEligibleBalance).toBe(100_000);
    expect(formatEggsBalance(TOKENOMICS.minimumEligibleBalance)).toBe(
      "100,000",
    );
  });
});
