---
name: context-bootstrapper
description: |
  Rapidly onboard a new agent session with full codebase understanding.
  Provides layered context: inline snapshot + deep reference files.
  Triggers: "new session", "bootstrap context", "onboard agent", "understand codebase",
  "context load", "what is this project", "codebase overview", "get up to speed".
---

# Context Bootstrapper

> **Purpose:** Eliminate cold-start overhead for new agent sessions by providing a structured, pre-curated context injection.

---

## Bootstrapping Protocol

Follow these steps in order. Stop early if you have enough context for the task.

1. **Read this file** — The inline snapshot below gives you the essentials.
2. **Read `references/architecture.md`** — Full directory map, routes, auth, deployment.
3. **Read `references/data-model.md`** — Prisma schema, models, relations, enrichment tiers.
4. **Task-specific references** — Load only what's relevant:
   - API work → `references/api-surface.md`
   - UI work → `references/components.md`
   - Coding standards → `references/conventions.md`
   - Business context → `references/domain-context.md`

---

## Project Snapshot (Flourish)

### Identity
- **Name:** Flourish
- **Domain:** AI-powered retail property intelligence platform for UK shopping centres, retail parks, and outlet centres
- **Scale:** 2,600+ locations with multi-tier data enrichment

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript 5 |
| Auth | BetterAuth (email/password, roles: USER, ADMIN, REGIONAL_MANAGER) |
| Database | PostgreSQL via Prisma ORM 5.x |
| Styling | Tailwind CSS 3.3 + shadcn/ui (34 components) |
| Maps | Leaflet + Google Maps |
| Charts | Recharts |
| AI | OpenAI (chat), VAPI (voice assistant) |
| Deploy | Vercel |
| Package Manager | pnpm |

### Key Directories
```
flourish/
├── src/
│   ├── app/           # 32 page routes + 31 API routes
│   ├── components/    # 106 components (+ 34 shadcn/ui primitives)
│   ├── lib/           # 16 utility modules (auth, analytics, db, gap-analysis, VAPI)
│   ├── middleware.ts   # Route protection (BetterAuth session cookie)
│   ├── types/         # TypeScript type definitions
│   └── styles/        # Global CSS
├── prisma/
│   ├── schema.prisma  # 12 models, 305 lines
│   ├── seed.ts        # Demo data seeder
│   └── migrations/    # Migration history
├── scripts/           # 560+ operational scripts (enrichment, auditing, imports)
├── .agent/            # Agent framework (16 agents, 40+ skills, 11 workflows)
├── docs/              # Plan files (76 plan documents)
└── public/            # Static assets (104 files)
```

### Core Database Models
| Model | Purpose | Key Fields |
|-------|---------|-----------|
| `Location` | Retail property | name, type, address, 90+ enrichment fields across 8 tiers |
| `Tenant` | Store within a location | name, category, subcategory, floor, isAnchorTenant |
| `Category` | Normalized taxonomy | name, self-referencing hierarchy |
| `User` | Auth user | email, role (USER/ADMIN/REGIONAL_MANAGER) |
| `EnrichmentSnapshot` | Data completeness tracking | tier counts, field-level stats |

### Location Types (Enum)
`SHOPPING_CENTRE` | `RETAIL_PARK` | `OUTLET_CENTRE` | `HIGH_STREET`

### Auth Flow
- BetterAuth with session cookie `better-auth.session_token`
- Middleware protects `/dashboard/*` and `/admin/*`
- Auth routes: `/login`, `/sign-up`, `/forgot-password`, `/reset-password`
- Role-based access: ADMIN for admin panel, REGIONAL_MANAGER for regional views

### Critical Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Production build (runs prisma generate first)
pnpm db:migrate       # Run Prisma migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed demo data
```

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth signing secret
- `BETTER_AUTH_URL` — Base URL for auth
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps
- `VAPI_PRIVATE_KEY` / `VAPI_PUBLIC_KEY` — Voice assistant

### Key Feature Areas
1. **Marketing Landing** — `/` and `/v2` (public-facing)
2. **Dashboard** — `/dashboard` (authenticated workspace with metrics)
3. **Admin Panel** — `/admin` (location/user management, CRUD)
4. **Gap Analysis** — `/gap-analysis` (tenant gap discovery tool)
5. **Enrichment Map** — `/enrichmentmap` (geographic data coverage visualization)
6. **Reports** — `/reports/*` (location-specific analysis reports)
7. **Client Portals** — `/rivingtonhark`, `/landsec` (branded client views)
8. **Voice Assistant** — `/assistant` (VAPI-powered voice AI)
9. **Outreach** — `/outreach/*` (gap-based outreach workflows)
10. **Regional Dashboard** — `/dashboard/regional` (REGIONAL_MANAGER view)

---

## Regenerating References

After major codebase changes, regenerate references:

```bash
python .agent/skills/context-bootstrapper/scripts/generate_context.py
```

This scans the live codebase and overwrites all files in `references/`.

---

## Resources

| Resource | Description |
|----------|-------------|
| `references/architecture.md` | Directory tree, routes, auth, deployment |
| `references/data-model.md` | Prisma schema digest with enrichment tiers |
| `references/api-surface.md` | All 31 API routes with methods and auth |
| `references/components.md` | 106 components + 34 shadcn/ui primitives |
| `references/conventions.md` | Coding patterns, naming, imports |
| `references/domain-context.md` | Business domain, workflows, ecosystem |
| `scripts/generate_context.py` | Auto-regenerate reference files |

---
