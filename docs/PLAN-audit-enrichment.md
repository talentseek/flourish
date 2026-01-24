# Plan: Audit & Enrichment Strategy (1,000 Shopping Centres)

> **Goal:** comprehensive audit of the ~1,000 Shopping Centres to verify address integrity (Postcode/City) and quantify the "Enrichment Gap" (Market Data) to guide the next phase.

## Context
- **Current Count:** ~980-1,000 Shopping Centres.
- **Recent Activity:** Ingested Savills, Workman, M Core (~310 managed).
- **Objective:** Ensure all 1,000 have valid addresses and identify how many lack key market data (Size, Footfall, Stores).

## Phase 1: Address Integrity Audit
We must ensure the "Base Layer" (Location) is solid before adding "Meta Layer" (Market Data).
- [ ] **Script:** `audit-addresses.ts`
    - **Postcode Check:** Identify any `UNKNOWN` or `null` postcodes (especially from recent M Core/Workman additions).
    - **City/County Check:** Verify geographical hierarchy.
    - **Duplicate Check:** Final sweep for fuzzy duplicates introduced by recent batches.

## Phase 2: Enrichment Gap Analysis
We need to know *what* is missing.
- [ ] **Script:** `analyze-enrichment-gap.ts`
    - **Metric:** Count locations with/without:
        - `totalFloorArea`
        - `numberOfStores`
        - `parkingSpaces`
        - `marketingStats` (Demographics)
    - **Segmentation:**
        - **Tier 1 (Enriched):** Top 100 Giants.
        - **Tier 2 (Managed):** Savills/Workman/M Core (Do we have their size/footfall?).
        - **Tier 3 (Unmanaged/Basic):** The "Long Tail" town centres.

## Phase 3: Enrichment Strategy (The Result)
- [ ] **Report:** Generate a markdown report `docs/REPORT-enrichment-status.md`.
- [ ] **Batches:** Define the next enrichment batches based on the gap (e.g., "Batch 21: M Core Enrichment", "Batch 22: Unmanaged Capitals").

## Questions (Socratic Gate)
1.  **Market Data Source:** For the managed centres (M Core/Workman), do we have a source for their floor area/footfall, or will we rely on the `search_web` tool to find this individually? rely on search_web
2.  **Generic Data:** Are we happy to proceed with "Estimated" data for smaller unmanaged centres if exact figures aren't public? No lets keep it null

