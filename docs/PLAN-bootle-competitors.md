# PLAN: Bootle Area Competitor Enrichment

> **Goal:** Enrich 8 competitor shopping centres within 5 miles of The Strand Shopping Centre, Bootle. Populate tenant lists (CACI categories), metadata, and key operational fields to support gap analysis.

---

## Context

The Strand Shopping Centre was fully enriched (69 tenants, CACI categorised) in the preceding task. Now the surrounding competitive landscape needs populating to enable gap analysis and regional comparison.

All 8 locations already exist in the database but have **0 tenants** (except Central Square Maghull with 4).

---

## Location Summary

| # | Location | DB ID | Distance | Current Tenants | Est. Stores | Data Source |
|---|----------|-------|----------|----------------|-------------|-------------|
| 1 | Cherry Tree SC, Wallasey | `cmid0krqb01l5mtpum7y64e0q` | 3.1 mi | 0 | ~35 | Web search (site DNS unreachable) |
| 2 | Metquarter, Liverpool | `cmid0kwuj01q9mtpulfwyf1tq` | 3.1 mi | 0 | ~15 | Web search + metquarter.com |
| 3 | St. Johns SC, Liverpool | `cmid0l0qs01ucmtpuj6aeqmxy` | 3.2 mi | 0 | ~100 | Web search + stjohns-shopping.co.uk |
| 4 | Cavern Walks SC, Liverpool | `cmid0krga01kumtpuobokngi5` | 3.2 mi | 0 | ~12 | Web search |
| 5 | Churchill SC, Liverpool | `cmid0krx501lcmtpu5m5s21kr` | 3.2 mi | 0 | ~8 | Web search (small parade) |
| 6 | Clayton Square SC, Liverpool | `cmid0ks3w01ljmtpu0hidsg8s` | 3.2 mi | 0 | ~20 | Web search + claytonsquare.co.uk |
| 7 | Liverpool ONE | `cmid0kw0e01pdmtpu3jwhpqaf` | 3.3 mi | 0 | ~170 | Web search + liverpool-one.com |
| 8 | Central Square Maghull | `cmicxw4br000c13hx99elsjlo` | 4.9 mi | 4 | ~20 | Web search + lcpgroup.co.uk |

---

## Proposed Changes

### [NEW] [enrich-bootle-competitors.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/enrich-bootle-competitors.ts)

Single TypeScript script following the same pattern as `enrich-strand-bootle.ts` and `enrich-cardiff-competitors.ts`. The script will:

1. **Update location metadata** for each of the 8 centres (website, owner, numberOfStores, openedYear, openingHours, management where available)
2. **Delete-and-replace tenants** for each centre with CACI-categorised tenant lists sourced from web research
3. **Update `largestCategory` / `largestCategoryPercent`** based on the inserted tenants
4. **Verify all 8** post-enrichment with category breakdowns

### Research Findings Per Location

---

#### 1. Cherry Tree SC, Wallasey (~35 tenants)

**Source:** cherrytreeshoppingcentre.co.uk (DNS unreachable during test, but data from web search confirmed)

**Tenants identified:** Admiral Casino, B&M, Barrhead Travel, Beresfords Butchers, Bonmarche, Card Factory, Cash Converters, Coffee House, Costa, E-Vapes, EE, Hays Travel, Heron Foods, Holland & Barrett, Hollywood Brow Bar, Home Bargains, Market (multiple stalls), Max Spielmann, Outlet Store, Partell, Poundbakery, Primark, Savers, Scrivens Opticians, Smart Dental, Specsavers, Supernews, Wallasey Lions Charity Book Shop, Waterfields Choice, Wirral Trade Hub, YMCA, Age UK

**Metadata:** 39 units, 250 parking spaces, single level. Anchors: Primark, Home Bargains, B&M.

---

#### 2. Metquarter, Liverpool (~15 tenants)

**Source:** metquarter.com

**Tenants identified:** Cricket Fashion, Kids Cavern, Smudge Boutique, Francesca Couture, Fairytale Endings, All Over The Shop, Say It With Diamonds, Urban Calm, The Art Quarter, Everyman Cinema, LMA (Liverpool Media Academy), Diesel, Coast

> [!NOTE]
> Metquarter is a luxury/boutique centre — small number of premium tenants. Different market positioning to The Strand.

---

#### 3. St. Johns SC, Liverpool (~100 tenants)

**Source:** stjohns-shopping.co.uk / stjshopping.co.uk + web search

**Tenants identified (partial, key names):** JD Sports, Primark, Bonmarché, Trespass, Beaverbrooks, Ernest Jones, F.Hinds, H. Samuel, The Perfume Shop, Aldi, Iceland, Home Bargains, Poundland, The Works, Card Factory, Clintons, Waterstones, HMV, CeX, O2, Three, KFC, McDonald's, Subway, Greggs, Dunkin', Caffe Nero, Café Central, Bakers & Baristas, Chopstix, Boots, Superdrug, Max Spielmann, Timpson, TSB, Virgin Money, eurochange, and 50+ more

> [!IMPORTANT]
> St Johns is the largest direct competitor to The Strand — similar tenant mix (value/mass market) but 100+ stores. Will need to scrape the full directory page for completeness.

---

#### 4. Cavern Walks SC, Liverpool (~12 tenants)

**Source:** Web search (no dedicated directory page)

**Tenants identified:** Cavern Menswear, Pose & Pout, Rojeans, Chris James Jewellers, Rock Off, Pokemon Cards, As Above So Below Emporium, MS Taurus, Historic Liverpool, Chantilly Beatles Cafe, Lisas Reborn Baby Dolls

> [!NOTE]
> Boutique/tourist centre near Mathew Street. Beatles-themed shops, artisan crafts, designer fashion.

---

#### 5. Churchill SC, Liverpool (~8 tenants)

**Source:** Web search (Allsop / property listings)

**Tenants identified:** Morrisons Daily, William Hill, Alliance Pharmacy, Post Office, + ~4 independents

> [!NOTE]
> Small neighbourhood parade (13 units) in Aintree (L10 6LB), not a traditional shopping centre. Minimal data available.

---

#### 6. Clayton Square SC, Liverpool (~20 tenants)

**Source:** claytonsquare.co.uk (sitemap has no individual store pages)

**Tenants identified:** B&M, Bodycare, Bon, Boots, Clayton Nails & Spa, Clayton News, Costa Coffee, EE Store, eurochange, L1 Styles, Ladbrokes, Lane 7 (bowling), MAVI Brow Bar, McDonald's, Phone Clinic 4U, Tesco Express, The Gym Group, Top Gift Mobile Accessories, Vision Express, Wildwood

**Metadata:** Refit 2015, upper floor converted to gym + bowling. Near Liverpool Central station.

---

#### 7. Liverpool ONE (~170 tenants)

**Source:** liverpool-one.com + web search (directory page 404)

**Tenants identified (key names):** John Lewis, M&S, Zara, H&M, JD Sports, Nike, Primark, Adidas, AllSaints, River Island, New Look, Mango, Pandora, Swarovski, Goldsmiths, Apple Store, HMV, LEGO, Boots, Superdrug, Space NK, The Body Shop, The Fragrance Shop, Nando's, Five Guys, The Alchemist, Wagamama, Pizza Express, Odeon Cinema, Everyman Cinema, Barclays, NatWest, Eurochange, and 120+ more

> [!IMPORTANT]
> Liverpool ONE is the dominant regional destination (170+ stores, 30M+ annual footfall, Grosvenor-managed). This is the single largest enrichment task. We will need to scrape the directory page via `read_url_content` or fall back to the comprehensive web search list. Expect 150-170 tenant entries.

---

#### 8. Central Square Maghull (~20 tenants)

**Source:** lcpgroup.co.uk + web search

**Tenants identified:** Sainsbury's, Argos (in Sainsbury's), Home Bargains, B&M, Bonmarché, Superdrug, Card Factory, Specsavers, Timpson, TSB, Ladbrokes, Hays Travel, Anytime Fitness, Costa Coffee, Domino's, Furusato, McColl's, Singh News

**Metadata:** Community shopping centre, anchored by Sainsbury's. Currently has 4 tenants in DB — needs full replacement.

---

## Execution Strategy

1. **Script structure:** Single file `enrich-bootle-competitors.ts` with one tenant array per location + metadata update per location + verification block
2. **Phased approach:** Implement smaller centres first (Churchill, Cavern Walks, Metquarter), then mid-size (Cherry Tree, Clayton Square, Central Square Maghull), then large (St Johns, Liverpool ONE)
3. **CACI categories:** All tenants to use the established CACI taxonomy: `Clothing & Footwear`, `Cafes & Restaurants`, `Health & Beauty`, `Electrical & Technology`, `Jewellery & Watches`, `Gifts & Stationery`, `Home & Garden`, `Sports & Outdoors`, `Leisure & Entertainment`, `Department Stores`, `Food & Grocery`, `Financial Services`, `Charity & Second Hand`, `General Retail`, `Services`, `Other`
4. **Liverpool ONE:** Due to scale (170+ tenants), this may need a separate scrape pass. If the full list from web search is sufficient, it will be included in the main script. Otherwise, a second script `enrich-liverpool-one.ts` will be created.

---

## Verification Plan

### Automated (post-script)
The enrichment script includes a built-in verification block that prints:
- Location name, store count, DB tenant count
- Category breakdown per location
- Anchor tenants identified

```bash
npx tsx scripts/enrich-bootle-competitors.ts
```

### Manual
1. Open Prisma Studio (`pnpm db:studio`) and spot-check 2-3 locations
2. Verify tenant counts match expected values
3. Confirm CACI categories are being used consistently (no "Retail", "Food & Beverage", "Services" catch-alls outside of the defined taxonomy)

---

## Estimated Effort

| Phase | Tenants | Time |
|-------|---------|------|
| Small centres (Churchill, Cavern Walks, Metquarter) | ~35 | Low |
| Mid centres (Cherry Tree, Clayton Square, Central Square) | ~75 | Medium |
| Large centres (St Johns, Liverpool ONE) | ~270 | High |
| **Total** | **~380 tenants** | |
