# Plan: Warwickshire Retail Enrichment

> **Goal:** Complete the retail coverage for Warwickshire by adding the 7 missing locations identified in the diagnostic sweep.

## User Review Required
> [!NOTE]
> **Diagnostic Results:**
> - **Found (12):** Royal Priors, Leamington SP, Regent Court, Maybird, Bell Court, Rugby Central, Junction One, Technology RP, Ropewalk, Abbeygate, Warwickshire SP, Arena SP.
> - **Missing (7):** The Rosebird Centre (Stratford), Elliott's Field (Rugby), Bermuda Park (Nuneaton), Newtown Retail Park (Nuneaton), Talisman (Kenilworth), Hatton Shopping Village, Hoar Park.

## Proposed Changes

### 1. Automated Research & Enrichment
We will create a script to research and insert the missing 7 locations using a targeted list.
#### [NEW] [enrich_warwickshire.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich_warwickshire.ts)
- **Targets:**
  1. **The Rosebird Centre** (Stratford) - Anchor: Waitrose.
  2. **Elliott's Field Shopping Park** (Rugby) - Premier park, split phases (Phase 1 & 2).
  3. **Bermuda Park** (Nuneaton) - Leisure focus (Cinema/Bowling).
  4. **Newtown Retail Park** (Nuneaton) - Tenants: Currys, Halfords.
  5. **Talisman Shopping Centre** (Kenilworth) - Open air, Anchor: Waitrose.
  6. **Hatton Shopping Village** (Warwick) - Outlet style, independent focus.
  7. **Hoar Park Shopping & Leisure Village** (Nuneaton) - Rural/Craft focus.
- **Methodology:** Use hardcoded "Seed" data for these known entities (Address, Type, Key Tenants) to ensure accuracy, similar to the Leamington approach. This is faster and more reliable than scraping for these specific well-known targets.

### 2. Data Enhancement
- **Elliott's Field:** Specifically handle the "Phase 1 / Phase 2" distinction by consolidating into a single major destination or verifying if they need distinct records. (Plan: Single record "Elliott's Field Shopping Park" covering both).
- **Villages:** Ensure "Shopping Village" type is mapped correctly (likely `OUTLET_CENTRE` or `SHOPPING_CENTRE` with `isManaged: true`).

## Verification Plan

### Automated Tests
- **Run Diagnostics:** Re-run `scripts/check_warwickshire.ts`.
  - *Expectation:* All 7 previously missing items should now appear in the "FOUND" list.

### Manual Verification
- **Gap Analysis Tool:** Check the "Warwickshire" regional view (if available) or search specifically for "Hatton" and "Elliott's Field" to confirm they appear with correct types.
