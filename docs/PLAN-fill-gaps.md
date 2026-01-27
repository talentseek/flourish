
# Plan: Filling Data Gaps (Enrichment Phase 2)

## Goal
Enrich the **603 locations** that now have verified websites with missing P0-P3 data (Socials, Operations, Commercial), leveraging the `location-enrichment` skill protocols.

## User Review Required
> [!IMPORTANT]
> **Focus on "Verified" Locations**
> We will strictly target the ~600 locations *with* websites first, as they provide the highest ROI for automated enrichment (reading their pages).
>
> **Enrichment Priorities (per Skill)**
> 1.  **Digital (P3):** Social Media Links (Instagram, Facebook).
> 2.  **Operational (P1):** Opening Hours, Parking Spaces.
> 3.  **Commercial (P2):** Owner/Management (via "About Us" or Footer).

## Proposed Steps

### Phase 1: Gap Analysis
*   Create `scripts/stats-gaps.ts` to identify *exactly* which fields are empty for the 603 verified locations.
*   Output a priority list of what to target.

### Phase 2: Crawler-Based Enrichment (Tier 2 Tool Usage)
*   Since we have the URLs, we can use `read_url_content` (Puppeteer/Fetch) to parse the homepages.
*   Create `scripts/enrich-crawler.ts`:
    *   **Socials:** Extract links matching `instagram.com`, `facebook.com`, `twitter.com`.
    *   **Contact:** Extract phone numbers (Regex `0\d{3,}`).
    *   **Opening Hours:** Look for "Opening Hours" or "Visit Us" text patterns.

### Phase 3: Search-Based Enrichment (Tier 1 Tool Usage)
*   For fields NOT on the homepage (e.g. Owner, Footfall):
    *   Create `scripts/enrich-search-gaps.ts`.
    *   Cycle through specific search queries: `[Name] [City] owner`, `[Name] [City] footfall`.

### Phase 4: Reporting
*   Generate `reports/ENRICHMENT-GAP-REPORT.md` showing % completeness improvement.

## Verification Plan
*   **Check:** Run `stats-gaps.ts` before and after to quantify improvement.
*   **Spot Check:** Manually verify 5 random records to ensure "Socials" aren't just the agency's links.
