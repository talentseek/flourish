# Plan: Sandwell Retail Enrichment

> **Goal:** Expand database coverage to the Sandwell Metropolitan Borough by seeding key retail locations across West Bromwich (Commercial Centre), Wednesbury (Junction 9 Hub), and other town centres.

## Context
The user has provided a comprehensive list of retail destinations for Sandwell.
- **Reference:** User Request (Step 665)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_sandwell.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_sandwell.ts)
- Targets (Sample):
  - **West Bromwich:** New Square, Queens Square, Kings Square, Astle Retail Park.
  - **Wednesbury:** Gallagher Shopping Park, Axletree Way Area, Union Street.
  - **Oldbury:** Oldbury Green RP, Birchley Island RP.
  - **Smethwick:** Windmills Shopping Park, Bearwood Road.
  - **Great Bridge:** Great Bridge Retail Park.
  - **Rowley Regis:** Blackheath Town Centre.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_sandwell.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_sandwell.ts)
- **West Bromwich:**
  - New Square (Premier Destination).
  - Queens Square & Kings Square (Indoor Precincts).
  - Astle Retail Park.
- **Wednesbury:**
  - Gallagher Shopping Park (Major Hub).
  - Axletree Way (Big Box Cluster).
  - Wednesbury Town Centre (Union St).
- **Oldbury:**
  - Oldbury Green Retail Park.
  - Birchley Island Retail Park.
- **Smethwick:**
  - Windmills Shopping Park.
  - Bearwood Road (High Street District).
- **Great Bridge:**
  - Great Bridge Retail Park (Asda Border Hub).
- **Rowley Regis:**
  - Blackheath Town Centre.

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly.
- **Street Refinement:** Ensure clean street names.

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_sandwell.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Map Check:** Verify the density in West Bromwich vs Wednesbury.
