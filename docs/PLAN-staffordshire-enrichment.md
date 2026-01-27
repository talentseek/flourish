# Plan: Staffordshire Retail Enrichment

> **Goal:** Expand database coverage to Staffordshire by seeding key retail locations across Stoke-on-Trent, Tamworth, Cannock, Stafford, and surrounding towns.

## Context
The user has provided a comprehensive list of retail destinations for Staffordshire.
- **Reference:** User Request (Step 409)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_staffordshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_staffordshire.ts)
- Targets (Sample):
  - **Stoke:** Potteries Centre, Festival Park, Octagon RP, Etruria Mills, Phoenix RP, Springfields RP.
  - **Newcastle:** Affinity Staffordshire, Wolstanton RP, Roebuck SC.
  - **Cannock:** McArthurGlen West Midlands, Gateway RP, Cannock SC, Orbital RP.
  - **Tamworth:** Ventura RP (+ Jolly Sailor), Ankerside SC.
  - **Stafford:** Guildhall SC, Riverside SC, Queens Shopping Park, Madford RP.
  - **Lichfield:** Three Spires SC, Imperial RP.
  - **Burton:** Octagon SC, Coopers Square, Burton Place, Middleway RP.
  - **Uttoxeter/Rugeley:** Dovefields RP, The Maltings, Brewery St.
  - **Destinations:** Trentham Shopping Village, Getliffes Yard.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_staffordshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_staffordshire.ts)
- **Stoke-on-Trent:**
  - The Potteries Centre (Hanley).
  - Festival Park & Octagon RP (Etruria).
  - Phoenix RP (Longton).
  - Springfields RP (Trent Vale).
- **Newcastle-under-Lyme:**
  - Affinity Staffordshire (Outlet).
  - Wolstanton RP (M&S).
- **Cannock:**
  - McArthurGlen Designer Outlet.
  - Gateway RP.
- **Tamworth:**
  - Ventura Retail Park (Major regional hub).
  - Ankerside.
- **Stafford:**
  - Riverside SC.
  - Queens Shopping Park.
- **Lichfield:**
  - Three Spires.
- **Burton upon Trent:**
  - Coopers Square.
  - The Octagon.
- **Destinations:**
  - Trentham Shopping Village.
  - Getliffes Yard.

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "Staffordshire"` are set.
- **Street Refinement:** Ensure clean street names (e.g. "Etruria Road" for Festival Park).

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_staffordshire.ts` post-enrichment.
- **Regional Count:** Confirm significant boost in "West Midlands" location count.

### Manual Verification
- **Map Check:** Verify the density in the Stoke/Newcastle conurbation and the M6 corridor.
