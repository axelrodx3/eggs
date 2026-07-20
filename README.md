# $EGGS

One-page launch site for the **$EGGS** memecoin — premium black-and-lime aesthetic with an interactive basket inspector and market watch.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Recharts (mini charts)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Basket artwork

Place the transparent high-resolution basket PNG at:

```text
public/assets/eggs-basket.png
```

Until that file exists, the site renders a documented placeholder in the hero and inspector.

Hotspot coordinates live in `src/data/assets.ts` and can be tuned after the final artwork is inserted.

## Market data

Market quotes are fetched through a server route:

```text
GET /api/market
```

Configure provider settings in `.env.local` (see `.env.example`):

```env
MARKET_DATA_PROVIDER=mock
MARKET_DATA_API_KEY=
```

### Connecting a real provider later

1. Implement a new provider in `src/lib/market-data/` that satisfies `MarketDataProvider`.
2. Register it in `src/lib/market-data/provider.ts`.
3. Set `MARKET_DATA_PROVIDER` in the server environment.
4. Keep API keys server-side only — the browser should never receive provider secrets.

Development uses clearly labeled **demo data** via the mock provider. Do not present demo quotes as live market data in production.

## Editable content

| File | Purpose |
| --- | --- |
| `src/data/site-config.ts` | Brand copy, Robinhood URL, social links |
| `src/data/assets.ts` | Basket assets + hotspot coordinates |
| `src/data/tokenomics.ts` | Distribution categories / percentages |
| `src/data/faq.ts` | FAQ entries |

## Scripts

```bash
npm run lint
npm run build
```

## Git remote

```text
origin  https://github.com/axelrodx3/eggs.git
```

## Disclaimers

This site is informational. Holding $EGGS does not automatically constitute ownership of the displayed securities. No wallet connection, rewards claiming, or live token metrics are implemented on this page.
