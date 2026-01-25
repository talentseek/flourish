# Plan: South East Enrichment

> **Goal:** deep-enrich the Top 20 Shopping Centres in South East England (Kent, Sussex, Surrey, Hants, Berks, Bucks, Oxon).

## 🧠 Context & Requirements
- **Region:** South East England (Note: Includes Milton Keynes).
- **Targets:** List of 20 provided (Bluewater, centre:mk, Festival Place, Westquay, etc.).
- **Constraints:** 
  - ⛔ **NO `description` field** in Prisma calls.
  - 🌍 **Strict Region Matching**: Validate against city/county.
  - 🔍 **Legacy Name Handling**: "Victoria Place" (Peacocks), "The Beacon" (Arndale Eastbourne), "Atria" (if relevant, though Watford is East).

## ❓ Socratic Questions (To Resolve During Inventory)
1. **centre:mk vs Midsummer Place:** Listed as Rank 2 and Rank 17. They are connected but distinct ownership. We must ensure they are two separate records.
2. **Westquay:** Combined North/South entity.
3. **Gunwharf Quays vs Cascades:** Both in Portsmouth. Ensure Gunwharf is strictly "Designer Outlet" type if possible, or just standard Shopping Centre but named correctly.

## 📋 Task Breakdown

### Phase 1: Inventory & Gap Analysis
- [ ] **Create `scripts/check-south-east-list.ts`**
  - Implement `targets` array with strict `{ name, cityMatch }`.
  - **Constraint:** Handle legacy name checks (The Peacocks, Arndale Centre Eastbourne).
  - Output: List of Found vs Missing.

### Phase 2: Research & Data Gathering
- [ ] **Research Missing Fields** for all 20 targets:
  - Website, Facebook, Instagram.
  - Parking Spaces count (Bluewater has 13,000 free!).
  - Valid Postcodes (for new inserts).

### Phase 3: Implementation Planning
- [ ] **Create `implementation_plan_south_east.md`**
  - List specific **Inserts** and **Renames**.
  - Define `type` (SHOPPING_CENTRE) and `county` (South East or Buckinghamshire/etc).

### Phase 4: Execution
- [ ] **Create `scripts/apply-south-east-enrichment.ts`**
  - **Logic:** Create missing, Update existing, Rename legacy.
  - ⛔ **Omit `description`**.

### Phase 5: Verification
- [ ] **Run `check-south-east-list.ts` again**
- [ ] **Verify Coverage:** 20/20.

## 🕵️ Agent Assignments
- **Orchestrator:** Manage task flow.
- **Enrichment Specialist:** Data gathering.
- **Database Engineer:** Prisma scripts.

## ✅ Verification Checklist
- [ ] Bluewater vs "Bluewater Retail Park" (if any).
- [ ] centre:mk distinct from Midsummer Place.
- [ ] Victoria Place renamed from Peacocks (if exists).
