# Plan: Wolverhampton Retail Enrichment

> **Goal:** Expand database coverage to the City of Wolverhampton by seeding key retail locations across the City Centre, Wednesfield (Bentley Bridge), and Bilston.

## Context
The user has provided a comprehensive list of retail destinations for Wolverhampton.
- **Reference:** User Request (Step 799)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_wolverhampton.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_wolverhampton.ts)
- Targets (Sample):
  - **City Centre:** Mander Centre, Wulfrun Centre, St Johns Retail Park, Dudley Street, Peel Centre.
  - **Wednesfield:** Bentley Bridge Retail Park, Wednesfield High Street.
  - **Bilston:** Bilston Market, Bilston High Street.
  - **Suburban:** Tettenhall (Upper Green), Wolverhampton City Market.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_wolverhampton.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_wolverhampton.ts)
- **Wolverhampton City:**
  - Mander Centre (Premier Indoor).
  - Wulfrun Centre (Transport Hub Link).
  - St Johns Retail Park (Ring Road Big Box).
  - Dudley Street (High Street Core).
  - Peel Centre (Stafford St).
- **Wednesfield:**
  - Bentley Bridge (Major Regional Hub).
  - Wednesfield High Street.
- **Bilston:**
  - Bilston Market (Famous Market).
  - Bilston High Street.
- **Suburban:**
  - Tettenhall Village (Upper Green).

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly.
- **Street Refinement:** Ensure clean street names.

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_wolverhampton.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Map Check:** Verify the density in Wolverhampton City vs Wednesfield.
