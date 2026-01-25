# Project Plan: South West & London Enrichment (Phase 22)

**Goal:** Eliminate "Red" health status for South West and London regions by remediating gap data (Web, Park, Socials) and fixing the Trafford Centre anomaly.

**Context:**
- **South West:** 1/21 Healthy (Critical Socials Gaps)
- **London:** 15/39 Healthy (Mixed Gaps)
- **Trafford Centre (NW):** Persistent failure despite seemingly corrected data.

## Phase 1: Consolidated Target Analysis
**Goal:** Generate the definitive "Hit List" of failing locations in these two regions.

- [ ] **Step 1.1: Run Targeted Audit**
  - Use `scripts/audit-global-gaps.ts` to capture the specific missing fields for every SW and London location.
- [ ] **Step 1.2: Debug Trafford Centre**
  - Investigate why `Trafford Centre` isn't matching. Likely a naming strictness issue (e.g. `contains: "Trafford Centre"` vs `name: "The Trafford Centre"`).

## Phase 2: Batch Research & Enrichment
**Goal:** Research data for ~45 locations efficiently.

- [ ] **Step 2.1: Research Batch 1 (South West - 20 Targets)**
  - Targeted research for Social Media handles (the primary failure point).
  - Targets: Cribbs Causeway, Cabot Circus, Drake Circus, SouthGate, Princesshay, etc.
- [ ] **Step 2.2: Research Batch 2 (London - 24 Targets)**
  - Targeted research for Parking and Socials.
  - Targets: Westfield, Brent Cross, Canary Wharf, Battersea, One New Change, etc.

## Phase 3: Execution
**Goal:** Apply fixes via a compiled remediation script.

- [ ] **Step 3.1: Create `scripts/apply-sw-london-remediation.ts`**
  - Standardized upsert logic for the new batch.
  - **Correction:** Include specific fix for `Trafford Centre` (e.g. force update by ID or exact name).
- [ ] **Step 3.2: Execute Script**
  - Run `npx tsx scripts/apply-sw-london-remediation.ts`.
- [ ] **Step 3.3: Final "Green" Audit**
  - Run `scripts/audit-global-gaps.ts`.
  - **Target:** 11/11 Regions PASS (100% Green).

## Agent Assignments
- **Project Planner:** Plan creation.
- **Enrichment Specialist:** Executing Phase 2 (Research) using `location-enrichment` skill.
- **QA/Verifier:** Executing Phase 3 (Audit).
