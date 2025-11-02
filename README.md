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

## Vapi Voice Assistant

Flourish includes a voice assistant powered by Vapi that can provide recommendations and insights about shopping centres through natural voice conversations.

### Setup

1. **Configure Environment Variables**
   - Add `VAPI_PRIVATE_KEY` and `VAPI_PUBLIC_KEY` to your `.env` file (see `.env.example`)
   - These are for reference; actual configuration happens in the Vapi dashboard

2. **Deploy Your Application**
   - Ensure your Flourish app is deployed and accessible
   - All Vapi API endpoints require authentication

3. **Create Vapi Assistant**
   - **Option A (Recommended)**: Use the API endpoint to create automatically:
     - Deploy your app first
     - As an admin user, call `POST /api/vapi/create-assistant`
     - Or run locally: `pnpm vapi:create-assistant`
   - **Option B**: Manual setup via Vapi dashboard:
     - See `VAPI_SETUP.md` for detailed step-by-step instructions
     - Reference `vapi-assistant-config.json` for function schemas

### Available API Endpoints

All endpoints are located under `/api/vapi/` and require Clerk authentication:

- `POST /api/vapi/location-search` - Search locations by name
- `POST /api/vapi/location-details` - Get location details
- `POST /api/vapi/local-recommendations` - Get local area recommendations
- `POST /api/vapi/tenant-gap-analysis` - Compare with competitors
- `POST /api/vapi/nearby-competitors` - Find nearby competitors

### Using the Assistant

1. Navigate to `/assistant` in the Flourish app (available in authenticated navigation)
2. Click "Start Call" to begin a voice conversation
3. Ask questions like:
   - "Tell me about Manchester Arndale"
   - "What recommendations do you have for Bluewater Shopping Centre?"
   - "Compare The Trafford Centre with nearby competitors"

### Documentation

- **Setup Guide**: See `VAPI_SETUP.md` for complete configuration instructions
- **Function Schemas**: See `src/lib/vapi-functions.ts` for API function definitions
- **Reference Config**: See `vapi-assistant-config.json` for example configuration
