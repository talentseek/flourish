# Plan: Market Data Enrichment (Top 100 Shopping Centres)

> **Goal:** Enrich the Seeded 'Market Data' locations (Unmanaged) to provide a comprehensive statistical baseline.

## Technical Approach

### 1. New Script: `scripts/enrich-market-data.ts`
We need a dedicated script for competitive intelligence that differs slightly from our 'Client' enrichment.
*   **Targeting:** Accepts `name` or `id` of `isManaged: false` locations.
*   **Data Strategy:**
    *   **Demographics:** FULL fidelity (Postcode lookup is universal).
    *   **Operations:** ESTIMATED based on 'Super Regional' profile (e.g., Default Parking = 3000+, Anchor Tenants = Department Stores).
    *   **Contact/Images:** BEST EFFORT via Search (with try/catch fallback).

### 2. Batch Execution
We will process the Top 45 in 3 logical batches to monitor performance.

#### Batch 13: London & South East Giants
*   Westfield (x2), Bluewater, Lakeside, Brent Cross, Whitgift, Festival Place, Milton Keynes, Westquay, Royal Victoria Place.

#### Batch 14: Midlands & North Giants
*   Trafford, Metrocentre, Arndale, Meadowhall, Bullring, Merry Hill, Liverpool One, White Rose, Trinity Leeds, Eldon Square.

#### Batch 15: Scotland, Wales, NI & Regional
*   St James, St Davids, Braehead, Silverburn, Cwmbran, Cabot Circus, Cribbs Causeway, Victoria Centre, etc.

## Verification
*   **Audit:** Run `audit_location.py` on a sample of 3 from each batch.
*   **Success Criteria:** > 50% Completeness (Demographics + Size + Name/Address).

## Risks
*   **Search Failure:** If search fails, we must fall back to "Super Mall" templates (e.g. assume they have a Cinema, Food Court, ~50 retailers).

---
**Status:** Ready to build script.
