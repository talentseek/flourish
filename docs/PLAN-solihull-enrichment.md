# Plan: Solihull Retail Enrichment

> **Goal:** Expand database coverage to the Solihull Metropolitan Borough by seeding key retail locations across the Town Centre, Shirley, and the NEC area.

## Context
The user has provided a comprehensive list of retail destinations for Solihull.
- **Reference:** User Request (Step 711)
- **Constraint:** Use `location-enrichment` skill protocols.

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_solihull.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_solihull.ts)
- Targets (Sample):
  - **Town Centre:** Touchwood, Mell Square, High Street.
  - **Shirley:** Parkgate, Sears Retail Park, Stratford Road.
  - **Monkspath:** Solihull Retail Park (Chalford Way).
  - **NEC:** Resorts World Birmingham.
  - **North:** Chelmsley Wood Shopping Centre.
  - **Villages:** Knowle High Street, Dorridge (Forest Court).

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data.
#### [NEW] [enrich_solihull.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_solihull.ts)
- **Solihull Town:**
  - Touchwood (Premier Destination).
  - Mell Square (Open Air Precinct).
  - High Street/Mill Lane.
- **Shirley:**
  - Parkgate Shopping Centre.
  - Sears Retail Park.
  - Stratford Road Corridor.
- **Monkspath:**
  - Solihull Retail Park (Big Box).
- **NEC/Airport:**
  - Resorts World Birmingham (Outlet).
- **North Solihull:**
  - Chelmsley Wood Shopping Centre.
- **Villages:**
  - Knowle High Street.
  - Dorridge (Forest Court).

### 3. Standardization & Verification
- **Address Standardization:** Ensure `region: "West Midlands"` and `county: "West Midlands"` are set correctly.
- **Street Refinement:** Ensure clean street names (avoid "Solihull" as street).

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_solihull.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" location count increases.

### Manual Verification
- **Map Check:** Verify the density in Solihull Town vs Shirley.
