# Regional Cluster Saturation Workflow

The **Regional Cluster Saturation** strategy is a phased approach to achieving 100% data density within specific geographical markets. It moves beyond ad-hoc enrichment to create "Healthy Clusters" that enable deep comparative analytics (Discovery -> Comparison).

## 1. The Radius-Based Priority Model

Saturation is organized into three priority bands centered on a flagship asset (e.g., Highcross, Leicester).

| Band | Range | Density Goal | Focus |
|------|-------|--------------|-------|
| **Core** | 0-5 Miles | 100% | Direct competitors and high-frequency catchment assets. |
| **Mid-Range** | 5-10 Miles | >80% | Strategic regional shopping destinations. |
| **Peripheral** | 10-20 Miles | >50% | Supporting retail nodes and secondary markets. |

## 2. Execution Phases

### Phase 1: Landscape Audit
- Run a database query to identify assets matching the target radius.
- Perform a "Field Score" audit (0-7 scale) to identify gaps:
    1. Website
    2. Opening Hours
    3. Retail Space (GLA)
    4. Store Count
    5. Ownership/Management
    6. Consumer Sentiment (Google Rating)
    7. Catchment Demographics (Population/Income)

### Phase 2: Tenant Saturation (Ground Truth)
- Use **Firecrawl** or manual research to extract full tenant lists.
- Populate the `Tenant` database model.
- **Critical Step**: Execute `scripts/sync-location-stats.ts` to update the `Location` summary fields (numberOfStores, anchorTenants) from the live tenant data.

### Phase 3: Core Property Enrichment (P0-P1)
- Verify official websites.
- Extract operational data: parking spaces, floor area, opened year.
- Verify ownership and management (Savills, M Core, LCP, etc.).

### Phase 4: Digital & Demographic Layer
- Populate social media handles (Instagram, Facebook).
- Fetch Google Ratings and Review counts.
- Apply **LTLA Census 2021** demographics to the location's district.
- **computed Fallback**: Ensure the UI utilizes the [Computed Fallback Pattern](../../frontend/v2_ui_architecture.md#66-unified-comparison-badge-pattern) if specific vsNational data is missing.

## 3. Tooling Reference
- **Skill**: `.agent/skills/location-enrichment`
- **Scraper**: `scripts/firecrawl-tenant-enrichment.ts`
- **Sync**: `scripts/sync-location-stats.ts`
- **Audit**: `scripts/audit_location.py`

## 4. Case Study
- **Leicester Cluster (Feb 2026)**: Targeted 16 assets near Highcross. Transitioned "Swan Centre" from a regional mismatch to a local Rugby asset and identified redevelopment sites like Riley Square.
