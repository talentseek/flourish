# Plan: East of England Enrichment

> **Goal:** deep-enrich the Top 20 Shopping Centres in the East of England (Essex, Herts, Beds, Cambs, Norfolk, Suffolk).

## 🧠 Context & Requirements
- **Region:** East of England.
- **Targets:** List of 20 provided (Lakeside, Atria Watford, Luton Point, Queensgate, etc.).
- **Constraints:** 
  - ⛔ **NO `description` field** in Prisma calls.
  - 🌍 **Strict Region Matching**: Validate against city/county.
  - 🔍 **Legacy Name Handling**: "Luton Point" (The Mall), "Atria Watford" (Intu), "Chantry Place" (Intu Chapelfield).

## ❓ Socratic Questions (To Resolve During Inventory)
1. **Lakeside:** Ensure distinct from "Lakeside Retail Park" if both exist. User specifies "Centre only" vs "Retail Park". We focus on the Mall "Lakeside Shopping Centre".
2. **Grand Arcade (Cambridge):** We recently created "Grand Arcade" (Wigan). Must ensuring matching is strictly scoped to Cambridge to avoid cross-contamination.
3. **Riverside (Hemel Hempstead):** "Riverside" is a generic name. Must scope to Hemel Hempstead.

## 📋 Task Breakdown

### Phase 1: Inventory & Gap Analysis
- [ ] **Create `scripts/check-east-of-england-list.ts`**
  - Implement `targets` array with strict `{ name, cityMatch }`.
  - **Constraint:** Handle legacy name checks (The Mall Luton, Intu Watford, Intu Chapelfield).
  - Output: List of Found vs Missing.

### Phase 2: Research & Data Gathering
- [ ] **Research Missing Fields** for all 20 targets:
  - Website, Facebook, Instagram.
  - Parking Spaces count.
  - Valid Postcodes (for new inserts).
  - Special focus on "Luton Point" (New branding) and "Atria Watford".

### Phase 3: Implementation Planning
- [ ] **Create `implementation_plan_east_of_england.md`**
  - List specific **Inserts** and **Renames**.
  - Define `type` (SHOPPING_CENTRE) and `county` (East of England).

### Phase 4: Execution
- [ ] **Create `scripts/apply-east-of-england-enrichment.ts`**
  - **Logic:** Create missing, Update existing, Rename legacy.
  - ⛔ **Omit `description`**.

### Phase 5: Verification
- [ ] **Run `check-east-of-england-list.ts` again**
- [ ] **Verify Coverage:** 20/20.

## 🕵️ Agent Assignments
- **Orchestrator:** Manage task flow.
- **Enrichment Specialist:** Data gathering.
- **Database Engineer:** Prisma scripts.

## ✅ Verification Checklist
- [ ] Lakeside correctly identified (not just retail park).
- [ ] Luton Point renamed from The Mall (if exists).
- [ ] Atria Watford renamed from Intu (if exists).
- [ ] Grand Arcade (Cambridge) distinct from Wigan.
