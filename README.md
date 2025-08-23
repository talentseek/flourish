# Starter: Next.js + Tailwind + shadcn/ui + Clerk + Prisma

## Quick start
- `pnpm install`
- `pnpm dev`

## DB
- `pnpm prisma migrate dev --name init`
- Deploy: `pnpm prisma migrate deploy`

## Env
- Copy `.env.example` to `.env` and fill DATABASE_URL, Clerk keys.

## Roles
- Set user roles in Clerk public metadata: `{ "role": "admin" }`.
- Webhook upserts to Prisma automatically.
