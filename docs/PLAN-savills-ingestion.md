# Plan: Savills Portfolio Ingestion

> **Goal:** Ingest the full Savills UK Shopping Centre management portfolio (~145 locations) into the database, marking them as Managed and enriching with specific contact details.

## Context
- **Source:** `public/savills_shopping_centres_comprehensive.xlsx` (and prompt data).
- **Target:** `Location` table.
- **Current State:** Top 100 Market Data exists (Unmanaged). Savills manages many of these plus smaller town centres.

## Phase 1: Schema Updates
The current schema lacks fields for specific management contact details.
- [ ] **Update Prisma Schema**:
    - `managementEmail` (String?)
    - `managementPhone` (String?)
    - `managementContact` (String?) - Name/Role
- [ ] **Migrate DB**: Apply changes.

## Phase 2: Data Analysis & Matching
We need to match the Excel list against our existing 2,600+ locations.
- [ ] **Script: Analyze Savills Data**: Read Excel, normalize names.
- [ ] **Fuzzy Matcher**: Match "The Trafford Centre" (Excel) -> "The Trafford Centre" (DB).
- [ ] **Gap Analysis**: Identify locations in Excel that strictly do not exist in DB (likely smaller town centres).

## Phase 3: Ingestion & Enrichment
- [ ] **Script: Ingest Savills**:
    - **Existing:** Update `isManaged: true`, `management: 'Savills'`, `managementContact`, `managementEmail`, `managementPhone`.
    - **Missing:** Create new location (Seeding) with full details.
    - **Retail Parks:** Handle Savills "Shopping Parks" (use `type: RETAIL_PARK`?).

## Phase 4: Validation
- [ ] **Verify Count**: ~145 Managed by Savills.
- [ ] **Spot Check**: Verify Trafford, St Enoch, Queensgate contacts match the provided list.

## Questions (Socratic Gate)
1.  **Schema:** Shall I add dedicated columns (`managementEmail`, `managementPhone`) or store in a JSON field?
2.  **Retail Parks:** Savills lists "Shopping Parks". Should these be imported as `type: RETAIL_PARK`?
3.  **Conflict:** If a location is currently marked Unmanaged (from Market Data phase), this overwrite is intentional, correct?

