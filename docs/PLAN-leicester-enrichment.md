# Leicester Area Enrichment Plan

> **Objective:** Enrich locations within 20 miles of Highcross to complete the East Midlands retail intelligence map.

---

## Scope Summary

| Radius | Locations | Current State |
|--------|-----------|---------------|
| **5 miles** | 3 | 3-4/7 fields, 0 tenants |
| **10 miles** | 2 | 1-2/7 fields, 0 tenants |
| **20 miles** | 9 | 1-6/7 fields, mostly 0 tenants |

**Total:** 14 locations requiring enrichment

---

## Priority 1: 5-Mile Radius (Core Competitors)

| Location | City | Score | Priority Fields |
|----------|------|-------|-----------------|
| Haymarket Shopping Centre | Leicester | 4/7 | tenants, openingHours, googleRating |
| Beaumont Shopping Centre | Leicester | 4/7 | tenants, population, footfall |
| Fosse Park | Leicester | 3/7 | tenants, website, retailSpace |

**Enrichment Focus:** These directly compete with Highcross - need full tenant data + commercial KPIs.

---

## Priority 2: 10-Mile Radius

| Location | City | Score | Priority Fields |
|----------|------|-------|-----------------|
| Town Square | Lutterworth | 1/7 | ALL (nearly empty) |
| The Rushes | Loughborough | 2/7 | tenants, website, owner, parking |

---

## Priority 3: 20-Mile Radius

| Location | City | Score | Status |
|----------|------|-------|--------|
| Belvoir Shopping Centre | Coalville | 4/7 | Needs tenants |
| Britannia Shopping Centre | Hinckley | 4/7 | Needs tenants |
| Bell Shopping Centre | Melton | 4/7 | Needs tenants |
| Abbeygate Shopping Centre | Nuneaton | 4/7 | Needs tenants |
| Ropewalk Shopping Centre | Nuneaton | 5/7 | Best enriched - needs tenants |
| Rugby Central | Rugby | 4/7 | Needs tenants |
| Swadlincote Shopping Centre | Swadlincote | 1/7 | Nearly empty |

> **Notes:**
> - Swan Centre matched to Eastleigh (wrong region) - verify correct Leicester-area match
> - Riley Shopping and The Crescent not found - may need to create or verify names

---

## Enrichment Workflow

### Phase 1: Tenant Scraping (Highest Impact)
For each location: Find store directory → Extract tenant names + categories → Run sync script

### Phase 2: Core Data (P0-P1)
Per location: website, phone, openingHours, parkingSpaces, retailSpace, owner, management

### Phase 3: Reviews & Social (P3)
googleRating, googleReviews, Instagram, Facebook handles

### Phase 4: Demographics (P4)
Apply respective LTLA Census data to each location

---

## Execution Options

**Option A: Manual Sequential** - 1-2 locations per session (~7 sessions)
**Option B: Batch Research** - Research all in parallel, batch tenant scraping (~3 sessions)

**Recommendation:** Option B - Batch approach is more efficient.

---

## Questions

1. Should we create Riley Shopping and The Crescent as new locations?
2. Tenant priority: Firecrawl scraping or manual research?
3. Demographics: Apply Leicester LTLA (city-wide) or postcode-specific?
