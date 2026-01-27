# Plan: Dudley Retail Enrichment

> **Goal:** Expand database coverage to the Dudley Metropolitan Borough by seeding key retail locations across Merry Hill (Regional Hub) and town centres like Stourbridge and Halesowen.

## Context
The user has provided a comprehensive list of retail destinations for Dudley.
- **Reference:** User Request (Step 615)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_dudley.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_dudley.ts)
- Targets (Sample):
  - **Merry Hill Hub:** Merry Hill SC, Merry Hill RP, The Waterfront, Oak RP.
  - **Dudley Town:** Churchill SC, Castle Gate, Priory Park.
  - **Stourbridge:** Ryemarket, Crown Centre, Victoria Passage.
  - **Halesowen:** Cornbow SC, Peckingham St.
  - **Kingswinford:** Townsend Place.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_dudley.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_dudley.ts)
- **Brierley Hill:**
  - Merry Hill Shopping Centre (Super-regional).
  - Merry Hill Retail Park (The Boulevard).
  - The Waterfront.
  - Oak Retail Park.
- **Dudley Town:**
  - Churchill Shopping Centre.
  - Castle Gate Leisure Park.
- **Stourbridge:**
  - Ryemarket Shopping Centre (Waitrose anchor).
  - Crown Centre.
  - Victoria Passage (Historic Arcade).
- **Halesowen:**
  - Cornbow Shopping Centre (Asda anchor).
- **Kingswinford:**
  - Townsend Place.

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly.
- **Street Refinement:** Ensure clean street names.

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_dudley.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Map Check:** Verify the density in Merry Hill relative to the town centres.
