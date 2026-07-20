export const siteConfig = {
  name: "$EGGS",
  tagline: "One Basket. Every Giant.",
  eyebrow: "THE MARKET. IN ONE BASKET.",
  headlineLine1: "One Basket.",
  headlineLine2: "Every Giant.",
  heroCopy:
    "$EGGS brings ten recognizable market giants into one unforgettable memecoin identity.",
  availability: "Launching on Robinhood",
  disclaimer:
    "The basket represents the project theme. Holding $EGGS does not automatically constitute ownership of the displayed securities.",
  robinhoodUrl: "https://robinhood.com",
  social: {
    x: "https://x.com/eggsonhood",
    /** Set when the official Telegram URL is available. */
    telegram: null as string | null,
    /** Set when the official Dexscreener URL is available. */
    dexscreener: null as string | null,
  },
  contractAddress: null as string | null,
  nav: [
    { id: "basket", label: "Basket" },
    { id: "market", label: "Market" },
    { id: "how-to-buy", label: "How to Buy" },
    { id: "tokenomics", label: "Tokenomics" },
    { id: "faq", label: "FAQ" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
