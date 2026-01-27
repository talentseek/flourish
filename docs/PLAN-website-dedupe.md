
# Plan: Strictly Website-Based Deduplication

## Goal
Identify and merge duplicate `Location` records **ONLY** if they share the same normalized `website` URL. This eliminates "name-only" false positives.

## User Review Required
> [!IMPORTANT]
> **Strict Logic Definition**
> 1.  **Primary Key:** Normalized Website URL (e.g., `https://touchwoodsolihull.co.uk` == `http://www.touchwoodsolihull.co.uk/`).
> 2.  **Exclusion:** Ignore records *without* websites.
> 3.  **Sanity Check:** Even if websites match, we will verify:
>     *   **Name Similarity:** Levenshtein < 5 OR Substring match.
>     *   **Distance:** Must be < 5km (Allowing for some bad coordinate data, but preventing "Chain" matches like `westfield.com` matching London vs Stratford if they share a root).
>
> **Handling "Chain" URLs**
> *   If two locations share `www.westfield.com` (root only) but are > 10km apart, they are **NOT** duplicates (Different branches).
> *   If they share `www.westfield.com/london`, they **ARE** duplicates.

## Proposed Steps

### Phase 1: Website-First Analysis Script
Create `scripts/reporting/dedupe-website.ts`:
1.  Fetch all locations with non-null `website`.
2.  Normalize URLs (strip protocol, www, trailing slash).
3.  Group by Normalized URL.
4.  Filter groups:
    *   Must have > 1 record.
    *   Must pass Sanity Check (Name OR Proximity).

### Phase 2: Report Generation
Generate `reports/DEDUPE-WEBSITE-ONLY.md`:
*   List groups found by Website Match.
*   Show the "Distance" between them to highlight data issues.
*   Propose "Survivor" based on Enrichment Score (same as before).

### Phase 3: Execution
*   After verification, merge these groups.

## Benefits
*   **Zero False Positives** on unrelated entities (e.g., "The Galleries" Washington vs Bristol won't match if they have different/no websites).
*   **Fixes "Touchwood":** Since both entries likely share `touchwoodsolihull.co.uk`, they will be caught.

## Verification Plan
*   **Check:** Ensure "Touchwood" is captured.
*   **Check:** Ensure "Westfield" (London vs Stratford) are **NOT** captured (unless they share exact same deep link).
