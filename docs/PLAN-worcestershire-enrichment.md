# Plan: Worcestershire Retail Enrichment

> **Goal:** Expand database coverage to Worcestershire by seeding key retail locations across Worcester City, Redditch, Kidderminster, Evesham, and Malvern.

## Context
The user has provided a comprehensive list of retail destinations for Worcestershire.
- **Reference:** User Request (Step 465)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_worcestershire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_worcestershire.ts)
- Targets (Sample):
  - **Worcester:** Crowngate (Friary/Chapel), Cathedral Square, St Martin’s Quarter, Elgar RP, Blackpole RP.
  - **Redditch:** Kingfisher SC, Trafford RP, Abbey RP.
  - **Kidderminster:** Weavers Wharf, Crossley RP, Swan Centre.
  - **Evesham:** The Valley, Riverside SC, Four Pools RP.
  - **Malvern:** Malvern Shopping Park.
  - **Bromsgrove/Droitwich:** Bromsgrove RP, St Andrews Square.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_worcestershire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_worcestershire.ts)
- **Worcester:**
  - Crowngate Shopping Centre (Friary Walk & Chapel Walk).
  - Cathedral Square.
  - St Martin’s Quarter.
  - Elgar & Blackpole Retail Parks.
- **Redditch:**
  - Kingfisher Shopping Centre (Major regional mall).
  - Trafford & Abbey Retail Parks.
- **Kidderminster:**
  - Weavers Wharf (Hybrid heritage/retail).
  - Crossley Retail Park.
- **Evesham:**
  - The Valley (Outlet/Garden destination).
- **Malvern:**
  - Malvern Shopping Park (M&S, Boots).

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "Worcestershire"` are set.
- **Street Refinement:** Ensure clean street names.

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_worcestershire.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Gap Analysis:** Verify Weavers Wharf correctly captured (often tricky due to hybrid nature).
