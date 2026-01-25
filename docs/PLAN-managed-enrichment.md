# Plan: Managed Shopping Centre Deep Enrichment

> **Goal**: Enrich all Shopping Centres with **explicit Management** (e.g., Savills, M Core, Workman, British Land) to a value score of >40%.

## 1. Context & Scope
- **Target Audience**: "Managed" Real Estate Assets (High value).
- **Estimated Count**: ~300 Locations (User Estimate).
- **Current State**: ~1000 total shopping centres, many are unmanaged/generic "Long Tail". By focusing on the *Managed* subset, we target the highest quality assets first.
- **Success Metric**: Every managed location must achieve **≥ 40% Enrichment Score**.
    - *40% roughly equates to: Website (10) + Parking (20) + one of Social/Reviews/Year (10+).*

## 2. Methodology

### Step 1: Inventory & Scoring
- **Filter**: `type: SHOPPING_CENTRE` AND `management IS NOT NULL` (and not empty).
- **Score**: Calculate current "Health Score" for this subset.
- **Sort**: Ascending order (Lowest score first).

### Step 2: Batch Execution
Work in batches of **50** (larger than previous 25, as managed centres often have easier-to-find data).

- **Batch A**: Managed Centres with **0-20% Score** (Critical gaps: No website/parking).
- **Batch B**: Managed Centres with **20-40% Score** (Partial health: Missing social/parking).
- **Batch C**: Validation of Centres > 40% (Quick audit).

### Step 3: Verification
- Run a final query to ensure 100% of the "Managed" subset meets the >=40% threshold.

## 3. Workflow Steps

1.  **Update Prioritization Script**: Modify `scripts/prioritize-deep-enrichment.ts` to filter strictly for `management != null`.
2.  **Generate Target List**: Create `managed_enrichment_queue.json`.
3.  **Execute Batches**:
    - Search & Enrich (using existing tools).
    - Repair misnamed entries (often Agent names vs Consumer names, e.g., "M Core Portfolio 1" vs "The Grosvenor Centre").
4.  **Final Report**: Table showing enrichment levels by Management Company.
