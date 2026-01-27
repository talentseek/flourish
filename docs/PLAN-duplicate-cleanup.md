# Plan: Duplicate Detection & Lossless Merge

> **Goal:** Identify all duplicate locations (using broader criteria) and merge them intelligently to preserve all data (tenants, phones, stats).

## 1. Broader Detection Strategy
The previous scan (Exact Website + Exact Postcode) was very strict. It found 4 sets, but we likely missed others.
We will implement a **Multi-Stage Detection Script** (`scripts/find_all_duplicates.ts`):

*   **Stage 1: Strict Postcode + Fuzzy Name**
    *   Match: Same Postcode (normalized).
    *   Filter: Levenshtein distance on Name < 3 (e.g. "The Broadway" vs "The Broadway Bradford").
*   **Stage 2: Exact Website (Ignoring Postcode)**
    *   Match: Same Website URL.
    *   Reason: Postcode might be missing/different on one record.
*   **Stage 3: Exact Name + Vicinity (Lat/Long check)**
    *   Match: Exact Name (case insensitive).
    *   Filter: Locations within 500m of each other (to avoid "Tesco Express" nationwide collisions).

## 2. Lossless Merge Strategy
We will create a **Merge Script** (`scripts/merge_duplicates.ts`) that takes a `Winner` and a `Loser` ID.

### Logic:
1.  **Scalar Fields (Phone, Website, Footfall, etc.):**
    *   If `Winner` has data, KEEP `Winner`.
    *   If `Winner` is null/empty AND `Loser` has data, COPY `Loser` -> `Winner`.
    *   *Conflict Resolution:* If both have different data, prefer `Winner` (assuming it's the "Enriched" one, usually `cmic...` or the one with more existing data).
2.  **Relations (Tenants):**
    *   **Move** all Tenants from `Loser` to `Winner`.
    *   *Edge Case:* If `Winner` already implies the tenant (e.g., duplicate tenant entry), avoid double-counting (Check Tenant Name + Category).
3.  **Cleanup:**
    *   Delete the `Loser` record after successful transfer.

## 3. Execution Plan

#### Phase 1: Diagnosis
- [ ] Create `scripts/find_all_duplicates.ts`
- [ ] Run to generate a comprehensive "Merge List".
- [ ] **Review:** Present the full list to User (likely > 4 sets).

#### Phase 2: Implementation (The Merge)
- [ ] Create `scripts/merge_duplicates.ts`
- [ ] Execute Merge for the approved list.

#### Phase 3: Verification
- [ ] Verify Tenant counts (should sum up or stay same, not decrease).
- [ ] Check for data loss on key fields.
