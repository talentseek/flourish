# Plan: Leamington Spa & Royal Priors Enrichment

> **Goal:** Rectify the "blind spot" in Leamington Spa by adding Royal Priors (using user-provided data) and enriching the surrounding key retail destinations.

## User Review Required
> [!IMPORTANT]
> **Zero Coverage Confirmed:** Diagnostic checks found **0** locations for "Leamington" in the database. This confirms a significant data gap. We will need to seed the area from scratch.
> 
> **User Data Utilization:** We will use the detailed JSON/Operational data provided for Royal Priors as the "Golden Record" for that specific location, bypassing the scraper for the initial seed to ensure accuracy.

## Proposed Changes

### 1. Royal Priors Seeding (Immediate)
We will create a specific seeding script to insert the Royal Priors data exactly as provided.
#### [NEW] [enrich_royal_priors.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_royal_priors.ts)
- **Action:** Insert `Location` record with:
  - Name: "Royal Priors Shopping Centre"
  - Address: "Royal Priors Shopping Centre, Warwick Street"
  - Postcode: "CV32 4XT"
  - Coords: 52.2925, -1.5356
  - Management: "Nicola Cormell"
  - Opening Hours: (User provided JSON)
  - Tenants: Anchor tenants (Sports Direct, Superdry, etc.) + ~60 others (placeholder count)
  - KPI Data: Footfall 7M, parking 470 spaces.
  - Socials: Instagram, Facebook URLS from brief.

### 2. Gap Analysis & Area Backfill
We will target the other missing locations identified in your report using the standard `location-enrichment` skill workflow.
#### [NEW] [enrich_leamington_area.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_leamington_area.ts)
- **Targets:**
  1. **Leamington Shopping Park** (Touchbrook Park Drive) - Focus: "Big Box" retail key tenants (M&S, Next).
  2. **Regent Court** (Livery Street) - Focus: Dining/Boutique.
  3. **Warwickshire Shopping Park** (Binley) - Focus: Cross-check if it falls within our target zone (20 mins away).
  4. **The Parade** (High Street) - We will create a "High Street" location record for aggregation if granular units aren't possible.

### 3. Data Verification
- **Double Check:** Verify no duplicate records created via existing scrapers (unlikely given 0 count).
- **Leasing Contacts:** Add the specific leasing agents (FMX: India Bebb, Filippa Mudd, Henry Foreman) to the location notes or management fields if available.

## Verification Plan

### Automated Tests
- **Run Diagnostics:** Re-run `scripts/check_royal_priors.ts`.
  - *Expectation:* 1 Record found for "Royal Priors" with correct postcode.
  - *Expectation:* >1 Record found for "Leamington" (catching the other sites).

### Manual Verification
- **Dashboard Check:** Navigate to `https://flourish-ai.vercel.app/dashboard2` (local equivalent) and search "Royal Priors".
- **Enrichment Map:** Verify the pin appears at `52.2925, -1.5356`.
- **Content Accuracy:** Check opening hours and management contact match the provided text.
