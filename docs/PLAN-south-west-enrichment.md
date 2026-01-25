# Plan: South West Enrichment

> **Goal:** deep-enrich the Top 20 Shopping Centres in South West England (Bristol, Somerset, Dorset, Devon, Cornwall, Wilts, Glos).

## 🧠 Context & Requirements
- **Region:** South West England.
- **Targets:** List of 20 provided (Cribbs Causeway, Cabot Circus, Castlepoint, The Dolphin, Princesshay, etc.).
- **Constraints:** 
  - ⛔ **NO `description` field** in Prisma calls.
  - 🌍 **Strict Region Matching**: Validate against city/county.
  - 🔍 **Legacy Name Handling**: "Drake Circus" (The Barcode extension), "The Mall at Cribbs Causeway" (distinct from Retail Park).

## ❓ Socratic Questions (To Resolve During Inventory)
1. **The Mall at Cribbs Causeway:** Ensure we match the "Mall" specifically, not the broader area or retail parks.
2. **Castlepoint:** Techincally a "Shopping Park", but user lists it as Rank 3. We will treat it as a Major Shopping Centre.
3. **Gloucester Quays vs Eastgate:** Both in Gloucester. Quays is an Outlet. Eastgate is the covered mall. Ensure they are distinct.

## 📋 Task Breakdown

### Phase 1: Inventory & Gap Analysis
- [ ] **Create `scripts/check-south-west-list.ts`**
  - Implement `targets` array with strict `{ name, cityMatch }`.
  - **Constraint:** Handle legacy name checks.
  - Output: List of Found vs Missing.

### Phase 2: Research & Data Gathering
- [ ] **Research Missing Fields** for all 20 targets:
  - Website, Facebook, Instagram.
  - Parking Spaces count.
  - Valid Postcodes (for new inserts).
  - Special focus on "The Dolphin" (Poole) and "Princesshay" (Exeter).

### Phase 3: Implementation Planning
- [ ] **Create `implementation_plan_south_west.md`**
  - List specific **Inserts** and **Renames**.
  - Define `type` (SHOPPING_CENTRE) and `county` (South West).

### Phase 4: Execution
- [ ] **Create `scripts/apply-south-west-enrichment.ts`**
  - **Logic:** Create missing, Update existing, Rename legacy.
  - ⛔ **Omit `description`**.

### Phase 5: Verification
- [ ] **Run `check-south-west-list.ts` again**
- [ ] **Verify Coverage:** 20/20.

## 🕵️ Agent Assignments
- **Orchestrator:** Manage task flow.
- **Enrichment Specialist:** Data gathering.
- **Database Engineer:** Prisma scripts.

## ✅ Verification Checklist
- [ ] Cribbs Causeway Mall matches correctly.
- [ ] Gloucester Quays distinct from Eastgate.
- [ ] All 20 assets present with Web/Parking data.
