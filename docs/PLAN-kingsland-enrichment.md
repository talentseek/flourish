# Plan: Kingsland Centre (Thatcham) Enrichment

> **Goal**: Update and deep-enrich *Kingsland Shopping Centre, Thatcham* using the newly discovered website: `https://kingslandcentre.co.uk/`.

## 1. Context
- **Target Location**: Kingsland Shopping Centre
- **City**: Thatcham
- **ID**: `cmicxw4gi000m13hx9mghuxqm`
- **Current State**: 
  - `website`: `null` (Missing)
  - `tenants`: Incomplete/Unknown
  - `parking`: 250 spaces (to verify)
  - `management`: Savills (to verify)

## 2. Methodology
We will use the `location-enrichment` skill patterns to "hydrate" this location.

### 2.1 Manual Update (Immediate)
- Update `website` field in DB to `https://kingslandcentre.co.uk/`.
- Update `name` if necessary (e.g., ensure it matches the website branding).

### 2.2 Automated Enrichment (Discovery)
- **Scrape Website**: Use `crawl4ai` (via `scripts/enrich-single-location.ts` if available, or custom script).
- **Extract Data**:
  - **Tenants**: List of stores (Waitrose, Costa, etc.). `div.store-list` or similar.
  - **Hours**: Opening times.
  - **Socials**: Facebook/Instagram types.
  - **Parking**: Verify capacity/price.

## 3. Workflow Steps

1.  **Update Database**: 
    -   Script `scripts/update-kingsland-url.ts` to set the URL.
2.  **Enrichment**:
    -   Create `scripts/enrich-kingsland.ts`.
    -   Use `Firecrawl` or `Cheerio` (or existing `location-enrichment` tools) to scrape the new URL.
    -   Parse and upsert `Tenant` records.
    -   Update `Location` fields (Socials, Hours).
3.  **Verification**:
    -   Check Enrichment Map score (should rise from Fair -> Good/Excellent).

## 4. Verification Checklist
- [ ] Website URL is set.
- [ ] Tenant list is populated (e.g., >5 tenants).
- [ ] Enrichment Score increases.
