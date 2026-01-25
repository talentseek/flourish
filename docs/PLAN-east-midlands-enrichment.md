# Plan: East Midlands Enrichment

> **Goal:** deep-enrich the Top 20 Shopping Centres in the East Midlands.

## 🧠 Context & Requirements
- **Region:** East Midlands.
- **Targets:** List of 20 provided (Derbion, Highcross, Victoria Centre, etc.).
- **Constraints:** 
  - ⛔ **NO `description` field** in Prisma calls.
  - 🌍 **Strict Region Matching**: Validate against city/county.
  - 🔍 **Legacy Name Handling**: "Derbion" (Derby) might be "Intu Derby" or "Westfield" in DB. "Highcross" might be "The Shires".

## ❓ Socratic Questions (To Resolve During Inventory)
1. **Derbion:** Does the DB have "Intu Derby"? If so, we must rename it to "Derbion" rather than creating a duplicate.
2. **Highcross:** Does the DB have "The Shires"?
3. **Victoria Centre:** Ensure distinct from London "Victoria".

## 📋 Task Breakdown

### Phase 1: Inventory & Gap Analysis
- [ ] **Create `scripts/check-east-midlands-list.ts`**
  - Implement `targets` array with strict `{ name, cityMatch }`.
  - **Constraint:** Handle legacy name checks (e.g., check for "Intu Derby" if "Derbion" fails).
  - Output: List of Found vs Missing.

### Phase 2: Research & Data Gathering
- [ ] **Research Missing Fields** for all 20 targets:
  - Website, Facebook, Instagram.
  - Parking Spaces count.
  - Valid Postcodes (for new inserts).
  - Special focus on mid-sized towns (Kettering, Wellingborough, Coalville).

### Phase 3: Implementation Planning
- [ ] **Create `implementation_plan_east_midlands.md`**
  - List specific **Inserts** and **Renames**.
  - Define `type` (SHOPPING_CENTRE) and `county` (East Midlands).

### Phase 4: Execution
- [ ] **Create `scripts/apply-east-midlands-enrichment.ts`**
  - **Logic:** Create missing, Update existing, Rename legacy.
  - ⛔ **Omit `description`**.

### Phase 5: Verification
- [ ] **Run `check-east-midlands-list.ts` again**
- [ ] **Verify Coverage:** 20/20.

## 🕵️ Agent Assignments
- **Orchestrator:** Manage task flow.
- **Enrichment Specialist:** Data gathering.
- **Database Engineer:** Prisma scripts.

## ✅ Verification Checklist
- [ ] Derbion correctly identified/renamed.
- [ ] Highcross correctly identified/renamed.
- [ ] All 20 assets present with Web/Parking data.
