# Plan: Global Coordinate Remediation

> **Goal**: Fix the 332 locations currently missing from the Enrichment Map due to invalid coordinates.

## 1. Analysis
- **Total Broken**: 332
- **Recoverable (Valid Postcode)**: 145
    - Includes major centres like "Eastgate Shopping Centre via Postcodes.io".
- **Unrecoverable (No Postcode)**: 187
    - Mostly look like database placeholders: `Abbots Langley (Other)`, `Addlestone (Other)`.
    - These likely represent "High Streets" or generic town headers from a previous import.

## 2. Strategy

### 2.1 Automated Fix (Priority 1)
- Create `scripts/fix-global-geocoding.ts`.
- Fetch all 145 locations with valid (>3 chars) postcodes and Lat/Lng=0.
- Use `axios` + `postcodes.io` (Bulk Lookup API if possible, or individual with delay).
- Update database.

### 2.2 Cleanup (Priority 2)
- Investigate the "Unrecoverable" 187.
- If they are indeed junk/placeholders (e.g., name contains `(Other)`), consider moving them to a deprecated state or deleting them if they serve no purpose.
- **Decision**: For now, we focus on the 145 recoverable ones to populate the map.

## 3. Workflow
1.  **Script**: Adapt `scripts/fix-ni-geocoding.ts` into `scripts/fix-global-geocoding.ts`.
    -   Target: Global (no city filter), filtering for `postcode != null` AND `postcode.length > 3` AND `coord = 0`.
2.  **Execute**: Run the script.
3.  **Audit**: Rerun `scripts/audit-global-coords.ts` to confirm reduction from 332 -> ~187.

## 4. Verification
- [ ] Recoverable count drops to near 0.
- [ ] Map shows ~145 more locations.
