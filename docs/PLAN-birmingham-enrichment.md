# Plan: Birmingham Retail Enrichment

> **Goal:** Expand database coverage to the Birmingham Metropolitan Borough by seeding key retail locations across the City Centre, Sutton Coldfield, and major suburban hubs.

## Context
The user has provided a comprehensive list of retail destinations for Birmingham.
- **Reference:** User Request (Step 511)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_birmingham.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_birmingham.ts)
- Targets (Sample):
  - **City Centre:** Bullring, Mailbox, Arcadian, Martineau Place, Great Western Arcade, Piccadilly Arcade, Burlington Arcade.
  - **Retail Parks:** The Fort, One Stop, Battery, Selly Oak SP, Castle Vale, Princess Alice, Stechford, Urban Exchange.
  - **Sutton Coldfield:** Gracechurch Centre, Red Rose, Mulberry Walk.
  - **Suburban hubs:** Northfield SC, The Swan (Yardley), Kings Heath, Harborne.
  - **Specialist:** Jewellery Quarter, Bullring Markets.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_birmingham.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_birmingham.ts)
- **City Centre:**
  - Bullring & Grand Central (Flagship).
  - The Mailbox (Luxury).
  - Historic Arcades (GWA, Piccadilly, Burlington, City).
  - Martineau Place & The Square.
- **Out-of-Town:**
  - The Fort (Premier Park).
  - One Stop (Perry Barr).
  - Selly Oak Cluster (Battery & Shopping Park).
  - Castle Vale & Stechford.
- **Sutton Coldfield:**
  - Gracechurch Centre & Mulberry Walk.
- **Suburban:**
  - Northfield SC, Swan Centre.
  - High Streets: Kings Heath, Harborne (Retail Districts).
- **Specialist:**
  - Jewellery Quarter.

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly.
- **Street Refinement:** Ensure clean street names (e.g. "Corporation Street" vs just "City Centre").

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_birmingham.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases significanty.

### Manual Verification
- **Map Check:** Verify the density in the City Centre vs suburbs.
