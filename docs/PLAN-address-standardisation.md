# Plan: Address Standardization & "Geography of Truth"

> **Goal:** Establish a rigorous, hierarchical address structure for all locations, distinguishing between physical location (Street/Postcode), administrative geography (County/Council), and statistical regions (West Midlands/England).

## User Review Required
> [!WARNING]
> **Data Quality Findings:**
> - `City` field currently contains Counties (e.g., "Kent", "Greater London").
> - `County` field contains Regions or Cities (e.g., "North West", "Leeds").
> - ~200 locations have missing/blank location data.
>
> **Proposed Solution:**
> We will use the **Postcode** as the single source of truth. By querying `postcodes.io` (Open Government Data) for every location's postcode, we can authoritative populate:
> - **Region** (e.g., "West Midlands")
> - **Country** (e.g., "England")
> - **Administrative District** (e.g., "Warwick District")
> - **Ceremonial County** (Inferred)

## Proposed Changes

### 1. Database Schema Update
We need to expand the `Location` model to support the standard UK hierarchy.
#### [MODIFY] [schema.prisma](file:///Users/mbeckett/Documents/codeprojects/flourish/prisma/schema.prisma)
- **Add Fields:**
  - `street` (String?) - Separated from the raw address blob.
  - `town` (String?) - The standardized Post Town (e.g., "Leamington Spa").
  - `region` (String?) - NUTS1 Region (e.g., "West Midlands").
  - `country` (String?) - "England", "Wales", "Scotland", "Northern Ireland".
  - `adminDistrict` (String?) - Local Authority (e.g., "Warwick").

### 2. Standardization Migration
We will write a robust migration script to iterate the database and fix the data.
#### [NEW] [standardise_addresses.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/standardise_addresses.ts)
- **Logic:**
  1. Fetch all locations with a valid postcode.
  2. Batch query `api.postcodes.io` (bulk endpoint).
  3. **Update:**
     - Set `region`, `country`, `adminDistrict` from API.
     - Heuristic Fix: If `city` is currently a County name (e.g., "Kent"), attempt to replace it with the `adminDistrict` or `parliamentary_constituency` to get closer to a "Town".
     - Parse `address` string: Extract the first line(s) as `street` if it doesn't match the city/postcode.

## Verification Plan

### Automated Tests
- **Distribution Check:** Run a script to count locations by `region`.
  - *Expectation:* Clean clusters (e.g., "West Midlands" = ~300, "London" = ~400).
  - *Expectation:* No empty `country` fields for locations with valid postcodes.

### Manual Verification
- **Dashboard Inspection:** Check specific problem locations seen in diagnostics:
  - "East Park Retail" (was City: Newport, County: Gwent) -> Should be Region: Wales, Country: Wales.
  - "Chelmsley Wood" (was City: Chelmsley Wood (Solihull)) -> Should ideally standardize.
