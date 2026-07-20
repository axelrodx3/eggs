export type TokenomicsCategory = {
  id: string;
  name: string;
  percentage: number | null;
  description: string;
};

export type TokenomicsConfig = {
  finalized: boolean;
  categories: TokenomicsCategory[];
};

/** Edit percentages here when distribution is finalized. */
export const tokenomicsConfig: TokenomicsConfig = {
  finalized: false,
  categories: [
    {
      id: "liquidity",
      name: "Liquidity",
      percentage: null,
      description: "Pool depth and trading availability at launch.",
    },
    {
      id: "community",
      name: "Community",
      percentage: null,
      description: "Community initiatives and ecosystem growth.",
    },
    {
      id: "marketing",
      name: "Marketing",
      percentage: null,
      description: "Brand awareness and launch campaigns.",
    },
    {
      id: "treasury",
      name: "Treasury",
      percentage: null,
      description: "Operational reserves and strategic initiatives.",
    },
    {
      id: "team",
      name: "Team",
      percentage: null,
      description: "Core contributors aligned with long-term delivery.",
    },
    {
      id: "burn",
      name: "Burn",
      percentage: null,
      description: "Supply reduction mechanisms when applicable.",
    },
  ],
};
