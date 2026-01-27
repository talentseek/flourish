# Plan: Northern Ireland Data Remediation

> **Goal**: Fix the 24 identified Northern Ireland locations that are missing from the map due to invalid coordinates (Lat/Lng: 0/0).

## 1. Context & Root Cause
- **Issue**: Locations in Northern Ireland (Belfast, Derry, etc.) are in the database but not visible on the Enrichment Map.
- **Diagnosis**: 
  - `scripts/audit-ni-locations.ts` found **24 locations**.
  - **100% (24/24)** have `Lat: 0, Lng: 0` or null.
  - The map API filters out invalid coordinates.
- **Hypothesis**: Previous geocoding runs likely failed for NI postcodes (BT prefix) or "Northern Ireland" formatting.

## 2. Methodology
We need a targeted remediation script to fetch coordinates for these specific locations.

### 2.1 Target Identification
- Filter by:
  - Postcode starts with `BT`
  - OR City in [`Belfast`, `Derry`, `Londonderry`, `Bangor`, `Lisburn`, `Newry`]
  - OR County contains `Ireland`
  - AND `latitude` is 0/null.

### 2.2 Geocoding Strategy
- Use `node-geocoder` or Google Maps API (if configured).
- Fallback: Postcodes.io API (Free, UK-specific).
  - Endpoint: `https://api.postcodes.io/postcodes/{POSTCODE}`
  - This is often more reliable for UK postcodes than generic geocoders.

## 3. Workflow Steps

1.  **Create Remediation Script**: `scripts/fix-ni-geocoding.ts`.
    -   Fetch the 24 locations.
    -   Iterate and query Postcodes.io first (cheaper/faster for UK).
    -   Update database with valid Lat/Lng.
2.  **Execute & Verify**:
    -   Run script.
    -   Verify with `scripts/audit-ni-locations.ts` (expect 0 invalid).
    -   Check Enrichment Map UI.

## 4. Verification Checklist
- [ ] 0 Locations with Lat/Lng 0 in NI.
- [ ] Victoria Square (Belfast) appears on map.
- [ ] CastleCourt (Belfast) appears on map.
