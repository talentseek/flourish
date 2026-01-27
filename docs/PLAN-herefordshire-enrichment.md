# Plan: Herefordshire Retail Enrichment

> **Goal:** Expand database coverage to Herefordshire by seeding the key retail locations in Hereford City, Ross-on-Wye, Leominster, and Ledbury.

## Context
The user has provided a definitive list of retail destinations for Herefordshire.
- **Reference:** User Request (Step 343)
- **Constraint:** Use `location-enrichment` skill protocols (Diagnostic -> Research -> Seed -> Verify).

## Proposed Changes

### 1. Diagnostic Sweep
Verify existing coverage to establish a baseline.
#### [NEW] [check_herefordshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_herefordshire.ts)
- Targets:
  - **Hereford:** Old Market, Maylord Orchards, Spur RP, Salmon RP, Brook RP, Hereford RP, Holmer Road RP.
  - **Ross:** Labels Shopping, Ross Town Centre.
  - **Ledbury:** Hop Pocket Shopping Village, Ledbury Town Centre.
  - **Leominster:** Drapers Lane, Southern Avenue.
  - **Destination:** Oakchurch Farm Shop.

### 2. Enrichment Implementation
Create a seeding script populated with the "Golden Record" data provided in the brief.
#### [NEW] [enrich_herefordshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_herefordshire.ts)
- **Hereford City:**
  - Old Market (Waitrose, ODEON).
  - Maylord Orchards (High St mix).
  - High Town (M&S, Primark).
- **Hereford Retail Parks:**
  - Spur RP (Dunelm, Halfords).
  - Salmon RP (B&M, Oak Furnitureland).
  - Brook RP (Lidl, Pets at Home).
  - Hereford RP (Currys).
  - Holmer Road RP (Home Bargains).
- **Market Towns:**
  - Labels Shopping (Ross).
  - Hop Pocket (Ledbury).
  - Oakchurch Farm Shop (Staunton-on-Wye).

### 3. Standardization & Verification
- **Address Standardization:** The enrichment script will pre-populate correct postcodes to ensure `region: "West Midlands"` is set.
- **Street Refinement:** We will ensure `street` is parsed correctly (e.g. "Holmer Road" for the RPs).

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_herefordshire.ts` post-enrichment.
- **Regional Count:** Confirm "West Midlands" total increases by ~14.

### Manual Verification
- **Gap Analysis:** Check for overlaps with "High Town" vs "Maylord" (ensure distinction).
