# Landsec Location Enrichment — St David's, Clarks Village, Xscape MK

> **Request from:** Cathy Meadows (Commercial Lead, Public Realm Retail) via Paul
> **Date:** 2026-02-13
> **Goal:** Fully enrich three Landsec locations so we can generate reports

---

## Current State (Live DB Audit)

| Field | St David's Dewi Sant | Clarks Village | Xscape Milton Keynes |
|-------|---------------------|----------------|---------------------|
| **ID** | `cmks95l…ctx` | `cmid0jn…o4u` | `cmksema…97w` |
| **Type** | SHOPPING_CENTRE ✅ | OUTLET_CENTRE ✅ | SHOPPING_CENTRE ⚠️ |
| Website | ✅ | ✅ | ✅ |
| Phone | ✅ (bad format) | ✅ | ✅ (no spaces) |
| Coords | ✅ | ✅ | ✅ |
| Parking | ✅ 2,000 | ✅ 1,400 | ✅ 1,000 |
| Floor Area | ✅ 1,400,000 | ✅ 18,460 | ✅ 645,000 |
| **Stores** | ❌ 0 | ❌ 0 | ❌ 0 |
| **Anchor Tenants** | ❌ 0 | ❌ 0 | ❌ 0 |
| **Owner** | ❌ null | ✅ Landsec | ❌ null |
| **Management** | ❌ null | ✅ Landsec | ✅ Workman LLP |
| Opening Hours | ❌ null | ✅ | ❌ null |
| Footfall | ❌ null | ❌ null | ❌ null |
| Opened Year | ❌ null | ❌ null | ❌ null |
| Google Rating | ❌ null | ✅ 4.3 | ❌ null |
| Google Reviews | ❌ null | ✅ 13,530 | ❌ null |
| Instagram | ✅ | ✅ | ✅ |
| Facebook | ✅ | ✅ | ✅ |
| Health Index | ❌ null | ✅ 54 | ❌ null |
| Vacancy | ❌ null | ✅ 8.79% | ❌ null |
| EV Charging | ❌ false | ❌ false | ❌ false |
| Population | ✅ 360k | ✅ 193k | ❌ null |
| Median Age | ✅ 33 | ❌ null | ❌ null |
| Avg Income | ✅ £27k | ❌ null | ❌ null |
| **Tenants** | ❌ **0** | ❌ **0** | ❌ **0** |

### Critical Blockers for Reports

1. **Zero tenants** — Gap analysis and tenant mix reports require tenant data
2. **Missing Google reviews** — Required for sentiment/reputation sections
3. **Missing footfall** — Key metric for any commercial report
4. **Xscape type is wrong** — Cathy calls it "Leisure Park"; DB says SHOPPING_CENTRE

---

## Proposed Enrichment Plan

### Phase 1: Web Research (search_web + read_url_content)

For each location, research and collect:

| Priority | Fields | Source |
|----------|--------|--------|
| P0 Core | openingHours, phone (fix format) | Official website |
| P1 Operational | numberOfStores, anchorTenants, retailSpace, evCharging/Spaces | Official site + Zap-Map |
| P2 Commercial | owner, management, openedYear, footfall | Landsec annual report, press releases |
| P3 Digital | googleRating, googleReviews | Google search |
| P4 Demographic | population, medianAge, avgHouseholdIncome (MK only) | ONS Census 2021 |

**Order:** St David's → Clarks Village → Xscape MK (most gaps → fewest)

### Phase 2: Tenant Scraping

Scrape tenant directories from each location's official website:
- **St David's:** `https://stdavidscardiff.com/` → store directory
- **Clarks Village:** `https://clarksvillage.co.uk/` → store directory
- **Xscape MK:** `https://xscapemiltonkeynes.co.uk` → store directory

For each tenant, extract: name, category, subcategory, unitNumber (if available), isAnchorTenant.

### Phase 3: Database Update Script

Generate a single `scripts/enrich-landsec-trio.ts` script that:
1. Updates all researched fields for each location
2. Fixes Xscape MK `type` to appropriate value (needs user decision - see below)
3. Upserts all scraped tenants
4. Updates `numberOfStores` and `anchorTenants` counts

### Phase 4: Verification

1. Re-query DB to confirm all fields populated
2. Run `pnpm build` to ensure no breakage
3. Spot-check tenant counts against official site

---

## User Review Required

> [!IMPORTANT]
> **Xscape MK Location Type:** Cathy calls it "Leisure Park" but our DB enum only has: `SHOPPING_CENTRE`, `RETAIL_PARK`, `OUTLET_CENTRE`, `HIGH_STREET`. There is no `LEISURE_PARK` type. Should we:
> - **(A)** Keep as `SHOPPING_CENTRE` (closest match)
> - **(B)** Change to `RETAIL_PARK` (alternative match)
> - **(C)** Add a new enum value `LEISURE_PARK` to the schema (requires migration)

> [!IMPORTANT]
> **St David's phone number** is currently `075273505721` which looks wrong (too many digits). Should be `029 2037 7171` per the website. Will fix during enrichment.

> [!NOTE]
> **Clarks Village floor area** is `18,460` sqft — but the Landsec portal shows `203,235 sqft`. The DB value may be the land area in sqm not sqft. Will verify and correct.

---

## Verification Plan

### Automated
```bash
# After enrichment script runs, verify:
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function v() {
  const ids = ['cmks95l980005fajkx22y1ctx','cmid0jnny00fimtpupmc75o4u','cmksemajw000boqpn46fxb97w'];
  for (const id of ids) {
    const l = await p.location.findUnique({ where:{id}, include:{_count:{select:{tenants:true}}} });
    console.log(l.name, '| tenants:', l._count.tenants, '| rating:', l.googleRating, '| footfall:', l.footfall);
  }
  await p.\$disconnect();
}
v();
"
```

### Manual
- User confirms tenant counts look reasonable against official websites
- User reviews the Landsec portal page to verify locations appear correctly

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Phase 1: Web Research | ~15 min per location (45 min total) |
| Phase 2: Tenant Scraping | ~10 min per location (30 min total) |
| Phase 3: Script Generation | ~10 min |
| Phase 4: Verification | ~5 min |
| **Total** | **~90 min** |
