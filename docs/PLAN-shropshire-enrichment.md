# Plan: Shropshire Retail Enrichment

> **Goal:** Expand database coverage to Shropshire by seeding diverse retail locations across Telford, Shrewsbury, Oswestry, and market towns, based on user-provided intelligence.

## Context
The user has provided a comprehensive list of ~21 locations across Shropshire. We need to check which of these exist and seed the missing ones.
**Note:** Shrewsbury's "Pride Hill" and "Riverside" are closed/repurposing, so we will explicitly **exclude** them or mark them as such if found.

## Proposed Changes

### 1. Diagnostic Sweep
First, we verify current coverage to avoid duplicates (though we expect low coverage in this new region).
#### [NEW] [check_shropshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_shropshire.ts)
- Diagnostic script to query specific location names given in the brief.

### 2. Enrichment Implementation
We will create a seeding script with hardcoded "Golden Record" data for the new locations.
#### [NEW] [enrich_shropshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_shropshire.ts)
- **Telford:**
  - Telford Centre (1M sq ft, Anchors: Frasers, M&S, Primark).
  - Telford Forge SP (Anchors: Sainsbury's, TK Maxx).
  - Wrekin RP (Asda Living).
  - Telford Bridge RP (The Range).
  - Southwater (Leisure district).
- **Shrewsbury:**
  - The Darwin (Main indoor).
  - Meole Brace RP (Largest RP).
  - Harlescott RP & Sundorne RP & Arrowpoint RP (North cluster).
  - The Parade Shops (Independent).
- **Oswestry:**
  - Island Green RP.
  - Penda RP.
  - Powis Hall Market.
- **Bridgnorth:**
  - Central Court SC.
  - Bridgnorth RP.
- **Villages/Destinations:**
  - Ludlow Food Centre (Food village).
  - Apley Farm Shop (Retail village).
  - British Ironwork Centre (Destination).

### 3. Address Standardization
Since we have successfully standardized addresses in the previous task, the enrichment script should try to provide the correct `postcode` so that valid `region: "West Midlands"` and `county: "Shropshire"` are automatically populated (or we can run the standardizer again).

## Verification Plan

### Automated Tests
- **Coverage Check:** Run `check_shropshire.ts` after enrichment.
- **Regional Count:** Run a query for `county: "Shropshire"` or `region: "West Midlands"` to confirm the boost in numbers.

### Manual Verification
- **Map Check:** Verify clusters around Telford (M54) and Shrewsbury (A5).
