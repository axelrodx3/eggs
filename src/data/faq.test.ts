import { describe, expect, it } from "vitest";
import { faqItems } from "@/data/faq";
import { TOKENOMICS } from "@/data/tokenomics";

describe("faqItems", () => {
  it("includes the finalized FAQ set", () => {
    expect(faqItems).toHaveLength(9);
    expect(faqItems.map((item) => item.question)).toEqual([
      "What is $EGGS?",
      "What is inside the basket?",
      "Why were these ten assets selected?",
      "What is the Flap Stocks Vault?",
      "How are taxes allocated?",
      "How do basket holder rewards work?",
      "What is the minimum balance for eligibility?",
      "Does holding $EGGS mean I own shares in the ten companies?",
      "Where can I buy $EGGS?",
    ]);
  });

  it("uses configured tokenomics figures", () => {
    const taxAnswer = faqItems.find((item) => item.id === "tax-allocation")?.answer;
    const eligibilityAnswer = faqItems.find(
      (item) => item.id === "minimum-eligibility",
    )?.answer;

    expect(taxAnswer).toContain(`${TOKENOMICS.buyTaxPercent}%`);
    expect(taxAnswer).toContain(`${TOKENOMICS.sellTaxPercent}%`);
    expect(eligibilityAnswer).toContain("100,000 $EGGS");
  });

  it("does not use em dashes", () => {
    for (const item of faqItems) {
      expect(item.answer).not.toMatch(/—/);
      expect(item.question).not.toMatch(/—/);
    }
  });
});
