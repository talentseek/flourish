# Plan: Fix Coliseum Shopping Park Coordinates

> **Goal:** Correct the geographical coordinates for "Coliseum Shopping Park" which is currently displaying as 0,0 (West Africa) instead of Ellesmere Port (CH65 9HD).

## Context
The user reported an anomaly where "Coliseum Shopping Park" appears off the West Coast of Africa.
- **Current State:** Likely Lat/Long = 0,0.
- **Target State:** Lat/Long corresponding to CH65 9HD (approx 53.26, -2.88).

## Phased Approach

### 1. Diagnosis
Create a script to fetch the current record for "Coliseum Shopping Park" to confirm the bad data.
#### [NEW] [diagnose_coliseum.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/diagnose_coliseum.ts)
- Fetch location by name.
- Log `latitude`, `longitude`, `postcode`.

### 2. Remidiation
Create a repair script that updates the specific record.
#### [NEW] [fix_coliseum.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/fix_coliseum.ts)
- Target: "Coliseum Shopping Park"
- Update:
  - Postcode: `CH65 9HD`
  - Longitude: `-2.887` (Approx)
  - Latitude: `53.264` (Approx)
  - Region: "North West" (It's in Cheshire, typically NW, though often grouped with Mersey/Deeside).
  - County: "Cheshire"

### 3. Verification
- Run the diagnostic script again to verify the coordinates are no longer 0,0.

## User Review Required
- **Region Check:** Is this considered "North West" or "West Midlands" in our dataset? (Cheshire is NW, but often borders). We will set to "North West".
