# Comprehensive Data Enrichment & Audit Strategy

This artifact documents the methodologies, heuristics, and execution results for standardizing and enriching the Flourish location database.

## 1. Address Standardization Strategy

### 1.1. Problem Statement
A Jan 2026 audit revealed inconsistencies in geographic fields:
- **County Confusion**: Post Towns (e.g., "Manchester") were often in the `county` field.
- **Address Overlap**: `address` often contained the full string including city/postcode.
- **Normalization Gap**: Lack of a "Region" field hindered spatial aggregation.

### 1.2. Standardized Hierarchy (BS 7666 Alignment)
| Field | Example |
|-------|---------|
| **City / Post Town** | Royal Leamington Spa |
| **District** | Warwick District |
| **County** | Warwickshire |
| **Region** | West Midlands |

### 1.3. Remediation Results (Jan 26, 2026)
Total Processed: **2,729** locations.
- **England**: 2,153 | **Scotland**: 175 | **Wales**: 115 | **NI**: 20
- **Top Region**: South East (438 locations).

## 2. Refined Street Address extraction

To prevent loss of street names that overlap with location names (e.g., "Commercial Road Retail Park"), a **Street Suffix Whitelist** (Street, Road, Way, etc.) was implemented. This heuristic preserves specific thoroughfares while discarding generic location name segments.

**Result**: 369 records updated with high-confidence street addresses.

## 3. Managed Portfolio Audit & DB Remediation

### 3.1. Technical Mapping
The system aligns the Prisma Database with the master directory (`src/data/location-managers.json`).

### 3.2. Matching Heuristics
1. **Exact Postcode Match**: Strict comparison of normalized postcodes.
2. **Normalized Name Match**: Lowercase, alphanumeric comparison.
3. **Fuzzy Word Containment**: Verifying if significant words from the source exist in the target.

### 3.3. Audit Results (Jan 27-28, 2026)
- **Healthy**: 15 locations.
- **Fixed**: 56 locations (assigned Regional Managers).
- **Orphaned**: 40 locations (divergence found).

## 4. Managed Status Reset (Safety Logic)

In Feb 2026, a "Safety-First" reset was introduced:
- **Rule**: If `isManaged: true` but `regionalManager: null`, set `isManaged: false`.
- **Rationale**: Flourish managed sites MUST have a designated RM for the dashboard and chat features to function.

## 5. Zero-Coordinate Remediation

### 5.1 The "West Africa" Hazard
Locations imported with missing or placeholder coordinates (latitude: 0, longitude: 0) appear at the prime meridian off the coast of West Africa. This breaks the "Map View" for Regional Managers.

### 5.2 Remediation Pattern
For locations showing at `0,0`, coordinates are re-fetched using the `postcodes.io` API or nearby proximity lookups.

**Example Case: Market Quay Shopping Centre (PO16 0LS)**
- **Postcode Lookup**: `https://api.postcodes.io/postcodes/PO16%200LS`
- **Fallback**: Search nearby postcodes in the same sector (e.g. `PO16 0`) if the specific postcode return null.
- **Result**: Updated coordinates from `0, 0` to `50.852815, -1.180279` (Fareham).

## 6. Location Data Profiles

[Detailed profiles of key assets like Pentagon Shopping Centre are maintained for research verification and footfall accuracy benchmarks.]
