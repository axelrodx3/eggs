export const siteConfig = {
  name: "$EGGS",
  tagline: "One Basket. Every Giant.",
  eyebrow: "THE MARKET. IN ONE BASKET.",
  headlineLine1: "One Basket.",
  headlineLine2: "Every Giant.",
  availability: "On Robinhood",
  robinhoodUrl: "https://robinhood.com",
  social: {
    x: "https://x.com/eggsonhood",
    /** Set when the official Telegram URL is available. */
    telegram: null as string | null,
    /** Set when the official Dexscreener URL is available. */
    dexscreener: null as string | null,
  },
  brandAssets: {
    wordmark: "/assets/brand/eggs-wordmark.png",
  },
  socialAssets: {
    dexscreener: "/assets/social/dexscreener.png",
    robinhood: "/assets/social/robinhood.svg",
  },
  contractAddress: null as string | null,
  nav: [
    { id: "basket", label: "Basket" },
    { id: "market", label: "Market" },
    { id: "tokenomics", label: "Tokenomics" },
    { id: "faq", label: "FAQ" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
