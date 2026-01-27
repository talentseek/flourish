# Plan: Coventry Retail Enrichment

> **Goal:** Expand database coverage to the Coventry Metropolitan Borough by seeding key retail locations across the City Centre, Major Retail Parks, and Suburban Hubs.

## Context
The user has provided a comprehensive list of retail destinations for Coventry.
- **Reference:** User Request (Step 571)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_coventry.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_coventry.ts)
- Targets (Sample):
  - **City Centre:** West Orchards, Lower Precinct, Cathedral Lanes, Coventry Market, Upper Precinct, City Arcade, Fargo Village.
  - **Retail Parks:** Arena Shopping Park, Central Six, Gallagher RP, Alvis RP, Airport RP, Warwickshire Shopping Park.
  - **Suburban:** Cannon Park, Cross Point, Jubilee Crescent, Riley Square.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_coventry.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_coventry.ts)
- **City Centre:**
  - West Orchards & Lower Precinct (Main Malls).
  - Upper Precinct (Pedestrian Core).
  - Cathedral Lanes (Dining Quarter).
  - Coventry Market (Historic Indoor Market).
  - Fargo Village (Creative Quarter).
- **Major Retail Parks:**
  - Arena Shopping Park (Massive Tesco Extra).
  - Central Six (City Centre Edge).
  - Gallagher, Alvis, Airport RPs.
  - Warwickshire Shopping Park (Binley).
- **Suburban:**
  - Cannon Park (Uni Hub).
  - Cross Point (Walsgrave).
  - Jubilee Crescent & Riley Square (Community Hubs).

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly (Coventry is a Metro Borough).
- **Street Refinement:** Ensure clean street names.

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_coventry.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Map Check:** Verify the density in the City Centre (CV1) and Outer Ring (CV6, CV3, etc.).
