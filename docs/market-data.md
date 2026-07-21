# Market Data Integration

## Provider

**Primary provider:** [Finnhub](https://finnhub.io/)

The integration lives under `src/lib/market-data/` with a provider abstraction so another source can be substituted without UI changes.

## Environment variables

| Variable | Description |
|----------|-------------|
| `MARKET_DATA_PROVIDER` | `finnhub` (production default) or `mock` (development/tests only) |
| `FINNHUB_API_KEY` | Server-only API key from Finnhub |

**Vercel:** add `FINNHUB_API_KEY` in **Project Settings → Environment Variables** for Production and Preview. Redeploy after adding the key.

Never:

- Commit the real API key
- Prefix the key with `NEXT_PUBLIC_`
- Return the key from API routes or client bundles

## Endpoints used

| Finnhub endpoint | Purpose |
|------------------|---------|
| `GET /quote` | Current quote per symbol |
| `GET /stock/candle` | Historical OHLCV candles |

Internal Next.js routes:

- `GET /api/market/quotes`
- `GET /api/market/history?asset=aapl&range=1M`

## Symbol mapping

| Asset | Display | Finnhub symbol |
|-------|---------|----------------|
| Apple | AAPL | AAPL |
| Alphabet | GOOGL | GOOGL |
| NVIDIA | NVDA | NVDA |
| Microsoft | MSFT | MSFT |
| Amazon | AMZN | AMZN |
| Meta | META | META |
| Tesla | TSLA | TSLA |
| S&P 500 | SPX | ^GSPC |
| Nasdaq-100 | NDX | ^NDX |
| SpaceX | — | *(excluded — private company)* |

**Index note:** Finnhub’s free retail API may not return live index quotes for ^GSPC / ^NDX. If unavailable, the UI shows **“Unavailable”** — we do **not** substitute ETF proxies as index pricing.

**Chart note:** Finnhub’s free tier does not include `/stock/candle` historical data. For equities with live quotes, the inspector chart uses an **approximate trend** anchored to the current price (previous close → live quote). Indexes show no chart when data is unavailable.

## Caching

Configured in `src/lib/market-data/config.ts`:

| Setting | Value |
|---------|-------|
| Server quote cache | 90–120 seconds |
| Client poll interval | 90–120 seconds |
| History cache | ~5 minutes |

In-memory server cache is per serverless instance on Vercel (not globally shared).

## Rate limits

Finnhub free tier: 60 API calls/minute. The service fetches one quote per public asset in parallel (~9 calls), cached for 90 seconds. HTTP **429** responses are not retried aggressively.

## Attribution

Footer includes: *“Market data provided by Finnhub.”*

Review [Finnhub terms](https://finnhub.io/terms-of-service) for redistribution requirements before public production use.

## Mock provider

Set `MARKET_DATA_PROVIDER=mock` for local development without an API key. Mock mode shows a **Development mock data** indicator.

## Tests

```bash
npm test
```

Unit tests mock upstream responses — no live API calls during CI.
