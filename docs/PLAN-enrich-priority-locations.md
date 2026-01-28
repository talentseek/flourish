# Plan: Enrich Priority Locations

> **Goal:** Achieve 100% data enrichment for 12 specific priority locations identified by the user.

## 1. Scope & Status Analysis

| Priority Location | Likely Match (DB) | Status | Action Required |
| :--- | :--- | :--- | :--- |
| **Birchwood** | `Birchwood Shopping Centre` (WA3 7PG) | ✅ Found | **Enrich** (Deep Audit) |
| **Carters Square** | *Not Found* | ❌ Missing | **Create** & Enrich (Uttoxeter) |
| **Chelmsley** | `Chelmsley Wood Shopping Centre` (B37 5TT) | ✅ Found | **Enrich** |
| **Cockedge** | `Cockhedge Shopping Park` (WA1 2QQ) | ✅ Found (Duplicate?) | **Merge** & Enrich (Check overlap) |
| **Lady Smith** | `Ladysmith Shopping Centre` (OL6 7JY) | ✅ Found | **Enrich** |
| **Longton Exchange**| `Longton Exchange` (ST3 2JA) | ✅ Found | **Enrich** |
| **Lower Precinct** | `Lower Precinct Shopping Centre` (CV1 1NQ)| ✅ Found | **Enrich** |
| **Maghull** | `Central Square` (L31 0AE) | ✅ Found | **Enrich** (Confirm name alias) |
| **Mailbox** | `The Mailbox` (B1 1RS) | ✅ Found | **Enrich** |
| **Middleton** | `Middleton Grange` (Durham)? **NO.** | ⚠️ Mismatch | **Create** `Middleton Shopping Centre` (M24 4EL) |
| **Onestop** | `One Stop Retail Park` (B42 1AA) | ✅ Found | **Enrich** |
| **Strand** | `The Strand Shopping Centre` (L20 4SZ) | ✅ Found | **Enrich** |

## 2. Enrichment Strategy

We will use the **Location Enrichment Skill** (`.agent/skills/location-enrichment`) to gather P0-P3 data for all 12 sites.

### Phase 1: Creation & Fixes
- [ ] **Carters Square:** Create new record for "Carters Square", Uttoxeter.
- [ ] **Middleton:** Create new record for "Middleton Shopping Centre", Manchester (M24).
- [ ] **Cockhedge:** Resolve duplicate candidates (`Cockhedge Retail Park` vs `Shopping Park`). Merge if needed.
- [ ] **Maghull:** detailed check if `Central Square` = Maghull.

### Phase 2: Systematic Enrichment
For each location, we will run a targeted enrichment script.

**Target Fields:**
*   **Core:** Website (`official`), Phone, Opening Hours.
*   **Commercial:** Owner (Recent acquisition?), Management/Agent.
*   **Operational:** Parking spaces, Retail floor area (sq ft), Number of stores, Anchor tenants.
*   **Digital:** Social handles (Instagram, FB), Footfall (if public).

### Phase 3: Verification
- [ ] Validate 100% field coverage for P0/P1 fields.
- [ ] User sign-off.

## 3. Execution Plan

#### Step 1: Preparation (Scripting)
- [ ] Create `scripts/enrich_priority_list.ts`
    - [ ] Import/Define the 12 target IDs (or creating missing ones).
    - [ ] Define the specific data payloads (researched manually or via API).
- [ ] **Research:** Conduct `search_web` for the missing pieces (Carters Square owner/stats, Middleton M24 stats).

#### Step 2: Implementation
- [ ] Run `scripts/enrich_priority_list.ts`.
- [ ] Run `scripts/standardise_addresses.ts` (for the newcreates).

#### Step 3: Audit
- [ ] Run `scripts/audit_priority_list.ts` to output a coverage report.
