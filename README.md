# Starter: Next.js + Tailwind + shadcn/ui + Clerk + Prisma

## Quick start
- `pnpm install`
- `pnpm dev`

## DB
- `pnpm prisma migrate dev`
- Deploy: `pnpm prisma migrate deploy`

### Category normalization (new)
- We added `Tenant.categoryId` → `Category` FK for consistent categories.
- After migrating, run backfill:
  ```bash
  pnpm ts-node scripts/backfill-categories.ts
  ```
  This will upsert `Category` rows by tenant `category` and link `Tenant.categoryId`.

## Env
- Copy `.env.example` to `.env` and fill DATABASE_URL, Clerk keys.

## Analytics API
- Category distribution within a radius:
  - `GET /api/analytics/category-distribution?locationId=<id>&radiusKm=<n>` returns aggregated counts and percentages by category.

## Roles
- Set user roles in Clerk public metadata: `{ "role": "admin" }`.
- Webhook upserts to Prisma automatically.
