# Plan: Enrichment Completion (Batches 11-15)

> **Goal:** Re-process the low-completeness locations (25-31%) using the new "Failure-Aware" robust workflow to bring them up to the maximum possible baseline (~40%) without relying on the unstable Search API.

## Analysis
The Gap Analysis shows two tiers of "Incomplete" data:
1.  **Tier 1 (25%):** Locations attempted in Batches 1-3 where search failed hard (Dukes Mill, Marsh Centre, Ridgeway).
2.  **Tier 2 (31-38%):** Locations processed recently with fallback logic (Penicuik, Weavers Wharf).

**Objective:** Raise Tier 1 (25%) to Match Tier 2 (~40%).

## Batch Strategy

### Batch 11 (The Low 5)
1.  Dukes Mill (Romsey)
2.  The Marsh Centre (Hythe)
3.  The Ridgeway (Plympton)
4.  Parc-y-Llyn (Aberystwyth)
5.  Kingsland Centre (Thatcham)

### Batch 12 (The Next 5)
6.  Rainham Shopping Centre
7.  The Quadrant (Dunstable?)
8.  Penicuik (Review - maybe 31% is max?)
9.  Eastgate (Review)
10. Balmoral (Review)

### Batch 13-15
*   Target any remaining locations < 40%.
*   If all are > 40%, stop.

## Implementation Steps
For each Batch:
1.  **Extract IDs:** Use `find-batchX-ids.ts`.
2.  **Enrich:** Use `enrich-batchX.ts` with "Failure-Aware" logic:
    *   Estimate Parking/Size.
    *   Guess Website URL (if safe).
    *   Apply Census Demographics (High Confidence).
3.  **Verify:** Run `audit_location.py`.
4.  **Merge:** Check for duplicates created by ID mismatches.

## Verification
*   **Success Metric:** All targeted locations reach > 35% completeness.
*   **Manual Check:** Verify names are clean (no "Address needed" tags).

---
**Status:** Ready to execute Batch 11.
