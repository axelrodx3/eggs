export type AssetType = "stock" | "index" | "private";

export type AssetHotspot = {
  /** Horizontal center, percent of basket width */
  x: number;
  /** Vertical center, percent of basket height */
  y: number;
  /** Hotspot width, percent of basket width */
  width: number;
  /** Hotspot height, percent of basket height */
  height: number;
};

export type BasketAsset = {
  id: string;
  name: string;
  ticker: string | null;
  type: AssetType;
  description: string;
  sector: string;
  officialUrl: string;
  logoPath: string;
  hotspot: AssetHotspot;
  /** Symbol for market data provider; null for private assets */
  marketDataSymbol: string | null;
  isPrivate: boolean;
};

/**
 * Hotspot coordinates are tuned for public/assets/eggs-basket.png.
 * Adjust x/y/width/height if the final artwork shifts egg positions.
 */
export const basketAssets: BasketAsset[] = [
  {
    id: "aapl",
    name: "Apple",
    ticker: "AAPL",
    type: "stock",
    description:
      "Consumer technology leader known for iPhone, services, and a global hardware ecosystem.",
    sector: "Technology",
    officialUrl: "https://www.apple.com",
    logoPath: "/assets/logos/aapl.svg",
    hotspot: { x: 18, y: 38, width: 14, height: 16 },
    marketDataSymbol: "AAPL",
    isPrivate: false,
  },
  {
    id: "googl",
    name: "Alphabet",
    ticker: "GOOGL",
    type: "stock",
    description:
      "Parent of Google, spanning search, cloud, AI, and digital advertising at global scale.",
    sector: "Technology",
    officialUrl: "https://abc.xyz",
    logoPath: "/assets/logos/googl.svg",
    hotspot: { x: 34, y: 32, width: 14, height: 16 },
    marketDataSymbol: "GOOGL",
    isPrivate: false,
  },
  {
    id: "nvda",
    name: "NVIDIA",
    ticker: "NVDA",
    type: "stock",
    description:
      "Semiconductor and AI infrastructure company powering data centers, gaming, and accelerated computing.",
    sector: "Technology",
    officialUrl: "https://www.nvidia.com",
    logoPath: "/assets/logos/nvda.svg",
    hotspot: { x: 50, y: 28, width: 14, height: 16 },
    marketDataSymbol: "NVDA",
    isPrivate: false,
  },
  {
    id: "msft",
    name: "Microsoft",
    ticker: "MSFT",
    type: "stock",
    description:
      "Enterprise software, cloud, productivity, and AI platform company behind Azure and Office.",
    sector: "Technology",
    officialUrl: "https://www.microsoft.com",
    logoPath: "/assets/logos/msft.svg",
    hotspot: { x: 66, y: 32, width: 14, height: 16 },
    marketDataSymbol: "MSFT",
    isPrivate: false,
  },
  {
    id: "amzn",
    name: "Amazon",
    ticker: "AMZN",
    type: "stock",
    description:
      "E-commerce, logistics, and cloud computing giant through AWS and consumer marketplaces.",
    sector: "Consumer / Cloud",
    officialUrl: "https://www.amazon.com",
    logoPath: "/assets/logos/amzn.svg",
    hotspot: { x: 82, y: 38, width: 14, height: 16 },
    marketDataSymbol: "AMZN",
    isPrivate: false,
  },
  {
    id: "meta",
    name: "Meta",
    ticker: "META",
    type: "stock",
    description:
      "Social and metaverse technology company operating Facebook, Instagram, and WhatsApp.",
    sector: "Technology",
    officialUrl: "https://about.meta.com",
    logoPath: "/assets/logos/meta.svg",
    hotspot: { x: 24, y: 58, width: 14, height: 16 },
    marketDataSymbol: "META",
    isPrivate: false,
  },
  {
    id: "tsla",
    name: "Tesla",
    ticker: "TSLA",
    type: "stock",
    description:
      "Electric vehicle and energy company focused on manufacturing, batteries, and autonomy.",
    sector: "Automotive / Energy",
    officialUrl: "https://www.tesla.com",
    logoPath: "/assets/logos/tsla.svg",
    hotspot: { x: 40, y: 54, width: 14, height: 16 },
    marketDataSymbol: "TSLA",
    isPrivate: false,
  },
  {
    id: "sp500",
    name: "S&P 500 Index",
    ticker: "SPX",
    type: "index",
    description:
      "Broad U.S. large-cap benchmark tracking roughly 500 leading domestic companies.",
    sector: "Index",
    officialUrl: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/",
    logoPath: "/assets/logos/sp500.svg",
    hotspot: { x: 56, y: 54, width: 14, height: 16 },
    marketDataSymbol: "SPX",
    isPrivate: false,
  },
  {
    id: "ndx",
    name: "Nasdaq-100 Index",
    ticker: "NDX",
    type: "index",
    description:
      "Large-cap growth index weighted toward technology and innovation leaders listed on Nasdaq.",
    sector: "Index",
    officialUrl: "https://www.nasdaq.com/solutions/global-indexes/nasdaq-100",
    logoPath: "/assets/logos/ndx.svg",
    hotspot: { x: 72, y: 58, width: 14, height: 16 },
    marketDataSymbol: "NDX",
    isPrivate: false,
  },
  {
    id: "spacex",
    name: "SpaceX",
    ticker: null,
    type: "private",
    description:
      "Private aerospace company developing launch vehicles, Starlink, and next-generation space systems. Included as a thematic representation—not a tradable public equity.",
    sector: "Private Company",
    officialUrl: "https://www.spacex.com",
    logoPath: "/assets/logos/spacex.svg",
    hotspot: { x: 50, y: 72, width: 16, height: 18 },
    marketDataSymbol: null,
    isPrivate: true,
  },
];

export const basketAssetById = Object.fromEntries(
  basketAssets.map((asset) => [asset.id, asset]),
) as Record<string, BasketAsset>;

export const basketAssetByTicker = Object.fromEntries(
  basketAssets
    .filter((asset) => asset.ticker)
    .map((asset) => [asset.ticker!, asset]),
) as Record<string, BasketAsset>;

export const publicMarketAssets = basketAssets.filter(
  (asset) => !asset.isPrivate && asset.marketDataSymbol,
);

export const defaultSelectedAssetId = basketAssets[0]?.id ?? "aapl";
