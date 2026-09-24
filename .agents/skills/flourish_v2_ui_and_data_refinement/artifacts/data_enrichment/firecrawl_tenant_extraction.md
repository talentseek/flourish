# Firecrawl Tenant Extraction Pattern

To saturate the managed location portfolio with high-accuracy tenant data, an AI-powered extraction pattern was implemented using **Firecrawl**. This replaces fragile HTML parsing with LLM-orchestrated JSON extraction.

## 1. Technical Strategy

### 1.1 JSON Schema Matching
The extraction uses a strict JSON schema to ensure the LLM returns structured data that maps directly to the `Tenant` database model.

```json
{
    "type": "object",
    "properties": {
        "stores": {
            "type": "array",
            "description": "List of all stores, shops, restaurants and tenants",
            "items": {
                "object",
                "properties": {
                    "name": { "type": "string", "description": "Store/shop name" },
                    "category": { "type": "string", "description": "Category like Fashion, Food & Drink, etc" }
                },
                "required": ["name"]
            }
        }
    },
    "required": ["stores"]
}
```

### 1.2 URL Pattern Discovery
Shopping centre websites vary inconsistently. The script attempts discovery by appending common directory suffixes to the base URL:
- `/stores`
- `/shops`
- `/shopping`
- `/all-retailers`
- `/directory`

### 1.3 Deduplication (Upsert)
To maintain data integrity without creating duplicate records on repeated runs, a Prisma `upsert` pattern is used, keyed by the unique combination of `locationId` and `name`.

## 2. Efficiency & Budgeting
- **Safety Cap**: Credit usage is monitored against a strict safety limit (e.g., 100 credits per run) to manage Firecrawl API costs.
- **Progress Tracking**: Processed IDs are stored in a local state file to prevent redundant scraping of the same location.
- **Heuristic Filtering**: Only locations with fewer than 10 tenants are prioritized for enrichment.

## 3. Results (Jan 2026)
Successfully enriched 16 managed locations that were previously "dark assets" with no tenant data. This data served as the "Ground Truth" for the inventory integrity audits and sync scripts performed in Feb 2026.

## 4. Maintenance Script
- **Source**: `scripts/firecrawl-tenant-enrichment.ts`
- **Pattern Reference**: See [Property Drift Management Pattern](../maintenance/property_drift_management.md) for how this data is utilized.
