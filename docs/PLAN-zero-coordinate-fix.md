# Plan: Zero Coordinate Remediation

> **Goal:** systemically identify and fix all locations in the database that have invalid geographical coordinates (e.g., Latitude 0, Longitude 0).

## Context
The user identified "Banbury Gateway" appearing off the coast of West Africa (0,0), similar to the previous "Coliseum Shopping Park" issue. This suggests a systemic issue where locations seeded without geodata default to 0.

## Proposed Changes

### 1. Systemic Diagnosis
Create a script to scan the entire `Location` table for invalid coordinates.
#### [NEW] [check_zero_coords.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/check_zero_coords.ts)
- Query: `where: { OR: [{ latitude: 0 }, { longitude: 0 }] }`
- Output: List of all affected locations (Name, ID, Postcode).

### 2. Batch Remediation
Once the list is identified (likely < 20 items), researched the correct coordinates and apply a batch fix.
#### [NEW] [fix_zero_coords.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/fix_zero_coords.ts)
- **Data Source:** Research correct lat/long for each identified location (e.g., Banbury Gateway).
- **Logic:** Iterate through the "Fix List" and update records via Prisma.

### 3. Immediate Target: Banbury Gateway
- **Banbury Gateway Shopping Park:**
  - Postcode: **OX16 3ER**
  - Location: Banbury (M40 J11)

## Verification Plan
1. Run `check_zero_coords.ts` (Pre-fix) → Expect List.
2. Run `fix_zero_coords.ts`.
3. Run `check_zero_coords.ts` (Post-fix) → Expect "No locations found".
