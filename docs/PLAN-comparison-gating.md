# Comparison Stage — Default Filter & Enrichment Gating

## Goal

Two improvements to the comparison setup stage (`stage=3`):

1. **Default type filter** → only Shopping Centres (currently Shopping Centre + Retail Park + Outlet Centre)
2. **Enrichment gating** → locations without sufficient tenant data are visible but **not selectable** for comparison

## Proposed Changes

### [MODIFY] [comparison-setup-stage.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/dashboard2/comparison-setup-stage.tsx)

#### Change 1: Default to Shopping Centre only (line 37-41)

```diff
-const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([
-  'SHOPPING_CENTRE',
-  'RETAIL_PARK',
-  'OUTLET_CENTRE'
-])
+const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([
+  'SHOPPING_CENTRE'
+])
```

#### Change 2: Enrichment gating on location cards (lines 380-426)

**Logic:** A location is "selectable" if `location.tenants.length >= 5`. Below that threshold, the card shows as disabled with a reason badge.

- Card gets `opacity-50 cursor-not-allowed` classes when not selectable
- Checkbox is disabled
- A badge shows the reason: "Under Renovation", "Insufficient Data", or "No Tenant Data"
- `handleSelectAll` (line 140) only selects enriched locations
- `handleToggleCompetitor` (line 132) blocks non-selectable locations

**Threshold rationale:** 5 tenants is a reasonable minimum — any location with fewer than 5 tenants either hasn't been enriched or is too small/under renovation to compare meaningfully.

#### Enrichment status helper

```typescript
const MIN_TENANTS_FOR_COMPARISON = 5

const getEnrichmentStatus = (location: Location) => {
  if (location.tenants.length === 0) return { selectable: false, reason: "No Tenant Data" }
  if (location.tenants.length < MIN_TENANTS_FOR_COMPARISON) return { selectable: false, reason: "Insufficient Data" }
  return { selectable: true, reason: null }
}
```

## No Schema Changes Required

The `tenants` array is already loaded and available on the `Location` type. No new DB fields or migrations needed.

## Verification

1. Visit `dashboard2?location=cmid0l5je01zbmtpur0n9pcyh&stage=3` (Touchwood)
2. Confirm only Shopping Centres checked by default
3. Confirm St John's Way (12 tenants) is selectable, Mell Square (26), Parkgate (23), Resorts World (39) all selectable
4. Any location with <5 tenants shows as disabled with reason badge
5. "Select All" only selects enriched locations
