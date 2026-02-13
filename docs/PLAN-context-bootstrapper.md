# PLAN: Context Bootstrapper Skill

> **Goal:** Create a reusable `.agent/skills/context-bootstrapper` skill that any new agent session can invoke to rapidly understand the full codebase, architecture, conventions, and domain context — eliminating the slow "cold start" problem.

---

## Problem Statement

Every new agent session starts from zero. It must re-discover the tech stack, directory layout, Prisma schema, API routes, component library, enrichment pipelines, and business domain before it can do useful work. This wastes significant time and context window on repetitive exploration. A structured bootstrapper skill solves this by providing a **pre-curated, layered context injection** that an agent reads in under 60 seconds.

---

## Design Principles

| Principle | Application |
|-----------|------------|
| **Progressive Disclosure** | Core snapshot in SKILL.md → Deep references loaded on demand |
| **Minimal Context Cost** | Only what agents *need* — no verbose prose, no redundant docs |
| **Living Document** | References are easy to regenerate/update as the project evolves |
| **Script-Assisted** | Python script scans the codebase and generates/refreshes reference files automatically |

---

## Proposed Skill Structure

```
context-bootstrapper/
├── SKILL.md                          # Core instructions + inline project snapshot
├── scripts/
│   └── generate_context.py           # Auto-generates reference files from live codebase
└── references/
    ├── architecture.md               # Tech stack, directory map, design patterns
    ├── data-model.md                 # Prisma schema summary + model relationships
    ├── api-surface.md                # All API routes with method, auth, purpose
    ├── components.md                 # UI component inventory with locations
    ├── conventions.md                # Coding patterns, naming, file organisation rules
    └── domain-context.md             # Business domain: what Flourish does, key entities, workflows
```

---

## File-by-File Breakdown

### [NEW] `.agent/skills/context-bootstrapper/SKILL.md`

The main instruction file. Contains:

1. **Frontmatter** — name, description, trigger keywords: `"new session"`, `"bootstrap context"`, `"onboard agent"`, `"understand codebase"`, `"context load"`
2. **Quick Start Protocol** — Step-by-step checklist an agent follows:
   - Step 1: Read this SKILL.md (inline project snapshot)
   - Step 2: Read `references/architecture.md` for full directory + tech stack map
   - Step 3: Read `references/data-model.md` for Prisma schema understanding
   - Step 4: Read additional references only if relevant to the task at hand
3. **Inline Project Snapshot** — A concise (~100 line) summary embedded directly in SKILL.md covering:
   - Project name, purpose, business domain
   - Tech stack (Next.js 14, Prisma/Postgres, BetterAuth, Tailwind CSS, shadcn/ui, Vercel)
   - Key directories (`src/app`, `src/lib`, `src/components`, `prisma`, `scripts`, `.agent`)
   - Database models (Location, Tenant, Category, User + auth models)
   - Critical paths: auth flow, data enrichment pipeline, gap analysis, VAPI voice assistant
   - Environment requirements (DATABASE_URL, auth keys, Google Maps key)
   - Common commands (`pnpm dev`, `pnpm build`, Prisma scripts)
4. **When to Regenerate** — Instructions to run the generation script after major changes

### [NEW] `references/architecture.md`

Deep architecture reference (~150 lines). Covers:

- **Directory Tree** — Full annotated map of `src/app/` routes, `src/lib/` modules, `src/components/` inventory
- **Route Architecture** — All 17+ app routes with purpose (landing, dashboard, admin, gap-analysis, RivingtonHark portal, reports, enrichment map, VAPI assistant)
- **Auth Architecture** — BetterAuth flow with roles (USER, ADMIN, REGIONAL_MANAGER), middleware, session management
- **Deployment** — Vercel config, build pipeline (`prisma generate && next build`), environment variables
- **Agent Framework** — 16 agents, 40 skills, 11 workflows in `.agent/`

### [NEW] `references/data-model.md`

Prisma schema reference (~120 lines). Covers:

- **Core Models** — Location (90+ fields across 8 tiers: Core, Geo, Operational, Commercial, Digital, Social, SEO, Demographic), Tenant, Category
- **Auth Models** — User, Session, Account, Verification, Organization, Member, Invitation
- **Enums** — Role (USER/ADMIN/REGIONAL_MANAGER), LocationType (SHOPPING_CENTRE/RETAIL_PARK/OUTLET_CENTRE/HIGH_STREET)
- **Key Relations** — Location→Tenant (1:many), Tenant→Category (many:1), Category self-referencing hierarchy
- **Analytics Models** — EnrichmentSnapshot for tracking data completeness over time
- **Enrichment Tiers** — Which fields constitute each tier of data completeness

### [NEW] `references/api-surface.md`

API route inventory (~80 lines). Covers:

- **Public API** — Location listing, analytics endpoints (category distribution, radius analysis)
- **Admin API** — User promotion, enrichment stats, sync utilities
- **Auth API** — BetterAuth routes under `/api/auth/`
- **VAPI Endpoints** — Voice assistant function endpoints (location-search, details, recommendations, gap-analysis, competitors)
- **Webhooks** — Contact form submission
- **For each route**: HTTP method, auth requirement, request/response shape summary

### [NEW] `references/components.md`

Component inventory (~80 lines). Covers:

- **Layout Components** — Navbar, sidebar, footer patterns
- **Data Display** — Location details, tenant tables, analytics charts (Recharts)
- **Maps** — Leaflet/Google Maps integration components
- **Forms** — Contact forms, search/filter components
- **shadcn/ui Components** — Which Radix primitives are installed and configured
- **Feature Components** — Gap analysis, RivingtonHark portal, enrichment map, dashboard cards

### [NEW] `references/conventions.md`

Coding conventions (~60 lines). Covers:

- **File Naming** — kebab-case for files, PascalCase for components
- **Server vs Client** — Server Components default, `"use client"` for interactivity
- **Data Fetching** — Server components with Prisma, Decimal→number conversion patterns
- **Styling** — Tailwind + CSS variables for dark/light mode, `cn()` utility
- **Scripts** — TypeScript scripts in `scripts/` run with `tsx`, Python scripts for scraping
- **Import Patterns** — `@/` alias for `src/`, component imports from `@/components/ui/`
- **Error Handling** — Established patterns for API routes and server actions

### [NEW] `references/domain-context.md`

Business domain reference (~80 lines). Covers:

- **What is Flourish** — AI-powered retail property intelligence platform for UK shopping centres, retail parks, and outlet centres
- **Core Workflows** — Data ingestion → enrichment → gap analysis → outreach → reporting
- **Data Scale** — 2,600+ locations with multi-tier enrichment (Core → Geo → Operational → Commercial → Digital → Demographic)
- **Key Features** — Interactive maps, gap analysis, tenant comparison, enrichment tracking, VAPI voice assistant, regional manager dashboards
- **Client Portals** — RivingtonHark branded portal, Landsec portal, report generators
- **Enrichment Pipeline** — 560+ scripts for batch enrichment (Google Places, Firecrawl, census data, social media, SEO)
- **Related Ecosystem** — B2BEE umbrella (SalesBee, BuzzBook, BeeSocial), ParkBunny parking reports

### [NEW] `scripts/generate_context.py`

Auto-generation script that scans the live codebase and produces/refreshes the reference files. Features:

- **Directory scanner** — Walks `src/app/`, `src/lib/`, `src/components/` to build route and component maps
- **Prisma parser** — Reads `schema.prisma` and extracts models, fields, relations, enums
- **API route scanner** — Finds all `route.ts` files and extracts HTTP methods and auth patterns
- **Package.json reader** — Extracts tech stack from dependencies
- **Output** — Writes updated reference files to `references/`
- **Idempotent** — Safe to re-run; overwrites existing reference files with fresh data

---

## Workflow Integration

### New Workflow: `/bootstrap`

Create `.agent/workflows/bootstrap.md` that:
1. Triggers the context-bootstrapper skill
2. Reads SKILL.md for the inline snapshot
3. Reads relevant reference files based on the task type
4. Outputs a confirmation of what was loaded

---

## Verification Plan

### Automated Validation
```bash
# Validate skill structure
python .agent/skills/skill-creator/scripts/validate_skill.py .agent/skills/context-bootstrapper
```

### Manual Verification
1. **Structure Check** — Verify all files exist in the correct locations
2. **Content Accuracy** — Cross-reference generated references against actual codebase:
   - Does `architecture.md` match the real directory structure?
   - Does `data-model.md` accurately reflect `prisma/schema.prisma`?
   - Does `api-surface.md` list all actual API routes?
3. **Script Test** — Run `generate_context.py` and verify it produces valid, accurate reference files
4. **Cold Start Test** — Start a new agent conversation, invoke the bootstrapper, and verify the agent can immediately answer questions about the codebase without additional exploration

---

## Task Breakdown

| # | Task | Estimated Effort |
|---|------|-----------------|
| 1 | Initialize skill with `init_skill.py` | Quick |
| 2 | Write SKILL.md with frontmatter + inline snapshot + protocol | Medium |
| 3 | Write `references/architecture.md` | Medium |
| 4 | Write `references/data-model.md` | Medium |
| 5 | Write `references/api-surface.md` | Medium |
| 6 | Write `references/components.md` | Medium |
| 7 | Write `references/conventions.md` | Light |
| 8 | Write `references/domain-context.md` | Medium |
| 9 | Write `scripts/generate_context.py` | Heavy |
| 10 | Create `/bootstrap` workflow | Light |
| 11 | Run validation + verify accuracy | Medium |

---

## Agent Assignment

| Agent | Role |
|-------|------|
| `explorer-agent` | Codebase scanning for reference generation |
| `documentation-writer` | Reference file authoring |
| `skill-creator` | Skill structure + validation |
