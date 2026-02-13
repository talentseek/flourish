# Architecture Reference

## Directory Structure

```
flourish/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/                # Login page
│   │   │   ├── sign-up/              # Registration
│   │   │   ├── forgot-password/      # Password recovery
│   │   │   └── reset-password/       # Password reset
│   │   ├── admin/                    # Admin panel (ADMIN role required)
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── locations/            # Location CRUD management
│   │   │   └── users/                # User management
│   │   ├── api/                      # 31 API routes
│   │   │   ├── admin/                # Admin endpoints (enrichment, promote)
│   │   │   ├── analytics/            # Category distribution, gap analysis, tenant comparison
│   │   │   ├── auth/[...all]/        # BetterAuth catch-all handler
│   │   │   ├── chat/                 # AI chat endpoint
│   │   │   ├── contact/              # Contact form submission
│   │   │   ├── locations/            # Location listing + enriched map data
│   │   │   ├── rh-chat/              # RivingtonHark branded AI chat
│   │   │   └── vapi/                 # 12 VAPI voice assistant endpoints
│   │   ├── assistant/                # VAPI voice assistant UI
│   │   ├── book-appointment/         # Appointment booking
│   │   ├── dashboard/                # Authenticated workspace
│   │   │   ├── page.tsx              # Main dashboard with metrics
│   │   │   ├── admin/                # Admin sub-dashboard (enrichment stats)
│   │   │   └── regional/             # Regional manager view
│   │   ├── dashboard2/               # V2 dashboard with staged workflow
│   │   ├── enrichmentmap/            # Geographic enrichment coverage map
│   │   ├── gap-analysis/             # Tenant gap discovery tool
│   │   ├── landsec/                  # Landsec branded client portal
│   │   ├── locations/[slug]/         # Public location detail pages
│   │   ├── outreach/                 # Gap-based outreach workflows
│   │   ├── outreachwestwood/         # Westwood Cross specific outreach
│   │   ├── reports/                  # Report pages (Queensgate, dynamic)
│   │   ├── rivingtonhark/            # RivingtonHark branded portal
│   │   ├── v2/                       # V2 landing page
│   │   ├── layout.tsx                # Root layout (BetterAuth, theme, sidebar)
│   │   └── page.tsx                  # Marketing landing page
│   ├── components/                   # 106 React components
│   │   ├── ui/                       # 34 shadcn/ui primitives
│   │   ├── dashboard2/               # Dashboard V2 stage components
│   │   ├── enrichment/               # Map controls, enrichment visualisation
│   │   ├── regional/                 # Regional dashboard components
│   │   └── [feature].tsx             # Feature-specific components
│   ├── lib/                          # 16 utility modules
│   │   ├── auth.ts                   # BetterAuth server config
│   │   ├── auth-client.ts            # BetterAuth client
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── analytics.ts              # Haversine distance, category distribution
│   │   ├── enrichment-metrics.ts     # Enrichment tier classification
│   │   ├── enrichment-scoring.ts     # Enrichment scoring logic
│   │   ├── gap-analysis.ts           # Gap discovery algorithms
│   │   ├── tenant-comparison.ts      # Tenant comparison engine
│   │   ├── rbac.ts                   # Role-based access control helpers
│   │   ├── slug-utils.ts             # URL slug generation
│   │   ├── sync-user.ts              # User sync from auth
│   │   ├── utils.ts                  # cn() Tailwind merge utility
│   │   ├── vapi-*.ts                 # 4 VAPI integration modules
│   │   └── gap-analysis.ts           # Gap analysis engine
│   ├── middleware.ts                  # Route protection middleware
│   ├── types/                        # TypeScript type definitions
│   └── styles/                       # Global CSS
├── prisma/
│   ├── schema.prisma                 # 12 models, 305 lines
│   ├── seed.ts                       # Demo data seeder (tsx)
│   ├── ingest-properties.ts          # Bulk CSV location import
│   ├── geocode-*.ts                  # Geocoding scripts
│   └── migrations/                   # 8 migration files
├── scripts/                          # 560+ operational scripts
│   ├── enrich-*.ts                   # ~250 enrichment scripts
│   ├── audit-*.ts / check-*.ts       # ~80 auditing/verification scripts
│   ├── import-*.ts                   # ~15 data import scripts
│   ├── fix-*.ts / repair-*.ts        # ~20 data repair scripts
│   └── reporting/                    # Report generation scripts
├── docs/                             # 76 plan documents (PLAN-*.md)
├── public/                           # 104 static assets (images, logos)
├── .agent/                           # Agent framework
│   ├── agents/                       # 16 specialist agents
│   ├── skills/                       # 40+ skills
│   ├── workflows/                    # 11 slash command workflows
│   └── ARCHITECTURE.md               # Agent framework overview
├── package.json                      # pnpm, Node 20.x
├── tailwind.config.ts                # Tailwind + shadcn theme tokens
├── next.config.js                    # Next.js config
├── vercel.json                       # Vercel deployment config
└── tsconfig.json                     # TypeScript config
```

## Authentication Architecture

- **Library:** BetterAuth (replaced Clerk in Jan 2026)
- **Server config:** `src/lib/auth.ts` — Prisma adapter, email/password provider
- **Client config:** `src/lib/auth-client.ts` — BetterAuth React client
- **Middleware:** `src/middleware.ts` — Cookie-based route protection
- **Session Cookie:** `better-auth.session_token`
- **Protected Routes:** `/dashboard/*`, `/admin/*`
- **Auth Routes:** `/login`, `/sign-up`, `/forgot-password`, `/reset-password`
- **Roles:** `USER` (default), `ADMIN` (full access), `REGIONAL_MANAGER` (scoped to assigned locations)
- **RBAC:** `src/lib/rbac.ts` — Role checking helpers
- **Session:** Custom `additionalFields` exposes `role` in session data

## Deployment

- **Platform:** Vercel
- **Build command:** `prisma generate && next build`
- **Framework:** Next.js 14
- **Node version:** 20.x
- **Config:** `vercel.json` (minimal), `next.config.js` (image domains, experimental features)
- **Environment:** All secrets in Vercel environment variables

## Design System

- **CSS Framework:** Tailwind CSS 3.3 with `tailwindcss-animate`
- **Component Library:** shadcn/ui (34 installed primitives)
- **Theme:** CSS custom properties for dark/light mode via `next-themes`
- **Utility:** `cn()` function using `clsx` + `tailwind-merge`
- **Configuration:** `components.json` for shadcn/ui, `tailwind.config.ts` for theme tokens
