/** Final basket artwork dimensions (public/assets/eggs-basket.png). */
export const BASKET_IMAGE = {
  src: "/assets/eggs-basket.png",
  width: 1536,
  height: 1024,
  aspectRatio: "3 / 2",
} as const;

export type AssetType = "stock" | "index" | "private";

export type AssetHotspot = {
  /** Center X (% of basket stage). */
  x: number;
  /** Center Y (% of basket stage). */
  y: number;
  /** Visual egg width (% of basket stage). */
  width: number;
  /** Visual egg height (% of basket stage). */
  height: number;
  /** Invisible hit target width (% of basket stage). */
  hitWidth?: number;
  /** Invisible hit target height (% of basket stage). */
  hitHeight?: number;
  /** Approximate visible egg tilt in degrees. */
  rotation?: number;
  /** Stacking priority when eggs overlap (higher = on top). */
  priority?: number;
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
  marketDataSymbol: string | null;
  isPrivate: boolean;
};

/**
 * Hotspots manually calibrated for public/assets/eggs-basket.png (1536×1024).
 * x/y = egg center; width/height = visual highlight; hitWidth/hitHeight = tap target.
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
    logoPath: "/assets/logos/apple.svg",
    hotspot: {
      x: 22,
      y: 31.5,
      width: 9.5,
      height: 13,
      hitWidth: 12,
      hitHeight: 16,
      rotation: -10,
      priority: 12,
    },
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
    logoPath: "/assets/logos/google.svg",
    hotspot: {
      x: 36,
      y: 30.5,
      width: 9.5,
      height: 13,
      hitWidth: 12,
      hitHeight: 16,
      rotation: -4,
      priority: 12,
    },
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
    logoPath: "/assets/logos/nvidia.svg",
    hotspot: {
      x: 50,
      y: 30,
      width: 10,
      height: 13.5,
      hitWidth: 12.5,
      hitHeight: 16.5,
      rotation: 0,
      priority: 13,
    },
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
    logoPath: "/assets/logos/microsoft.svg",
    hotspot: {
      x: 64,
      y: 30.5,
      width: 9.5,
      height: 13,
      hitWidth: 12,
      hitHeight: 16,
      rotation: 4,
      priority: 12,
    },
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
    logoPath: "/assets/logos/amazon.svg",
    hotspot: {
      x: 78,
      y: 31.5,
      width: 9.5,
      height: 13,
      hitWidth: 12,
      hitHeight: 16,
      rotation: 10,
      priority: 12,
    },
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
    hotspot: {
      x: 22,
      y: 53.5,
      width: 10.5,
      height: 14.5,
      hitWidth: 13,
      hitHeight: 17.5,
      rotation: -10,
      priority: 22,
    },
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
    logoPath: "/assets/logos/tesla.svg",
    hotspot: {
      x: 36,
      y: 52.5,
      width: 10.5,
      height: 14.5,
      hitWidth: 13,
      hitHeight: 17.5,
      rotation: -4,
      priority: 22,
    },
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
    hotspot: {
      x: 50,
      y: 51.5,
      width: 11,
      height: 15,
      hitWidth: 13.5,
      hitHeight: 18,
      rotation: 0,
      priority: 25,
    },
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
    logoPath: "/assets/logos/nasdaq100.svg",
    hotspot: {
      x: 64,
      y: 52.5,
      width: 10.5,
      height: 14.5,
      hitWidth: 13,
      hitHeight: 17.5,
      rotation: 4,
      priority: 22,
    },
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
    hotspot: {
      x: 78,
      y: 53.5,
      width: 10.5,
      height: 14.5,
      hitWidth: 13,
      hitHeight: 17.5,
      rotation: 10,
      priority: 22,
    },
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

/** Visual order for keyboard focus through basket eggs. */
export const basketFocusOrder = basketAssets.map((asset) => asset.id);
