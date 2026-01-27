# Plan: Refine Address Parsing

> **Goal:** Accurately extract the `street` field from the raw `address` string by intelligently filtering out the Location Name, City, and Postcode.

## Problem
Currently, the `street` extraction can be too aggressive or too lenient.
- **Aggressive:** "Commercial Road" is removed because the Name is "Commercial Road Retail Park".
- **Lenient:** "Royal Priors Shopping Centre" remains if we don't fuzzy match.

## Proposed Changes

### 1. Refined Extraction Script
We will create a specific script to re-process the `street` field.
#### [NEW] [refine_addresses.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/refine_addresses.ts)
- **Logic:**
  1. Fetch all locations.
  2. Split `address` by `,`.
  3. **Iterate** through parts:
     - **Clean:** Trim whitespace.
     - **Skip** if part matches `town`, `city`, `district`, `county`, `country` (Exact or Fuzzy).
     - **Skip** if part validates as a `postcode`.
     - **Analyze vs Name:**
       - If part is contained in `name` (e.g. "Commercial Road" inside "Commercial Road Retail Park")...
       - **CHECK SUFFIX:** If part ends in `Street`, `Road`, `Way`, `Lane`, `Drive`, `Avenue`, `Place`, `Square`, `Parade`, `Close`, `Court` -> **KEEP IT**.
       - Else -> **DISCARD IT** (It's likely just the building name, e.g. "The Centre").
  4. **Select** the first remaining valid part as `street`.

## Verification
- **Test Case:** "Royal Priors Shopping Centre, Warwick Street"
  - Part 1: "Royal Priors..." (Matches Name, No Suffix) -> Discard.
  - Part 2: "Warwick Street" (Matches Suffix) -> **KEEP**.
- **Test Case:** "Commercial Road, Ipswich" (Name: Commercial Road Retail Park)
  - Part 1: "Commercial Road" (Matches Name, Has Suffix) -> **KEEP**.
- **Test Case:** "Parc Tawe, Swansea" (Name: Parc Tawe Retail Park)
  - Part 1: "Parc Tawe" (Matches Name, No Suffix) -> Discard/Review (Acceptable loss).
