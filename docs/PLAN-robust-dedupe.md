
# Plan: Robust Deduplication Strategy (v2)

## Goal
Refine the candidate identification logic to eliminate false positives (e.g., "Touchwood" location errors) and ensure only "high-confidence" duplicates are proposed for merging.

## Problem Analysis
The previous report (`DEDUPE-CANDIDATES.md`) identified:
1.  **False Positives:** Locations matched by name but geographically distant (indicating either a bad match or incorrect data coordinates).
2.  **Weak Evidence:** "Victim" records with no website being matched to "Survivors" with weak name similarities.
3.  **Data Errors:** Specific instances (Touchwood) where one record has significantly wrong coordinates.

## User Review Required
> [!WARNING]
> **Proposed Strictness Upgrade**
> We will move from a "greedy" match to a "tiered confidence" system. Matches will be categorized:
> *   🔴 **High Risk (Ignored):** Name match only, distance > 500m OR different Postcode Sector.
> *   🟡 **Medium Confidence (Manual check):** Strong Name Match + Distance < 500m.
> *   🟢 **High Confidence (Auto-candidate):** Exact Postcode + Strong Name Match.
>
> We will specifically investigate the **Touchwood** case to handle "Data Correction" separately from "Deduplication".

## Proposed Steps

### Phase 1: Forensic Data Analysis
*   Investigate the `Touchwood` records to understand why one has the "wrong location" (bad lat/long in DB?).
*   **Deliverable:** A short "Pre-flight Check" finding bad coordinate data before deduplication.

### Phase 2: Refined Matching Algorithm
Modify `dedupe-analysis.ts` to implement:
1.  **Coordinate Sanity Check:** If two locations match by name but are > 1km apart, flag as "Potential Coordinate Error" rather than a Duplicate.
2.  **Postcode Sector Check:** Require at least the first segment of Postcode to match for fuzzy name matches.
3.  **Website Anti-Collision:** If *both* records have *different* websites, strictly prevent merging (likely different entities).

### Phase 3: "Safe" Report Generation
Generate `reports/DEDUPE-V2-ROBUST.md` with:
*   **Section A:** High Confidence Merges (Exact Postcode + Name).
*   **Section B:** Data Integrity Issues (Name match but distant coordinates - e.g., Touchwood).
*   **Section C:** Potential conflicts (Different websites).

### Phase 4: Review Point
*   User reviews the new, stratified report.
*   We only process Section A after approval.

## Verification Plan
*   **Specific Test:** Verify "Touchwood" appears in "Data Integrity Issues" (Section B) rather than as a merge candidate.
*   **General Test:** Ensure zero matches where distance > 1km.
