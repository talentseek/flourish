# Report: Shopping Centre Enrichment Status

> **Date:** Jan 2026
> **Scope:** ~1,000 Shopping Centres (Ranks 1-1000)

## 1. Address Integrity Audit
We audited 989 Shopping Centre records.

| Metric | Count | Status |
| :--- | :--- | :--- |
| **Total Records** | **989** | ✅ Robust Base |
| **Missing Postcodes** | **42** | ⚠️ High Risk (Searchability) |
| **Missing County** | 187 | ⚠️ Moderate (Can imply from City) |
| **Potential Duplicates** | 2 | 🟢 Low Risk |

### Critical Action Items (Postcodes)
42 locations (mostly recent Workman/M Core additions) lack valid postcodes.
- *Examples:* Freshney Place, Broadmarsh Centre, Knightswood Shopping Centre.
- **Fix:** Run a targeted search/enrichment batch for these 42 IDs.

### Duplicates
- `The Marlowes Centre` vs `The Marlowes Shopping Centre`
- `Castle Court Centre` vs `Castle Court Shopping Centre`

## 2. Enrichment Gap Analysis (Market Data)
We checked for valid `Floor Area` and `Store Count`.

| Segment | Total | Enriched | Missing Data |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Giants)** | ~100 | 100% | 0 |
| **Tier 2 (Managed)** | ~310 | ~63% | **115** |
| **Tier 3 (Unmanaged)** | ~580 | 100%* | 2 |

*Note: Unmanaged centres often have estimated/placeholder data from initial seed.*

### The "Managed Gap"
The 115 missing records are primarily from the recent **Workman** and **M Core** ingestions. We have the internal management data (Who manages it), but we lack the public market data (Size, Stores).

## 3. Recommended Batches
1.  **Batch Fix-Postcodes:** Resolve the 42 missing postcodes immediately.
2.  **Batch Dedup:** Merge the 2 duplicates.
3.  **Batch 21 (M Core/Workman Market Data):** Target the 115 managed centres to scrape/search for `Total Floor Area` and `Number of Stores`.

