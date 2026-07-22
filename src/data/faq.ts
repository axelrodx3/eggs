export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "what-is-eggs",
    question: "What is $EGGS?",
    answer:
      "$EGGS is a memecoin built around a single visual idea: ten recognizable market giants collected in one basket. The project focuses on brand, community, and a memorable market-themed identity.",
  },
  {
    id: "basket-represent",
    question: "What does the basket represent?",
    answer:
      "The basket is a creative representation of widely known companies and indexes. It communicates the project's theme and narrative. It is not a direct claim of proportional exposure to each asset.",
  },
  {
    id: "ownership",
    question: "Do $EGGS holders own the represented stocks?",
    answer:
      "The basket is a branding and product representation. Token ownership does not automatically provide legal ownership of the displayed securities unless explicitly documented through the final distribution mechanism.",
  },
  {
    id: "why-ten",
    question: "Why were these ten assets selected?",
    answer:
      "The selection reflects recognizable names across technology, consumer, and broad market indexes, plus SpaceX as a private-company narrative anchor. Final selection criteria will be documented in official announcements.",
  },
  {
    id: "where-buy",
    question: "Where can I buy $EGGS?",
    answer:
      "$EGGS is intended to launch on Robinhood. Use the official listing page once published. Avoid unverified links or contract addresses shared outside official channels.",
  },
  {
    id: "blockchain",
    question: "What blockchain is $EGGS on?",
    answer:
      "Network details will be confirmed at launch. Check official announcements for the verified chain and contract address before interacting with any token.",
  },
  {
    id: "rwa",
    question: "How will RWA distributions work?",
    answer:
      "Any real-world asset or distribution mechanism will be described in official documentation when finalized. Nothing on this site constitutes a promise of yield, dividends, or asset backing until formally published.",
  },
  {
    id: "risks",
    question: "What are the risks?",
    answer:
      "Memecoins are highly speculative. Prices can be volatile, liquidity may vary, and you could lose your entire investment. This site is informational, not financial advice. Do your own research.",
  },
  {
    id: "announcements",
    question: "Where can I verify official announcements?",
    answer:
      "Follow only links published through verified official channels. Contract addresses, launch timing, and distribution details will be shared through those channels first.",
  },
  {
    id: "spacex-public",
    question: "Is SpaceX publicly traded?",
    answer:
      "No. SpaceX is a private company and is included in the basket as a thematic representation only. It does not have public market pricing on this site.",
  },
];
