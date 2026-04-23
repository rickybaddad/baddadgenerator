# NRL Model

Production-ready Next.js + Prisma application for NRL model-vs-market analysis, designed for GitHub → Vercel deployment with Neon Postgres.

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma + PostgreSQL (Neon)
- Zod config validation
- date-fns, axios, cheerio
- Vercel serverless API routes + optional cron

## Environment Variables

Set these in Vercel Project Settings:

- `DATABASE_URL`
- `ODDS_API_KEY`
- `ODDS_API_REGION` (default `au`)
- `ODDS_API_MARKETS` (default `h2h`)
- `STARTING_ELO` (default `1500`)
- `K_FACTOR` (default `30`)
- `HOME_ADVANTAGE_ELO` (default `50`)
- `VALUE_EDGE_THRESHOLD` (default `0.04`)
- `CONFIDENCE_MEDIUM_THRESHOLD` (default `0.03`)
- `CONFIDENCE_HIGH_THRESHOLD` (default `0.06`)

See `.env.example`.

## Deploy on Vercel + Neon

1. Create Neon database and copy the pooled connection string into `DATABASE_URL`.
2. Push repository to GitHub.
3. Import project into Vercel.
4. Configure all env vars above.
5. Run migrations once:
   - `npx prisma migrate deploy`
   - `npx prisma generate`
6. Trigger bootstrap via API endpoint.

## Data Flow

`POST /api/jobs/bootstrap` runs full pipeline:

1. seed teams + aliases
2. import history from Rugby League Project
3. calculate Elo ratings
4. import fixtures from NRL.com draw
5. import odds from The Odds API
6. generate predictions

Every job writes an `ImportRun` row and is built to be idempotent (upsert or append-by-timestamp logic).

## API Endpoints

### Read APIs

- `GET /api/matches`
- `GET /api/predictions`
- `GET /api/predictions/upcoming`

### Job APIs

- `POST /api/jobs/bootstrap`
- `POST /api/jobs/import-history`
- `POST /api/jobs/import-fixtures`
- `POST /api/jobs/import-odds`
- `POST /api/jobs/calculate-ratings`
- `POST /api/jobs/generate-predictions`

## Scraper Maintenance Guide

If source markup changes:

- `lib/scrapers/nrl.ts`: update selectors for team names, kickoff time, and match ID.
- `lib/scrapers/rugby-league-project.ts`: update table column mapping and score regex.
- Verify by running relevant job endpoint and inspecting `ImportRun.metadata.unmatched`.

## Local Verification (optional)

```bash
npm install
npx prisma generate
npm run test
npm run build
```

## Vercel Cron (optional)

`vercel.json` includes daily triggers for fixture, odds, and prediction refresh.
