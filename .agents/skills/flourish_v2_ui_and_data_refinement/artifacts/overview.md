# Flourish AI - Codebase Walkthrough

> **Retail Property Intelligence & Gap Analysis Platform**

## 1. Tactical Architecture Summary
Flourish is a B2B SaaS platform targeting retail property landlords. It balances a high-fidelity marketing front-end with a data-dense analytical dashboard.

### Core Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Auth**: Clerk (Integrated via middleware) -> **Migrated to Better Auth**
- **Database**: PostgreSQL + Prisma ORM
- **UI Components**: shadcn/ui (Radix primitives) + Lucide Icons
- **Visuals**: Google Maps API, Recharts
- **Styling**: Tailwind CSS (Scoped via `v2-page-active` for the V2 Design Language)

---

## 2. Directory Map

| Directory | Purpose |
|-----------|---------|
| `src/app/` | App Router pages. `/` is the V2 Landing Page. `/dashboard2` is the product root. |
| `src/app/landsec/` | Personalized B2B enterprise portal pattern. |
| `src/components/` | Reusable React components. `v2-*.tsx` are landing page modules. Includes `demo-request-modal.tsx` leads capture. |
| `src/lib/` | Core business logic: `gap-analysis.ts`, `tenant-comparison.ts`, `vapi-*.ts`. |
| `src/app/api/` | Backend endpoints for data fetching and integration. |
| `prisma/` | Database schema (`schema.prisma`) and seed data. |
| `scripts/` | Data enrichment scripts (Enrichment, Auditing, Multi-layered imports). |
| `.agent/` | Antigravity Kit (Specialists, Skills, ARCHITECTURE.md). |

---

## 3. Database Schema Highlights
The schema is designed for multi-tier enrichment:
- **Location**: Stores 6-tier data (Core, Geo, Operational, Commercial, Digital, Demographic). Includes JSON fields for SEO and Top Pages.
- **Tenant**: Normalized records linking locations to categories. Supports `isAnchorTenant` flag for UI prioritization.
- **Category**: Hierarchical tree for normalized tenant mix reporting.
- **EnrichmentSnapshot**: Tracking daily data saturation progress.

---

## 4. Key Page Logic

### Main Landing Page (`/`)
Restored to a single-page scrolling layout using 13 modular V2 components. Managed via `v2-styles.css` and a global React lifecycle that toggles CSS scoping classes on mount/unmount.

### Landsec Demo Portal (`/landsec`)
High-fidelity enterprise sales tool. 
- **Pattern**: Custom brand colors (Navy #002855) + Flourish Lime.
- **Components**: Interactive Google Maps with custom SVG markers, Property Grids with state-synced filters, and Demo Request Popups (Dialogs).
- **Strategy**: Framed as Illustrative Analytics (Qualitative KPIs) + Professional Services (Space Activation). Uses "Identified" labels and "Significant Growth Potential" instead of hard numbers to maintain discovery flexibility.

### Analytics Dashboard (`/dashboard2`)
Product core featuring a 4-stage workflow: **Search -> Discover -> Compare -> Report**.

---

## 5. Core Business Engines

### Gap Analysis (`src/lib/gap-analysis.ts`)
Field-level metadata audit. Uses the `Relevant Location` filter to ensure percentages are calculated against statistically significant cohorts (e.g., parking gaps only for Shopping Centres).

### Tenant Comparison (`src/lib/tenant-comparison.ts`)
Category-level mix analysis. Calculates variance between a target location and N competitors, weighted by `CATEGORY_IMPORTANCE` scores. Detects "Missing Brands" (present in 50%+ of competitors but absent in target).

---

## 6. Automation & Enrichment
The platform relies on a sophisticated collection of scripts to reach 100% saturation:
- **Imports**: `import-westwood-tenants.ts` (Manual CSV saturation).
- **Enrichment**: `enrich-centre-margate.ts` (Multi-source API enrichment).
- **Auditing**: `audit-westwood-cross.ts` (Validation against the "Perfect Record" benchmark).
- **Extraction**: `firecrawl-tenant-enrichment.ts` (Agentic web scraping).

---

## 7. Special Demo Experiences
Flourish builds "Magic Box" experiences to provide high-impact visual proof of platform capabilities.

### Outreach Simulator (`/outreachwestwood`)
An animated, high-fidelity simulation of autonomous tenant prospecting.
- **Narrative**: Analyzes Westwood Cross -> Discovers 12 Jewellers -> Generates Personalized Emails -> Simulates Delivery.
- **Goal**: Demonstrate how Flourish solves vacancy (Outreach) rather than just reporting it (Analytics).
- **Stack**: React state machine, typewriter effect components, and curated prospect datasets.

---

## 9. Global Data Governance (Phase 21 & 22)
The project reached a "Global Scale" in January 2026, shifting from cluster-based enrichment to nation-wide data health.

### The Global Audit Standard
We transitioned to a rigorous "Green Audit" benchmark:
- **Requirement**: A location must have a valid `website`, >0 `parkingSpaces`, and at least one social media link (`facebook` or `instagram`).
- **Scope**: Expanded to **11 UK Regions** (Wales, NI, North East, North West, Yorkshire, East Mids, West Mids, East of England, South East, South West, London).

---

## 10. Accessibility & Theme Integration (Feb 2026)
Following a comprehensive audit, the landing page was remediated for color contrast and theme collisions.

### Forced Light Mode
To maintain brand integrity and Ensure accessibility (7.4:1 contrast for Fossil Grey text), the `ThemeProvider` in `layout.tsx` was configured to force the light theme (`defaultTheme="light"`, `enableSystem={false}`). This prevents "dark on dark" rendering issues for users with system dark mode enabled.

### Verified Color Palette
- **Fossil Grey (#4D4A46)**: Used for all text on light card backgrounds.
- **Lime Green (#E6FB60)**: Used as high-contrast text on dark backgrounds (NMTF section) and for interactive elements (buttons).

---
*Last Updated: February 5, 2026*
