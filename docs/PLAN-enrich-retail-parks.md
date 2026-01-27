
# Plan: Retail Park Enrichment (The 1355)

**Context**: There are 1,355 Retail Parks in the database. 1,112 are missing websites. 0 are currently "fully enriched" to Green status.

## Strategy: Divide & Conquer
We cannot tackle 1355 linearly. We will prioritize based on **Commercial Value** (Size/Stores) and **Ease of Execution** (Common Owners).

### Phase 1: The "Super Parks" (Top 50)
Target the largest 50 retail parks by `totalFloorArea` or `numberOfStores`. These are the "Out-of-Town Shopping Centres" in all but name.
*   **Examples:** Fort Kinnaird (Edinburgh), Fosse Park (Leicester), Teesside Park (Stockton).
*   **Action:** Create `scripts/prioritize-retail-parks.ts` to identify this list.

### Phase 2: The "Major Owners" (Batch by Landlord)
Retail Parks are often held in large portfolios. Identifying the owner for one often unlocks 20+.
*   **British Land:** Owns ~40-50 major parks (e.g., Ealing Broadway, Meadowhall RP).
*   **Landsec:** Owns ~30.
*   **Hammerson:** Owns ~20 (The Oracle RP, etc).
*   **Peel L&P:** Owns ~15.
*   **Action:** Script `scripts/enrich-retail-parks-owners.ts` to bulk-apply owner data where known.

### Phase 3: Regional Sweeps (The Long Tail)
Break the remaining ~1000 into regional batches to use local context (Councils/Local Press) for data gathering.
1.  North West & Scotland (often well documented).
2.  London & South East (often fragmented ownership).
3.  Midlands & North East.
4.  Wales & South West.

## Immediate Next Step
1.  Run `scripts/prioritize-retail-parks.ts` to generate the "Top 50" target list.
2.  Enrich the Top 50 first (High Impact).
