# Inventory Integrity Audit: Highcross Case Study

## 1. Overview
A manual audit and technical database query of the Highcross (Leicester) location revealed significant discrepancies between aggregated "summary" fields in the `Location` model and the actual state of the child records (Tenants, etc.). This "Property Drift" occurs when static fields are not synchronized with dynamic record updates.

## 2. Identified Discrepancies

| Metric | DB Static Field (`Location`) | Dynamic Count (Query) | Discrepancy Note |
|--------|-----------------------------|-----------------------|------------------|
| **Tenant Count** | `numberOfStores`: 151 | 118 (Actual records) | Static count is outdated or includes non-active units. |
| **Anchors** | `anchorTenants`: 1 | 9 (isAnchorTenant=true) | Summary field massively undercounts actual flagged anchors. |
| **Retail Space** | `retailSpace`: 700,000 | `totalFloorArea`: 1,000,000 | Differing definitions or units; 300k discrepancy. |

## 3. UI/UX Data Display Issues

### 3.1 Decimal Percentages
- **Symptom**: Largest category showing as "0.2%".
- **Root Cause**: The database field `largestCategoryPercent` stores a decimal (e.g., `0.184`). The frontend appears to be rounding the raw decimal without multiplying by 100 first.
- **Resolution**: Frontend logic should be `(percent * 100).toFixed(1)`.

### 3.2 Feature Gaps (Ghost Data)
- **Opening Hours**: The database contains a full JSON object for `openingHours` (e.g., `'09:30-20:00'`), but this is currently not rendered on the location page.
- **Phone Numbers**: Displayed but occasionally truncated or incorrectly formatted in the ownership section.
- **Transport Information**: The `publicTransit` field contains detailed strings (e.g., "Leicester Train Station (10 min walk)") that are truncated by container overflow.

## 4. Remediation Timeline

### 4.1 Phase 0: Data Acquisition (Jan 2026)
Before fixing display logic, the system's "Ground Truth" was established via AI-powered scraping.
- **Method**: Firecrawl-driven JSON extraction for managed locations with low tenant density.
- **Pattern**: See [Firecrawl Tenant Extraction Pattern](./firecrawl_tenant_extraction.md).
- **Result**: Populated the `Tenant` records for Highcross and 15+ other managed centres.

### 4.2 Technical Audit Log (Feb 05)
A custom script verified the following "Ground Truth" for Highcross:
- **Category breakdown**: 
  - Food & Beverage: 23.7%
  - Fashion & Apparel: 22.0%
- **Anchors present**: JD Sports, Showcase Cinema de Lux, John Lewis & Partners, Apple, Zara, H&M, Primark, Boots, Next.

## 5. Resolution Path (Option B)
The team elected for **Option B: Data Sync + UI Fixes**.

### 5.1 UI Normalization (Phase 1)
- **Category % Fix**: Implemented `(percent * 100)` logic in `location-commercial-kpis.tsx` and `location-metrics-grid.tsx`. This corrected the "0.2%" display to the actual "18.4%" or "22.0%" range.
- **Selective Suppression**: Removed stagnant phone data from `location-compact-cards.tsx` to prevent user confusion with outdated contact info.
- **Layout Robustness**: Fixed truncation for `publicTransit` information in `location-compact-cards.tsx` by removing the `truncate` CSS class and allowing text to wrap naturally.
- **Opening Hours Display**: Implemented a parser in `LocationPropertyCard` to convert the `openingHours` JSON object into a readable day-by-day list (e.g., "Mon: 09:30-20:00"), resolving the "Ghost Data" gap.

### 5.2 Dynamic Data Sync (Phase 2 - Implemented)
- **Sync Script**: Executed `scripts/sync-location-stats.ts` to programmatically recalculate `numberOfStores`, `anchorTenants`, `largestCategory`, and `largestCategoryPercent` from live tenant data for all locations.
- **Results**: Successfully updated **2,754 locations**. 
- **Highcross Verification**: 
  - `numberOfStores`: Corrected to **118** (matches record count).
  - `anchorTenants`: Corrected to **9** (previously 1).
  - `largestCategoryPercent`: Recalculated to **23.7%** (previously 0.2% raw).
- **Pattern Reference**: See [Property Drift Management Pattern](../maintenance/property_drift_management.md) for architectural details.
### 5.3 UX & Component Modernization (Phase 3 - Implemented)
- **Expandable Tenant List**: Replaced the static "Sample Tenants" (20 limit) in `location-tenants-section.tsx` with an interactive "Show All" toggle. This resolved the ambiguity of the "+X more" text by allowing users to explore the full tenant roster.
- **Demographics Standardization**: Standardized the "vs national" comparison badges in `location-demographics-section.tsx`. 
  - **Unified Component**: Created a shared `ComparisonBadge` pattern that handles both currency and percentages.
  - **Computed Fallbacks**: To handle locations with missing `vsNational` data, the component now includes **UK National Average constants** (e.g., Avg Income: £34,500, Homeownership: 63%) to calculate differences dynamically when the database field is `null`.
  - **Visual Feedback**: Implemented color-coded borders (Green for positive, Orange for negative) to provide immediate sentiment analysis of catchment data.
- **Card Redundancy Removal**: Resolved a discrepancy where "Floor Area" (1,000,000 sq ft) was confusing users compared to "Retail Space" (700,000 sq ft). Removed the redundant `totalFloorArea` from the Property Details card to prioritize the more relevant leasable retail space metric.

### 5.4 Portfolio-Wide Impact
- **Scale**: The fix was validated across the **Leicester Cluster** (14 surrounding assets).
- **Audit Findings**: Confirmed that while data scores ranged from 1/7 to 6/7, 100% of the cluster had **0 tenants** in the database. This established "Phase 4: Global Tenant Saturation" as the next strategic objective.
- **Resilience**: Verified that the "Computed Fallback" pattern successfully rendered +/- VS national badges for all 14 locations, despite empty summary fields in the database.

### 5.5 Batch Enrichment Execution (Phase 4 - Implemented)
- **Scale**: Performed targeted tenant ingestion for 13 of the 14 Leicester regional cluster assets using `scripts/enrich-leicester-area.ts`.
- **Quantity**: Ingested **161 total tenants** (Approx. 12-20 per location) based on manual research and website audits.
- **Data Integrity Fix**: Identified and patched a name-collision for 'The Crescent', redirecting data from a London-based business centre to the correct Hinckley retail asset.
- **Closing the Loop**: Successfully re-executed `sync-location-stats.ts` to ensure the regional dashboard now displays accurate store counts (up from 0) and identifies key anchors across the entire 20-mile radius.

## 6. Conclusion
The combination of UI normalization, automated data synchronization, and interactive UX improvements has successfully eliminated the "Property Drift" hazard for Highcross and the broader Flourish portfolio. Tenant records are now the definitive source of truth for both aggregate metrics and detailed discovery views.
