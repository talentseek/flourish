# Plan: Fix 'isManaged' Flag

> **Goal:** Correct the over-assignment of the `isManaged` flag. Currently 231 sites are flagged, but only ~70 should be.
> **Root Cause:** Helper scripts have been defaulting `isManaged: true` for all new inserts.

## Strategy

1.  **Reset:** Set `isManaged = false` for ALL locations.
2.  **Re-Apply:** Set `isManaged = true` ONLY for the validated list of ~70 sites.

## 1. Information Gathering
I need the list of the 70 managed sites.
*Assumption:* The user has this list or I need to infer it from the "Seed" scripts vs "Enrichment" scripts.
*Action:* I will create a script that accepts a list of names/postcodes to toggle the flag. Since I don't have the list yet, I will create a shell script to list the current managed sites so the user can verify which ones to KEEP.

## 2. Remediation Script `fix_managed_flags.ts`
This script will:
- Take a hardcoded array of "True Managed" site names/postcodes (Golden List).
  - *Wait* - I don't have the Golden List.
  - *Alternative:* I will ask the user for the list.

## Refined Plan for Agent
1.  **Ack & Verify:** Acknowledge the error (my scripts defaulted to true).
2.  **Get Truth:** Ask the user to provide the list of 70 sites OR tell them I will reset ALL to false and they can re-enable the correct ones.
3.  **Propose Reset:** "I can reset all 231 to 'false' so you have a clean slate. Or do you have a specific list of the 70?"

*Actually, user asked "No why is this?". I should explain WHY first.*

## Explanation to User
- **Why:** The enrichment scripts (e.g., for Shropshire, Retail Parks) were written to populate the database and inadvertently set `isManaged: true` by default for every new location found.
- **Fix:** I will create a script `scripts/reset_managed_status.ts` to set all to `false`, and then we can allow you to specificy which ones to enable.

## Managed List Heuristic (Optional)
If I look at `seed-locations.ts`, those might be the original intended managed sites.
- `scripts/seed-locations.ts` likely contains the original ~50-70.
- `scripts/enrich-*.ts` are the ones adding the extra noise.

I will verify `seed-locations.ts` content.
