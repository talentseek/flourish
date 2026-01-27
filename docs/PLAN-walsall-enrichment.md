# Plan: Walsall Retail Enrichment

> **Goal:** Expand database coverage to the Walsall Metropolitan Borough by seeding key retail locations across the Town Centre, Aldridge, Brownhills, and Willenhall.

## Context
The user has provided a comprehensive list of retail destinations for Walsall.
- **Reference:** User Request (Step 756)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_walsall.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_walsall.ts)
- Targets (Sample):
  - **Town Centre:** Crown Wharf, Saddlers, Old Square, Victorian Arcade.
  - **Outskirts:** Reedswood RP, Broadwalk RP, Bescot RP.
  - **Aldridge:** Aldridge Shopping Centre (The Square).
  - **Brownhills:** High Street / Ravens Court.
  - **Willenhall:** Town Centre / Market Place.
  - **Bloxwich:** High Street.
  - **Darlaston:** Town Centre (Asda).

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_walsall.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_walsall.ts)
- **Walsall Town:**
  - Crown Wharf Shopping Park (Premier Destination).
  - The Saddlers Shopping Centre.
  - Old Square Shopping Centre.
  - Victorian Arcade.
- **Outskirts:**
  - Reedswood Retail Park.
  - Broadwalk Retail Park.
  - Bescot Retail Park.
- **Aldridge:**
  - The Square (Shopping Centre).
- **Brownhills:**
  - High Street (Tesco Anchor).
- **Willenhall:**
  - Market Place.
- **Darlaston:**
  - Town Centre (Asda Hub).

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly.
- **Street Refinement:** Ensure clean street names.

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_walsall.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Map Check:** Verify the density in Walsall Town.
