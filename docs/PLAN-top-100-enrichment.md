# Plan: Top 100 Shopping Centre Enrichment

> **Goal:** Ensure the UK's Top 100 Shopping Centres are present, managed, and enriched in the database.

## Phase 1: The Giants (Top 20)
Focus on the massive super-regional centres first.

### 1.1 Seeding (Create/Correct Missing Records)
The following matched incorrectly or were missing. We must create new, clean records for them to avoid "High Street" or "Retail Park" confusion:
1.  **Lakeside Shopping Centre** (Thurrock) - *Currently matched 'Lakeside Retail Park'*
2.  **Manchester Arndale** - *Currently matched 'Arndale (West Yorks)'*
3.  **centre:MK** (Milton Keynes) - *Missing*
4.  **Merry Hill** (Brierley Hill) - *Currently matched 'Retail Park'*
5.  **St David's** (Cardiff) - *Missing*
6.  **East Kilbride Shopping Centre** - *Missing*
7.  **Festival Place** (Basingstoke) - *Missing*
8.  **Victoria Square** (Belfast) - *Missing*
9.  **Kingfisher Shopping Centre** (Redditch) - *Matched 'Business Centre'*
10. **Eden Shopping Centre** (High Wycombe) - *Matched 'Edenbridge'*

### 1.2 Promotion (Enable Management)
Flip `isManaged: true` for these correct unmanaged records:
*   Westfield London
*   Metrocentre
*   The Trafford Centre
*   Westfield Stratford City
*   Bluewater
*   Bullring
*   St James Quarter
*   Liverpool One
*   Meadowhall
*   Eldon Square
*   Derbion
*   Cabot Circus
*   Braehead (Check if it's the centre, not retail park)
*   Silverburn
*   Highcross
*   Telford Centre
*   Westquay
*   Trinity Leeds
*   Victoria Centre
*   Brent Cross

## Phase 2: Enrichment Batches
Once `isManaged: true`, they enter the standard enrichment flow.

### Batch 13: The Big Four (London & North)
*   Westfield London, Stratford, Metrocentre, Trafford.

### Batch 14: The Super Regionals
*   Bluewater, Lakeside (New), Bullring, Meadowhall, Merry Hill (New).

### Batch 15: City Icons
*   Liverpool One, Arndale (New), St James Quarter, Westquay, Cabot Circus.

...and so on.

## Verification
*   **Metric:** Count of `isManaged: true` locations > 100.
*   **Quality:** All Top 20 must have > 40% completeness (Images, Demographics, Parking).

---
**Status:** Ready to Seed & Promote.
