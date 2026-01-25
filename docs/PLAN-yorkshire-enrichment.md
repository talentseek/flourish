# Plan: Yorkshire and the Humber Enrichment

> **Goal:** deep-enrich the Top 20 Shopping Centres in Yorkshire/Humber, ensuring full coverage and data quality.

## 🧠 Context & Requirements
- **Region:** Yorkshire and the Humber.
- **Targets:** List of 20 provided (Meadowhall, Trinity Leeds, Frenchgate, etc.).
- **Constraints:** 
  - ⛔ **NO `description` field** in Prisma calls (Schema limitation).
  - 🌍 **Strict Region Matching**: Must ensure targets don't match same-named assets in other regions (e.g., "Trinity" leads to Leeds or Wakefield, not elsewhere).
  - 🏙️ **Smart City Filter**: All matches must be validated against the target city.

## ❓ Socratic Questions (To Resolve During Inventory)
1. **Victoria Leeds:** The list notes it as "Combined" (Quarter + Gate). We need to check if the DB has them separate. *Proposal: If separate, allow both but prioritize creating a "Victoria Leeds" parent or master record if appropriate, or enrich both.*
2. **The Galleries (Washington) vs Yorkshire:** Washington is Tyne and Wear (North East), but typically grouped in North East. Wait, looking at the User's previous list... The previous list was North East. This list is Yorkshire. *Correction*: The user pasted "Yorkshire" list. Let's check the items.
   - Meadowhall (Sheffield) -> Yorks.
   - Trinity (Leeds) -> Yorks.
   - ...
   - Freshney Place (Grimsby) -> Humber.
   - *Note*: Ensure no overlap with North East list (e.g. Washington is North East, not Yorkshire).

## 📋 Task Breakdown

### Phase 1: Inventory & Gap Analysis
- [ ] **Create `scripts/check-yorkshire-list.ts`**
  - Implement `targets` array with strict `{ name, cityMatch }` objects.
  - **Constraint:** Use regex or strict cleaning to avoid partial matches.
  - **Constraint:** Verify `city` or `address` contains the expected region/city.
  - Output: List of Found vs Missing.

### Phase 2: Implementation Planning
- [ ] **Create `implementation_plan_yorkshire.md`**
  - List specific **Inserts** (New records filtered by City).
  - List specific **Updates** (Enrichment).
  - Define `type` (SHOPPING_CENTRE) and `county` (Yorkshire).

### Phase 3: Execution
- [ ] **Create `scripts/apply-yorkshire-enrichment.ts`**
  - **Logic:**
    - Iterate through validated list.
    - **Create** missing assets with `name`, `city`, `type`, `parking`, `web`, `address`, `county`.
    - ⛔ **Omit `description`**.
    - **Update** existing matches.
  - **Enrichment:** Use researched data (Websites, Parking Counts, Socials).

### Phase 4: Verification
- [ ] **Run `check-yorkshire-list.ts` again**
- [ ] **Manual Audit** of creating records to ensure no "London" or "Scotland" matches occurred.

## 🕵️ Agent Assignments
- **Orchestrator:** Manage task flow and user reviews.
- **Enrichment Specialist:** Perform web research for gaps.
- **Database Engineer:** Write safe Prisma scripts.

## ✅ Verification Checklist
- [ ] All 20 targets match a valid DB record.
- [ ] No `description` errors in logs.
- [ ] "Victoria Leeds" handling confirmed.
