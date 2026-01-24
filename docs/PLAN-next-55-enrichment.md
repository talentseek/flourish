# Plan: Market Data Enrichment (The Next 55)

> **Goal:** Extend the Market Data capture to the Top 100 Shopping Centres (Ranks 46-100).

## Scope
Approximately 55 additional locations identified via research and reconciliation.

## Phase 1: Seeding (Missing)
The following were missing from our check and need explicit seeding:
1.  **Friary Shopping Centre** (Guildford)
2.  **Castle Quay** (Banbury)
3.  **Southside Wandsworth** (London)
4.  **Fosse Park** (Leicester) - *Check: Is this a Shopping Centre or Retail Park? It's a hybrid giant. We will include it.*
5.  **The Harlequin** -> *Already exists as 'Atria Watford'. No action.*

## Phase 2: Enrichment Batches
We will process in groups of 10-15.

### Batch 16: South East & London Regional
*   Churchill Square (Brighton), The Glades (Bromley), The Bentall Centre (Kingston), Southside (Seeded), County Mall (Crawley), Friary (Seeded), Castle Quay (Seeded), Eden (High Wycombe - done?), Gunwharf Quays (Portsmouth).

### Batch 17: Midlands & East
*   Touchwood (Solihull), West Orchards (Coventry), Grand Arcade (Cambridge), Lion Yard (Cambridge), Chantry Place (Norwich), Golden Square (Warrington - North?), Queensgate (Peterborough - done?).

### Batch 18: North & Scotland/Wales
*   Drake Circus (Plymouth - South West), Princess Quay (Hull), Coppergate (York?), St Johns (Liverpool), Bon Accord (Aberdeen), Union Square (Aberdeen), Overgate (Dundee), Houndshill (Blackpool).

### Batch 19/20: The Keepers (Ranks 80-100)
*   Remaining locations from the analysis.

## Verification
*   **Audit:** Sample 5 locations from the new set.
*   **Metric:** Count of `isManaged: false` locations with > 40% score should increase by ~50.

---
**Status:** Ready to Seed & Enrich.
