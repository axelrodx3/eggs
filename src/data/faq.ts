import { formatEggsBalance, TOKENOMICS } from "@/data/tokenomics";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const minimumBalance = formatEggsBalance(TOKENOMICS.minimumEligibleBalance);

export const faqItems: FaqItem[] = [
  {
    id: "what-is-eggs",
    question: "What is $EGGS?",
    answer:
      "$EGGS is a memecoin built around one basket containing ten recognizable companies and market benchmarks. The project combines a memorable market-themed identity with Flap's Stocks Vault infrastructure for basket based holder rewards.",
  },
  {
    id: "basket-contents",
    question: "What is inside the basket?",
    answer:
      "The basket includes Apple, Alphabet, NVIDIA, Microsoft, Amazon, Meta, Tesla, the S&P 500, the Nasdaq-100, and SpaceX. Together they represent major technology leaders, broad market benchmarks, and a recognizable aerospace leader.",
  },
  {
    id: "why-ten",
    question: "Why were these ten assets selected?",
    answer:
      "They represent major technology companies, broad market benchmarks, and a recognizable aerospace leader aligned with the project's One Basket. Every Giant. identity. The selection reflects widely known names that fit the basket narrative.",
  },
  {
    id: "flap-stocks-vault",
    question: "What is the Flap Stocks Vault?",
    answer:
      "$EGGS uses Flap's existing Stocks Vault infrastructure. Collected protocol tax supports the project's ten asset basket through that vault. The project does not operate a separate custom $EGGS vault.",
  },
  {
    id: "tax-allocation",
    question: "How are taxes allocated?",
    answer: `Buy tax is ${TOKENOMICS.buyTaxPercent}% and sell tax is ${TOKENOMICS.sellTaxPercent}%. One hundred percent of collected buy and sell tax is allocated to the Stocks Vault. That does not mean one hundred percent of every token transaction is taxed.`,
  },
  {
    id: "basket-rewards",
    question: "How do basket holder rewards work?",
    answer:
      "Basket based rewards are managed externally through Flap's Stocks Vault for qualifying holders. Nothing here guarantees payments, returns, payout timing, or direct stock ownership.",
  },
  {
    id: "minimum-eligibility",
    question: "What is the minimum balance for eligibility?",
    answer: `The configured minimum balance is ${minimumBalance} $EGGS. Wallets must meet that holder eligibility threshold to qualify for basket based rewards through the Stocks Vault.`,
  },
  {
    id: "ownership",
    question: "Does holding $EGGS mean I own shares in the ten companies?",
    answer:
      "No. Holding $EGGS does not represent direct legal ownership of the displayed companies, indices, or underlying securities.",
  },
  {
    id: "where-buy",
    question: "Where can I buy $EGGS?",
    answer:
      "$EGGS is on Robinhood. Use the official Robinhood listing when purchasing and avoid unverified links or contract addresses shared outside official channels.",
  },
];
