# PLAN: Ultimate Overnight Enrichment Script

## Problem

After auditing 25 batches (~250+ locations), we identified **~174 dead/wrong URLs** and deleted them. **~118 locations remain with valid websites but no tenants**. The existing `auto-enrich.ts` script already has good bones (sitemap discovery, store directory patterns, GPT categorisation) but fails on many of these remaining sites because:

1. **Homepage-only stores** — Many sites (especially LCP/M Core managed parks like Fforestfach, Astle Park) list tenants directly on their homepage, not on a `/stores/` subpage. The current script only checks sitemaps + directory subpages, missing these entirely.

2. **JS-rendered content** — Sites like Westfield, The Mall, The Glades render store directories via JavaScript. Cheerio can't read them. ~15-20 of the remaining 118 are JS-heavy.

3. **Blacklist too small** — We discovered dozens of new bad domain patterns during the audit (property agents, individual store pages, leisure parks, business parks). Need expanding.

4. **No homepage fallback** — If sitemap and directory patterns both fail, the script gives up. It should try the homepage HTML as a last resort.

5. **Platform detection missing** — Several sites share the same CMS platform (e.g., the `coliseumshoppingpark.com` / `broughtonshopping.co.uk` / `forstersquare.co.uk` / `mk1shoppingpark.co.uk` family), which all have identical HTML structure. Pattern-matching these would massively improve extraction.

---

## Strategy: Two-Phase Approach

### Phase 1: Enhanced `auto-enrich.ts` (Static Scraping — 80% of remaining)

Improvements to the existing script that will unlock most remaining enrichable locations:

#### 1A. Expand blacklist (~20 new domains)
Add all domains identified during the audit that we missed:
```
poi.place, domain-parking.uk, ukbackorder.uk, perfectdomains.co.uk,
easyspace.com, networkspace.co.uk, consolprop.co.uk, derwentlondon.com,
evolveestates.com, marshallcdp.com, clowes.co.uk, nrr.co.uk,
parkopedia.co.uk, explore*.com (directory listings),
*.gov.uk, *.org.uk (non-retail)
```

#### 1B. Homepage fallback strategy
After sitemap + directory pattern strategies fail, add:
1. Fetch the homepage HTML
2. Check if it contains 10+ recognised retail brand names (from a known-brands list)
3. If yes → send to GPT for extraction
4. This catches all the LCP/M-Core sites and small retail parks that list tenants on the homepage

#### 1C. Known-brands quick extraction
Before sending to GPT (which is slow + costs money), do a quick local regex scan for ~200 known UK retail brands. If we find 5+ matches on a page, we can:
- Extract these directly without GPT
- Use GPT only for the remainder/category classification
- This is faster, cheaper, and works for JS-rendered pages if we can get the HTML

#### 1D. Broader store directory patterns
Add patterns discovered during audit:
```
/whos-here, /who-s-here, /whats-on, /our-shops,
/store-directory-2, /food, /food-drink,
/stores-and-restaurants, /explore, /units
```

#### 1E. Better error categorisation & reporting
Instead of just "No store directory found", categorise failures:
- `SITEMAP_EMPTY` — No sitemap found
- `DIRECTORY_EMPTY` — Directory page found but empty HTML
- `NO_TENANTS_EXTRACTED` — HTML found but GPT couldn't extract
- `JS_RENDERED` — HTML too small / looks like a SPA shell
- `TIMEOUT` — Connection/processing timeout
- `BLOCKED` — 403/captcha detected

This feeds into Phase 2 targeting.

### Phase 2: Playwright Scraping for JS-Rendered Sites (~15-20 locations)

For sites classified as `JS_RENDERED` in Phase 1:

#### 2A. Focused Playwright script
- A separate, smaller script: `auto-enrich-js.ts`
- Targets only Phase 1 `JS_RENDERED` failures
- Uses Playwright to render the page, wait for store lists to load
- Extracts the rendered DOM HTML, then feeds to the same GPT pipeline
- Rate limited: 1 site every 10s (Playwright is heavy)

#### 2B. Known JS sites from audit
Sites we identified as JS-rendered during manual audit:
- Westfield (London, Stratford) — `westfield.com`
- Westside Plaza — `thewestsidecentre.co.uk`
- Teesside Park — `teessideshopping.co.uk`
- The Galleries Washington — `gallerieswashington.co.uk`
- Caledonia Park — `caledoniapark.com`
- Several others

---

## Implementation: What Changes in `auto-enrich.ts`

### File: `scripts/auto-enrich.ts`

#### [MODIFY] Blacklist expansion (line ~629)
Add ~20 new blacklisted domains from audit findings.

#### [MODIFY] `discoverStoreDirectoryUrl()` (line ~306)
Add Phase 3: Homepage fallback after sitemap + pattern strategies fail.

#### [MODIFY] Store directory patterns (line ~37)
Add ~8 new URL patterns discovered during audit.

#### [NEW] `extractTenantsViaKnownBrands()` function
Quick regex-based scan of HTML for ~200 known UK retail brand names. Returns matches without needing GPT. Used as fast pre-check and JS-detection.

#### [NEW] `isJsRenderedPage()` function  
Heuristic to detect JS-rendered pages:
- HTML length < 2000 chars but page title exists
- Contains `__NEXT_DATA__` or `window.__` or `<div id="app"></div>`
- No `<a>` tags but has `<script>` tags

#### [MODIFY] `enrichLocation()` (line ~610)
Add Phase 1B/1C homepage fallback chain:
1. Try sitemap → directory patterns (existing)
2. If fail → fetch homepage
3. Run known-brands scan
4. If 5+ matches → extract and categorise
5. If < 5 but page looks JS-rendered → flag as `JS_RENDERED`

#### [MODIFY] Error reporting
Add failure categorisation to the results summary.

### File: `scripts/auto-enrich-js.ts` [NEW]

Small script (~150 lines) that:
1. Queries DB for locations with websites but no tenants
2. Filters to only known JS-heavy domains
3. Uses Playwright to render each page
4. Extracts DOM HTML post-render
5. Feeds to the same GPT categorisation pipeline
6. Saves tenants to DB

---

## Known Brands List (Top ~200 UK Retail)

Core brands to include in the quick-scan regex:

**Fashion**: Primark, Next, H&M, New Look, River Island, TK Maxx, JD Sports, Sports Direct, Zara, Schuh, Clarks, Footasylum, Fat Face, White Stuff, Superdry, Jack & Jones, Mango, Monsoon

**Food/Coffee**: McDonald's, Costa, Starbucks, Greggs, Subway, KFC, Nando's, Pizza Express, Wagamama, Burger King, Tim Hortons, Five Guys, Frankie & Benny's, TGI Fridays, Caffè Nero, Pret

**Department/Anchor**: M&S, Marks & Spencer, John Lewis, Debenhams, TK Maxx, Primark, IKEA, Argos, Wilko

**Health & Beauty**: Boots, Superdrug, Holland & Barrett, The Body Shop, Lush, Specsavers, Vision Express

**Electronics**: Currys, EE, O2, Vodafone, Three, Game

**Home**: DFS, Sofology, B&Q, The Range, Home Bargains, B&M, Dunelm, Matalan, HomeSense

**Grocery**: Tesco, Sainsbury's, Aldi, Lidl, Asda, Morrisons, Co-op

**Services**: TUI, Hays Travel, Post Office, Timpson

**Entertainment**: Cineworld, Odeon, Vue, PureGym, The Gym, JD Gyms

---

## Overnight Run Plan

```bash
# Phase 1: Enhanced static enrichment (runs ~2-3 hours for 118 locations)
npx tsx scripts/auto-enrich.ts --batch 118 2>&1 | tee /tmp/enrich-overnight.log

# Phase 2: JS-rendered sites (runs after Phase 1, ~30 min for ~20 sites)  
npx tsx scripts/auto-enrich-js.ts 2>&1 | tee /tmp/enrich-js-overnight.log
```

Expected results:
- **Phase 1** should successfully enrich ~60-80 of the 118 remaining locations
- **Phase 2** should catch an additional ~10-15 JS-rendered sites
- **Total**: ~70-95 locations enriched overnight (60-80% success rate)

---

## Verification

After overnight run:
```bash
# Check how many locations now have tenants
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.location.count({ where: { tenants: { some: {} } } }).then(c => console.log('With tenants:', c));
p.location.count({ where: { website: { not: null }, tenants: { none: {} } } }).then(c => console.log('Still empty:', c));
"

# Review the log for failures
grep "❌\|⏰\|🚫" /tmp/enrich-overnight.log
```
