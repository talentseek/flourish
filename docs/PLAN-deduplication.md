
# Plan: Database Deduplication & Enrichment Report

## Goal
Identify duplicate `Location` entries in the database and generate a comprehensive report recommending a "survivor" record for each group based on enrichment quality. **No deletion will occur in this phase.**

## User Review Required
> [!IMPORTANT]
> **Deduplication Logic Definition**
> I plan to use the following criteria to identify duplicates. Please confirm if this is aggressive enough or too strict:
> 1.  **Exact Match:** Same `name` (normalized) AND same `postcode`.
> 2.  **Proximity Match:** Similar `name` (Levenshtein distance) AND distance < 500m (using lat/long).
> 3.  **City Match:** Similar `name` AND same `city`.
>
> **Enrichment Scoring (Survivor Selection)**
> The "Survivor" will be chosen based on a score:
> *   **+10 points** per verified Website.
> *   **+5 points** per Social Media link.
> *   **+3 points** for Management details.
> *   **+1 point** for every other populated field.
>
> **Merge Strategy**
> *   Default: We will propose **MERGING** data. The Survivor keeps its ID, but empty fields are filled from the Victims.

## Proposed Steps

### Phase 1: Report Generation Script
Create `scripts/reporting/dedupe-analysis.ts` to:
1.  Fetch all locations.
2.  Group potential duplicates using the criteria above.
3.  Calculate enrichment scores for each location in a group.
4.  Simulate a merge to show the potential "Final" record state.
5.  Generate a Markdown report (`reports/DEDUPE-CANDIDATES.md`) listing:
    *   Duplicate Groups Found.
    *   Proposed Survivor.
    *   Data to be merged/discarded.

### Phase 2: Verification
1.  User reviews `reports/DEDUPE-CANDIDATES.md`.
2.  User confirms which groups are actual duplicates vs false positives (e.g., "The Galleries Washington" vs "The Galleries Bristol").

### Phase 3: Execution (Not Included in this Plan)
Once verified, a separate task will be created to execute the merge/delete operation.

## Verification Plan
### Automated Tests
*   Run the script and check if known duplicates (e.g., any found during previous searches) are flagged.
*   Verify "Lomond Galleries" vs "Galleries Washington" are **NOT** flagged as duplicates (different cities).

### Manual Verification
*   Inspect the generated report for accuracy.
