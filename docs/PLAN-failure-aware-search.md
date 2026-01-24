# Plan: Failure-Aware Location Enrichment

> **Goal:** Update the Location Enrichment skill to robustly handle `search_web` failures, ensuring the workflow continues with available fallback data (Demographics, known URLs) instead of halting.

## Context
The `search_web` tool currently suffers from intermittent 500 errors (~60-70% failure rate). The current workflow is brittle and stops when search fails. We need a "Graceful Degradation" strategy.

## Phase 1: Logic Design

### 1.1 Define Failure Modes
- **Hard Failure:** API returns 500/403/429.
- **Soft Failure:** Search returns 0 results or irrelevant fluff.

### 1.2 Define Fallback Hierarchy (The "Swiss Cheese" Model)
1.  **Attempt** `search_web` (High Quality).
2.  **IF FAIL**:
    *   **Fallback A (Contact):** Try direct URL access if `website` exists in DB.
    *   **Fallback B (Demographics):** Proceed to Census data (requires no search, just static lookup maps).
    *   **Fallback C (Operations):** Use "Best Estimate" logic based on location type (e.g., specific parking norms for "Retail Parks" vs "High Street").
3.  **Result:** Mark record as `partial_enrichment` (Conceptually - via log/file, not DB schema change yet).

## Phase 2: Documentation Updates

### 2.1 Update `research-workflow.md`
- [ ] Add "⚠️ FAILURE FALLBACK" callouts to every Phase.
- [ ] Explicitly script the "Skip to Phase X" logic.
- [ ] Add a "Offline Mode" section for demographic-only runs.

### 2.2 Update `SKILL.md`
- [ ] Update "Tool Usage Strategy" to explicitize the failure handling.
- [ ] Add a "Troubleshooting" section for search outages.

## Phase 3: Implementation (Scripting)

### 3.1 Update `generate_enrichment.py` (Template Generator)
- [ ] Modify the template to wrap search steps in `try/catch` (conceptual) or generate comments instructing the agent to do so.
- [ ] actually, since the **Agent** runs the search, the *Instruction* needs to tell the Agent what to do.
    - *Change:* The `SKILL.md` is the "Code" for the Agent. Updating it IS the implementation.

## Phase 4: Verification

### 4.1 Test Run
- [ ] Pick a new location (Rank 26: **The Shires, Trowbridge**?).
- [ ] Simulate search failure (or just run it and see).
- [ ] Verify that even without search, we get:
    -   Corrected Name
    -   Address/Postcode
    -   Demographics (from static lookup/knowledge)

## User Review Required
- [ ] **Partial Enrichment Marking:** Do you want to add a `status` field to the `Location` database model (e.g., `EnrichmentStatus: 'FULL' | 'PARTIAL' | 'FAILED'`), or just keep it informal in logs?
    - *Recommendation:* Keep it informal for now to avoid migration overhead.

---
**Status:** Ready to implement.
