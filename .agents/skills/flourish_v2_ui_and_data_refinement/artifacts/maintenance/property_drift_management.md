# Property Drift Management Pattern

## 1. The Problem: Stale Aggregates
In systems where summary statistics (e.g., `numberOfStores`, `anchorCount`) are stored as static fields on a parent record (`Location`) while the source of truth resides in child records (`Tenants`), "Property Drift" occurs. Manual data enrichment or partial updates often lead to these summary fields becoming outdated, misleading users and stakeholders.

## 2. Decision Framework: The Flourish Case Study (Feb 05)
When addressing drift in the Highcross location page, three paths were evaluated:

| Option | Approach | Trade-offs |
|--------|----------|------------|
| **A: UI Shims** | Fix display bugs in frontend only. | Low effort, doesn't fix underlying data corruption. |
| **B: Sync + UI Fix** | Run scripts to recalculate fields + UI bug fixes. | **[Selected]** Restores integrity without breaking downstream queries or requiring schema migrations. |
| **C: Dynamic Refactor** | Remove static fields; compute aggregates on every read. | High integrity, potential performance hit and breaking changes for existing reports. |

## 3. Implementation: The Sync Script Pattern
To resolve drift without a full schema overhaul, a maintenance script (`sync-location-stats.ts`) was implemented with the following logic:

### 3.1 Recalculation Logic
1. **Fetch**: Retrieve location with all related child records (Tenants).
2. **Compute**:
   - `numberOfStores` = `tenants.length`
   - `anchorTenants` = `tenants.filter(t => t.isAnchorTenant).length`
   - `largestCategory` = Mode of `tenant.category`
   - `largestCategoryPercent` = (Count of largest category / Total count)
3. **Update**: Atomic update of the parent `Location` record with computed values.

### 3.2 UI Integration
- Ensure percentage fields (often stored as 0-1 decimals like `0.184`) are normalized in the UI: `(value * 100).toFixed(1)`.
- Hide sensitive or manually-incorrect stagnant data (e.g., legacy phone numbers) via selective suppression.

## 4. Prevention Strategies
- **Middleware/Hooks**: Use Prisma `afterUpdate` hooks to trigger a re-sync whenever a child tenant is added or deleted.
- **Scheduled Audits**: A weekly cron job to detect drift by comparing `Location.numberOfStores` with `count(Tenants)`.
- **Dynamic Counters**: Favoring Prisma's `include: { _count: { select: { tenants: true } } }` for real-time accuracy in new features.
