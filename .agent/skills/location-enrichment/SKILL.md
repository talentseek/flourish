---
name: location-enrichment
description: |
  Research and enrich retail location data from web sources. Use when populating missing database fields for shopping centres, retail parks, or outlet centres. Triggers on "enrich location", "research location", "populate location data", "find location info", "complete location fields".
  WARNING: Do not use browser_subagent unless absolutely necessary.
---

# Location Enrichment

> **Purpose:** Systematically research locations to populate missing database fields.

> **Tool Usage Strategy (CRITICAL):**
> 1. **Tier 1: `search_web`** - ALWAYS try this first for facts (years, reviews, owners).
> 2. **Tier 2: `read_url_content`** - Use when you have a specific URL (website, wiki).
> 3. **Tier 3: `browser_subagent`** - **AVOID**. Only use as absolute last resort if 403/404 errors block other methods. It is too slow for this workflow.
> 4. **FAILURE MODE:** IF `search_web` fails (500/API Error), **DO NOT STOP**. Skip to the next phase (e.g., Demographics) or use best estimates. Label the update as "Partial Enrichment".

---

## Quick Start

1. **Audit first** - Run `audit_location.py` to see missing fields
2. **Research by priority** - Core → Operational → Commercial → Digital → Demographic
3. **Generate script** - Use `generate_enrichment.py` to create update file
4. **Execute** - Run the generated enrichment script

---

## Field Priority Matrix

| Priority | Category | Key Fields |
|----------|----------|------------|
| **P0 - Core** | Contact | `website`, `phone`, `openingHours` |
| **P1 - Operational** | Operations | `parkingSpaces`, `retailSpace`, `numberOfStores`, `anchorTenants` |
| **P2 - Commercial** | Ownership | `owner`, `management`, `openedYear`, `footfall` |
| **P3 - Digital** | Social/Reviews | `instagram`, `facebook`, `googleRating`, `googleReviews` |
| **P4 - Demographic** | Census | `population`, `medianAge`, `avgHouseholdIncome` |

---

## Research Workflow

### Step 1: Find Official Website
```
Search: "[location name] official website"
Search: "[location name] shopping centre"
Extract: URL → `website` field
```

### Step 2: Contact & Hours
```
Source: Official website contact/visitor page
Source: Google Maps listing
Extract: phone, openingHours JSON
```

### Step 3: Operations Data
```
Source: Official website parking/facilities page
Source: Store directory (count stores)
Extract: parkingSpaces, numberOfStores, carParkPrice, evCharging
```

### Step 4: Ownership Research
```
Search: "[location name] owner"
Search: "[location name] acquired"
Source: PropertyData, CoStar, company announcements
Extract: owner, management, openedYear
```

### Step 5: Social Media Discovery
```
Search: "[location name]" site:instagram.com
Search: "[location name]" site:facebook.com
Verify: Check it's official (verified badge, consistent branding)
Extract: instagram, facebook, twitter, tiktok, youtube
```

### Step 6: Reviews
```
Source: Google Maps - search location name
Source: Facebook page reviews tab
Extract: googleRating (X.X), googleReviews (count), facebookRating, facebookReviews
```

### Step 7: Demographics
```
1. Identify LTLA district for location's city
2. Search ONS Census 2021 data for that LTLA
3. Extract: population, medianAge, familiesPercent, seniorsPercent
4. Calculate vs national averages
```

---

## Data Formats

### Opening Hours (JSON)
```json
{"Mon-Sat": "09:00-18:00", "Sun": "11:00-17:00"}
```
Or as string: `"Mon-Sat 09:00-18:00, Sun 11:00-17:00"`

### SEO Keywords (JSON Array)
```json
[
  {"keyword": "location name", "position": 1, "volume": 2900},
  {"keyword": "shops in city", "position": 3, "volume": 1200}
]
```

### Top Pages (JSON Array)
```json
[
  {"url": "/stores", "traffic": 8500, "percentage": 28},
  {"url": "/parking", "traffic": 4800, "percentage": 16}
]
```

---

## Scripts

| Script | Usage |
|--------|-------|
| `audit_location.py` | `python scripts/audit_location.py "Location Name"` |
| `generate_enrichment.py` | `python scripts/generate_enrichment.py <location-id>` |
| `validate_data.py` | `python scripts/validate_data.py <json-file>` |

---

## Common Data Sources

| Data Type | Primary Source | Backup Source |
|-----------|----------------|---------------|
| Website/Contact | Official site | Google Maps |
| Parking | Official site | Parkopedia |
| Ownership | Company site | PropertyData |
| EV Charging | Official site | Zap-Map, PlugShare |
| Footfall | Press releases | Owner annual report |
| Demographics | ONS Census 2021 | NOMIS |
| Social | Platform search | Google search |

---

## Verification Checklist

Before submitting enrichment:
- [ ] Phone number in UK format (+44 or 0XXXX)
- [ ] Website URL is valid and accessible
- [ ] Rating is decimal (e.g., 4.3, not 43)
- [ ] Footfall is annual (not weekly/monthly)
- [ ] Demographics match LTLA district
- [ ] Social URLs are official accounts

---

## Reference Files

For detailed guidance:
- **[research-workflow.md](references/research-workflow.md)** - Step-by-step procedures
- **[data-sources.md](references/data-sources.md)** - Authoritative sources list
- **[uk-demographics.md](references/uk-demographics.md)** - Census data extraction
- **[field-schema.md](references/field-schema.md)** - Expected data types
