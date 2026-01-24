# Plan: M Core Portfolio Ingestion

> **Goal:** Ingest the M Core (LCP/Evolve Estates) portfolio (~59 Shopping Centres) into the database, utilizing the provided Excel file and verified prompt data.

## Context
- **Source:** `public/mcore_shopping_centres_comprehensive.xlsx` + Prompt Data.
- **Target:** `Location` table.
- **Key Entity:** M Core (comprising LCP & Evolve Estates).
- **Recent Acquisitions:** Several 2024-2026 acquisitions (Princes Square, The Centre Livingston, etc.) which definitively override previous management.

## Phase 1: Data Analysis
- [ ] **Script:** `analyze-mcore-excel.ts`
    - Verify headers and column mapping (Name, Location, Manager, Phone, etc.).
    - Check match rate against 947 verified centres.
    - Identify potential conflicts with Savills/Workman (e.g. Grosvenor Centre Northampton - listed in Savills prompt but M Core listing claims Evolve acquisition). *Rule: Recent M Core wins take precedence.*

## Phase 2: Ingestion
- [ ] **Script:** `ingest-mcore.ts`
    - **Match Strategy:** Fuzzy match Name + City.
    - **Updates:**
        - `management`: "M Core (LCP/Evolve)"
        - `managementContact`: Specific Manager or Head Office fallback.
        - `managementPhone`: Specific or +44 (0) 1384 400 123.
        - `managementEmail`: Specific or info@mcoreproperty.com.
    - **Seeding:** Create missing centres (e.g. "Park View Shopping Centre Whitley Bay").

## Phase 3: Validation & Conflict Resolution
- [ ] **Audit:** `audit-mcore-results.ts`
    - Verify overrides (Grosvenor Centre, The Centre Livingston).
    - Check for duplicates (e.g. "The Centre" vs "The Centre, Livingston").
- [ ] **Stats:** Confirm ~59 managed.

## Questions (Socratic Gate)
1.  **Management Name:** Should I use "M Core", "LCP", or "M Core (LCP/Evolve)"? *Plan: "M Core (LCP/Evolve)" for clarity.*
2.  **Conflict:** Grosvenor Centre Northampton was in the Savills list. Your new data says "Acquired by Evolve Estates". *Plan: M Core overrides Savills.*

