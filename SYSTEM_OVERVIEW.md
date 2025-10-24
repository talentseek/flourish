Purpose

- `src/app/page.tsx:27` shows the marketing landing page positioning Flourish as an AI assistant for retail property teams (gap analysis, outreach, reports).
- `src/app/dashboard/page.tsx:12` renders the authenticated workspace with live metrics, quick links and scenario cards for analysts.
- `src/app/gap-analysis/page.tsx:20` loads the full location + tenant dataset into an exploratory tool for gap discovery.
- `src/app/gap-fulfillment/page.tsx:33` and `src/app/gap-fulfillment/outreach/[...]` simulate post-analysis workflows (gap selection, outreach, analytics) to showcase the end-to-end story.

Architecture

- Next.js 14 (App Router, server components, Tailwind, shadcn/ui) with Clerk auth per `package.json:1` and `src/app/layout.tsx:1`.
- Prisma ORM targeting Postgres; rich domain models for `Location`, `Tenant`, `Category` define the enrichment surface (`prisma/schema.prisma:21`).
- Component library split across `src/components` for shared UI (maps, tables, sidebars) and feature-specific clients like `gap-analysis-content` and `location-details`.
- Vercel-oriented deployment config (`vercel.json:1`) and pnpm scripts for build + Prisma lifecycle (`package.json:8`).

Environment & Tooling

- Required secrets: Postgres `DATABASE_URL`, Clerk keys, Google Maps key (`.env.example:1`); current example points at a hosted database—treat credentials carefully.
- Local bootstrap: `pnpm install`, `pnpm dev` with optional migrations/seeding commands outlined in `README.md:3`.
- Tailwind + shadcn configured via `tailwind.config.ts:1` and `components.json:1`; Design tokens live in CSS vars for dark/light mode.
- Tabs in VS Code / Scripts folder give utility tooling for data hygiene (backfills, imports, coords).

Data & Enrichment Flow

- Bulk location import (`prisma/ingest-properties.ts:124`) creates records from canonical CSV, initially stubbing lat/long and filling KPI columns.
- Postcode geocoding closes the loop, updating zeroed coordinates in batches (`prisma/geocode-with-postcodes-io.ts:53`).
- Tenant/category normalization handled by `scripts/backfill-categories.ts:1`, populating FK links for taxonomy consistency.
- Downstream consumers convert Prisma decimals/JSON to consumable props before rendering analytics UIs (`src/app/gap-analysis/page.tsx:28`, `src/components/location-details.tsx:190`).

API Surface

- `GET /api/locations` exposes lightweight location listings for client pickers (`src/app/api/locations/route.ts:1`).
- Analytics endpoints (`src/app/api/analytics/category-distribution/route.ts:1` & `largest-category-within-radius`) wrap `src/lib/analytics.ts:27` distance math for peer analysis.
- Admin helpers: promote roles (`src/app/api/admin/promote-user/route.ts:7`), sync users (`src/app/api/sync-user/route.ts:1`), Clerk webhook ingestion for role mirroring (`src/app/api/clerk/webhook/route.ts:7`), and debug utilities.
- No current endpoint computes enrichment coverage—counts are inferred ad hoc on the server components today.

Current Admin Dashboard

- `src/app/dashboard/admin/page.tsx:10` restricts access to Clerk admins, then lists database users with simple totals—no operational KPIs yet.
- `src/app/dashboard/admin/admin-actions.tsx:12` provides manual user promotion buttons but “Sync All Users” / “View System Logs” are placeholders.
- There is no visibility into 2,626-location enrichment progress, missing fields, or SLA pacing within the admin workspace.

Observations & Risks

- `.env.example:5` ships a live Postgres URI; rotate credentials and ensure secrets aren’t committed.
- Seed data (`prisma/seed.ts:120`) is demo-scale; importing the full 2,626 set depends on private CSVs in `/public` and the Peterborough importer—document their storage and access.
- Enrichment completeness is implicit; without persisted status flags it must be recomputed each request, and “latitude = 0” remains a tell for incomplete geocoding.
- Outreach and analytics views are currently mock-driven; ensure stakeholders know which insights are placeholder vs production-ready.

Dashboard Plan

1. Define enrichment tiers in a new helper (e.g. `src/lib/enrichment-metrics.ts`) that maps a location into buckets such as `Core` (name/address/type), `Geo` (valid lat/long), `Operational` (stores/parking/anchor counts), `Commercial` (KPI columns like `healthIndex`/`vacancy`), `Digital` (social + ratings), `Demographic` (population/income) using the Prisma schema fields (`prisma/schema.prisma:45` onward).
2. Add a server function or API endpoint (e.g. `GET /api/admin/enrichment-stats`) that aggregates counts, coverage percentages, and outstanding gaps via Prisma `count`/`aggregate`, optionally capturing per-location missing-field lists for drilldown.
3. Extend `src/app/dashboard/admin/page.tsx:33` to fetch the new metrics, replacing the user-only cards with progress visuals: total locations, enriched counts by tier, progress bar towards the 2,626 goal, and a table of “needs enrichment” locations with key missing attributes.
4. Layer in time-based insights by storing daily snapshots (new `EnrichmentSnapshot` table or scheduled script) so the dashboard can report velocity and forecast completion dates.
5. Provide CSV export / deep links so data stewards can jump from the dashboard to the gap-analysis workspace filtered on low-enrichment locations.

Next steps

1. Prototype `lib/enrichment-metrics` with unit tests that feed mocked location records and assert tier classification.
2. Build the admin metrics query (server action or API route) and wire cards/progress UI into `dashboard/admin` with placeholder design tokens.
3. Run against a realistic dataset (import via `prisma/ingest-properties.ts` + geocode script) to validate counts, then iterate with stakeholders on tier thresholds & goal tracking.

