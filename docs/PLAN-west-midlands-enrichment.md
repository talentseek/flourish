# Plan: West Midlands Enrichment

> **Goal:** deep-enrich the Top 20 Shopping Centres in the West Midlands.

## 🧠 Context & Requirements
- **Region:** West Midlands.
- **Targets:** List of 20 provided (Bullring, Merry Hill, Telford Centre, Kingfisher, etc.).
- **Constraints:** 
  - ⛔ **NO `description` field** in Prisma calls.
  - 🌍 **Strict Region Matching**: Validate against city/county.
  - 🔍 **Legacy Name Handling**: "The Potteries Centre" (formerly Intu Potteries), "Merry Hill" (formerly Intu Merry Hill).

## ❓ Socratic Questions (To Resolve During Inventory)
1. **Bullring vs Grand Central:** They are physically connected but listed as Rank 1 and Rank 9 respectively. We will treat them as distinct assets unless the DB has them merged.
2. **Old Market (Hereford):** "Old Market" is a generic name. Must strictly match Hereford.
3. **Cornbow (Halesowen):** Ensure "The Cornbow" or "Cornbow Shopping Centre".

## 📋 Task Breakdown

### Phase 1: Inventory & Gap Analysis
- [ ] **Create `scripts/check-west-midlands-list.ts`**
  - Implement `targets` array with strict `{ name, cityMatch }`.
  - **Constraint:** Handle legacy name checks (Intu Potteries, Intu Merry Hill).
  - Output: List of Found vs Missing.

### Phase 2: Research & Data Gathering
- [ ] **Research Missing Fields** for all 20 targets:
  - Website, Facebook, Instagram.
  - Parking Spaces count.
  - Valid Postcodes (for new inserts).
  - Special focus on Open-Air precincts (Old Market, New Square).

### Phase 3: Implementation Planning
- [ ] **Create `implementation_plan_west_midlands.md`**
  - List specific **Inserts** and **Renames**.
  - Define `type` (SHOPPING_CENTRE) and `county` (West Midlands).

### Phase 4: Execution
- [ ] **Create `scripts/apply-west-midlands-enrichment.ts`**
  - **Logic:** Create missing, Update existing, Rename legacy.
  - ⛔ **Omit `description`**.

### Phase 5: Verification
- [ ] **Run `check-west-midlands-list.ts` again**
- [ ] **Verify Coverage:** 20/20.

## 🕵️ Agent Assignments
- **Orchestrator:** Manage task flow.
- **Enrichment Specialist:** Data gathering.
- **Database Engineer:** Prisma scripts.

## ✅ Verification Checklist
- [ ] Bullring and Grand Central coexist correctly.
- [ ] Merry Hill correctly named.
- [ ] All 20 assets present with Web/Parking data.
