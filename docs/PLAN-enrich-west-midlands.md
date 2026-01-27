# Plan: Enrich West Midlands Shopping Centre Websites

> **Goal**: Perform web searches for 41 unmanaged West Midlands shopping centres to identify and populate their missing website URLs.

## 1. Breakdown (41 Locations)
*Key Targets likely to have websites:*
- Queens Square (West Bromwich)
- Red Rose (Sutton Coldfield)
- Riverside (Stafford)
- St. Andrews (Droitwich)
- The Moor (Brierley Hill)
- The Maltings (Uttoxeter)
- The Octagon (Burton)
- The Parade (Shrewsbury)
- The Valley (Evesham)
- Tipton Shopping Centre
- Roebuck (Newcastle-under-Lyme)
- Park Place (Walsall)
- Pendeford Park (Wolverhampton)
- *And ~28 others.*

## 2. Methodology
1.  **Search**: `search_web` for each.
2.  **Verify**: Official vs Directory.
3.  **Update**: DB Update.

## 3. Risks
- Many small centres (e.g. "Tipton Shopping Centre") may not have websites.
- High failure rate expected (maybe 50%).

## 4. Execution
Process in 4 batches of ~10.
