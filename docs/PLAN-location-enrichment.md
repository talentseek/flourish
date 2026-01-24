# Plan: Deep Location Enrichment

> **Goal:** Run `location-enrichment` skill on all ~1,000 locations to populate deep data (Review, Social, Demographics, Parking).

## 1. Context & Motivation
The previous audit focused on minimal viable data (Floor Area/Stores). The user correctly identified that the database is **not enriched** according to the project's high standards.
- **Current Status:**
    - Social (Insta/FB): **97% Missing**
    - Demographics: **100% Missing**
    - Google Ratings: **74% Missing**
    - Parking Data: **87% Missing**

## 2. Enrichment Strategy
We will execute the `location-enrichment` skill in prioritized waves.

### Phase 1: Digital Presence (High Impact, Low Friction)
Focus on "Digital Search" fields.
- [ ] **Batch 1:** Social Media Discovery (Instagram/Facebook/Twitter).
- [ ] **Batch 2:** Google Reviews & Ratings (Brand Sentiment).

### Phase 2: Operational Data (High Value)
Focus on "Website Crawl" fields.
- [ ] **Batch 3:** Parking Spaces & EV Charging (Vital for Driver App).
- [ ] **Batch 4:** Opening Hours (Complex JSON parsing).

### Phase 3: Demographics (Analytical Layer)
Focus on "Government Data" (ONS/Census).
- [ ] **Batch 5:** Map Postcodes to LTLAs (Local Authority Districts).
- [ ] **Batch 6:** Ingest Census 2021 Data (Population, Age, Income).

## 3. Execution Plan (Batches)
We will create a `scripts/enrich-batch-runner.ts` that:
1.  Takes a `batchType` (e.g. `SOCIAL`, `PARKING`).
2.  Selects 50 targets with missing data.
3.  Runs the enrichment logic (Search -> Parse -> Update).
4.  Logs success rate.

## 4. Verification
- **Audit Script:** Re-run `audit_location.ts` after each phase.
- **Target:** Reduce missing fields from >90% to <20% for Managed centres.

## 5. Agent Instructions
- Use `search_web` for social handles.
- Use `search_web` + ONS API/Data for demographics (do not guess).
- **Quality Control:** If a social handle looks unofficial (shady fan page), skip it.

