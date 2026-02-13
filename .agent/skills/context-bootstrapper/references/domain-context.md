# Domain Context

## What is Flourish?

Flourish is an **AI-powered retail property intelligence platform** for the UK market. It serves retail property teams (asset managers, leasing agents, investment analysts) by providing data-driven insights on shopping centres, retail parks, outlet centres, and high streets.

## Core Value Proposition

Transform raw location data into actionable intelligence:
- **Gap Analysis** — Identify missing tenant categories and brand opportunities
- **Enrichment** — Build comprehensive location profiles from 50+ data sources
- **Reporting** — Generate investor-grade location reports with benchmarking
- **Outreach** — Facilitate tenant acquisition through gap-based outreach
- **Voice AI** — Natural language queries about location data via VAPI

## Data Scale

- **2,600+ locations** across the UK (shopping centres, retail parks, outlet centres, high streets)
- **90+ data fields per location** across 8 enrichment tiers
- **Tens of thousands of tenants** with category taxonomy
- **560+ scripts** for data enrichment, auditing, and maintenance

## Key Workflows

### 1. Data Ingestion
CSV import → `prisma/ingest-properties.ts` → creates Location records with core fields

### 2. Enrichment Pipeline
Progressive enrichment via 250+ scripts:
- **Geocoding** — Postcodes.io batch geocoding
- **Google Places** — Ratings, reviews, phone, website
- **Web scraping** — Tenant directories via Firecrawl/Crawl4AI
- **Demographic** — Census API data (population, income, car ownership)
- **Social media** — Instagram, Facebook, YouTube presence
- **SEO** — Keywords, top pages
- **Commercial KPIs** — Health index, vacancy rates (from canonical CSV sources)

### 3. Gap Analysis
Compare tenant mix against peers/benchmarks → identify missing categories → prioritise opportunities

### 4. Client Portals
Branded views for property management firms:
- **RivingtonHark** — `/rivingtonhark` — Regional manager dashboards with AI chat
- **Landsec** — `/landsec` — Portfolio overview

### 5. Reporting
Location-specific reports with maps, KPIs, tenant analysis. Export to PDF.

## User Roles

| Role | Access |
|------|--------|
| `USER` | Dashboard, gap analysis, reports |
| `ADMIN` | Full access: admin panel, location/user CRUD, enrichment management |
| `REGIONAL_MANAGER` | Scoped dashboard showing only assigned locations |

## Enrichment Tiers

Data completeness is tracked across 8 tiers (see `src/lib/enrichment-metrics.ts`):

1. **Core** — Name, type, address, city, county, postcode
2. **Geo** — Valid latitude/longitude (not 0,0)
3. **Operational** — Parking, floor area, stores, floors, anchor tenants
4. **Commercial** — Health index, vacancy, quality offer metrics
5. **Management** — Owner, management company, contacts
6. **Digital** — Website, phone, social media profiles
7. **Reviews** — Google/Facebook ratings and review counts
8. **Demographic** — Population, income, homeownership, car ownership

## Related Ecosystem

Flourish is part of a broader product ecosystem:

| Product | Repo | Purpose |
|---------|------|---------|
| **B2BEE / The Hive** | Separate | Central hub for B2BEE products |
| **SalesBee** | Separate | LinkedIn outreach automation |
| **BuzzBook** | Separate | Voice AI outreach platform |
| **BeeSocial** | Separate | Social media automation |
| **ParkBunny** | Within Flourish | Parking revenue reports (routes under `/reports`) |

## Key Third-Party Integrations

| Service | Usage |
|---------|-------|
| **BetterAuth** | Authentication and RBAC |
| **OpenAI** | AI chat for location insights |
| **VAPI** | Voice AI assistant |
| **Google Maps / Places** | Maps, geocoding, ratings |
| **Leaflet** | Interactive maps (enrichment map, regional dashboards) |
| **Postcodes.io** | UK postcode geocoding (free API) |
| **Firecrawl** | Web scraping for tenant directories |
| **Vercel** | Hosting and deployment |
