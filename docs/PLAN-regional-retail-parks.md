# Plan: Regional Retail Park Enrichment

## Overview
**Goal:** systematically enrich ownership, website, and operational data for the remaining ~1,300 retail parks in the database, ensuring 100% coverage across the UK.
**Strategy:** "Divide & Conquer" by Region to manage volume and rate limits.
**Priority:** North West (First) → Rest of England (8 Regions) → Devolved Nations.

## Project Type
**BACKEND / DATA ENRICHMENT**
- Primary Agent: `backend-specialist` (Data scripts)
- Skills: `location-enrichment`, `clean-code`

## Success Criteria
1.  **Coverage:** >90% of specific "Retail Park" locations enriched with verified Website and Owner.
2.  **Data Quality:** Parking spaces and Opening Hours populated for all major sites (>50k sq ft).
3.  **Efficiency:** Zero duplicates created; existing data preserved (only empty fields enriched).
4.  **Verification:** Health Index Score improves for each region post-run.

## Tech Stack
-   **Database:** PostgreSQL (Prisma ORM)
-   **Runtime:** Node.js / TypeScript (`tsx`)
-   **APIs:** Google Custom Search (via `search_web` tool), potentially PropertyData sources.
-   **Tooling:** `.agent/skills/location-enrichment` scripts (`generate_enrichment.py` adapted to TS/regional logic).

## Phasing & Operations

### Phase 1: North West Pilot (Approx. 150 Locations)
**Objective:** Test the "Regional Sweep" script on the North West to validate hit-rate and speed.
-   [ ] **Task 1.1:** Create `scripts/get-region-parks.ts` to list parks by region.
-   [ ] **Task 1.2:** Audit North West data (identify gaps).
-   [ ] **Task 1.3:** Execute batch enrichment for North West.
-   [ ] **Task 1.4:** Validation & Review (Health Index Check).

### Phase 2: England Rollout (8 Regions)
**Objective:** Scale the process to the remaining 8 regions of England.
**Order of Execution:**
1.  **North East**
2.  **Yorkshire and The Humber**
3.  **West Midlands**
4.  **East Midlands**
5.  **East of England**
6.  **London**
7.  **South East**
8.  **South West**

-   [ ] **Task 2.1:** Execute Batch: North East & Yorkshire.
-   [ ] **Task 2.2:** Execute Batch: Midlands (West & East).
-   [ ] **Task 2.3:** Execute Batch: South & East (East, London, SE, SW).

### Phase 3: Devolved Nations
**Objective:** Complete the UK picture.
-   [ ] **Task 3.1:** Scotland (Remaining locations not covered in Phase 1).
-   [ ] **Task 3.2:** Wales (Remaining locations).
-   [ ] **Task 3.3:** Northern Ireland (Full sweep).

## Task Breakdown (Technical)

### 1. Infrastructure
-   **INPUT:** Region Name (e.g., "North West")
-   **OUTPUT:** JSON list of target `location_id`s.
-   **VERIFY:** Count matches expected DB distribution.

### 2. Enrichment Script Adaptation
-   **INPUT:** List of Retail Parks (names + cities).
-   **PROCESS:**
    -   Search `"{name} {city} owner website parking"`
    -   Parse results for: Owner, Website, Parking Count, Hours.
    -   **Rule:** If `website` exists in DB, SKIP (unless flag `--force` used).
-   **OUTPUT:** Console log of updates + DB write.
-   **VERIFY:** `isManaged` flag set to true for successful updates.

## Phase X: Verification
-   [ ] **Schema Compliance:** Ensure all fields match `Location` schema.
-   [ ] **Rate Limits:** Ensure script handles 429s or pauses between batches.
-   [ ] **Data Integrity:** Spot check 5 random locations per region.
