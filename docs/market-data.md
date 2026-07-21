# Market Data Integration

## Provider

**Primary provider:** [Twelve Data](https://twelvedata.com/)

The integration lives under `src/lib/market-data/` with a provider abstraction so another source (Massive, Finnhub) can be substituted without UI changes.

## Environment variables

| Variable | Description |
|----------|-------------|
| `MARKET_DATA_PROVIDER` | `twelve-data` (production default) or `mock` (development/tests only) |
| `TWELVE_DATA_API_KEY` | Server-only API key from Twelve Data |

**Vercel:** add `TWELVE_DATA_API_KEY` in **Project Settings → Environment Variables** for Production and Preview. Redeploy after adding the key.

Never:

- Commit the real API key
- Prefix the key with `NEXT_PUBLIC_`
- Return the key from API routes or client bundles

## Endpoints used

| Endpoint | Purpose |
|----------|---------|
| `GET /quote` | Batch quotes for all public assets |
| `GET /time_series` | Historical OHLCV candles |
| `GET /statistics` | Market capitalization (equities, cached ~6 hours) |

Internal Next.js routes:

- `GET /api/market/quotes`
- `GET /api/market/history?asset=aapl&range=1M`

## Symbol mapping

| Asset | Display | Twelve Data symbol |
|-------|---------|-------------------|
| Apple | AAPL | AAPL |
| Alphabet | GOOGL | GOOGL |
| NVIDIA | NVDA | NVDA |
| Microsoft | MSFT | MSFT |
| Amazon | AMZN | AMZN |
| Meta | META | META |
| Tesla | TSLA | TSLA |
| S&P 500 | SPX | SPX |
| Nasdaq-100 | NDX | NDX |
| SpaceX | — | *(excluded — private company)* |

**Index note:** SPX and NDX require index coverage on your Twelve Data plan. If unavailable, the UI shows *“Index data unavailable on current provider plan”* — we do **not** substitute SPY or QQQ.

## Data timing and labels

- **Free / basic plans:** U.S. equities are typically **delayed (~15 minutes)**. The UI labels this as “Delayed 15 min”, not “Live”.
- **Indexes:** availability and delay depend on plan tier.
- **Market state:** derived from provider `is_market_open` when present, with a U.S. Eastern hours fallback (including holidays in `market-hours.ts`).
- **Timestamps:** shown in Eastern Time from the provider quote timestamp when available.

## Refresh and caching

Configured in `src/lib/market-data/config.ts`:

| Session | Client poll | Server cache |
|---------|-------------|--------------|
| Regular hours | ~30s | ~20s |
| Extended hours | ~60s | ~45s |
| Closed | ~10 min | ~8 min |

Historical candles are cached ~5 minutes per asset/range. Market cap statistics ~6 hours.

## Rate limits

HTTP **429** responses are not retried aggressively. Transient errors use limited exponential backoff (max 2 retries). Request deduplication prevents duplicate in-flight calls.

## Attribution

Footer includes: *“Market data provided by Twelve Data.”*

Review [Twelve Data terms](https://twelvedata.com/) for your plan’s redistribution and display requirements before public production use. A free development tier may not permit unrestricted public redistribution — upgrade if required.

## Mock provider

Set `MARKET_DATA_PROVIDER=mock` for local development without an API key. Mock mode shows a **Development mock data** indicator and must not be used in production builds by default.

## Tests

```bash
npm test
```

Unit tests mock upstream responses — no live API calls during CI.
