# Plan: Bulk Enrichment of 20 Managed Sites

> **Goal**: Update and enrich 20 specific shopping centres with website URLs provided by the user.

## 1. Scope
The following locations will be updated:

| Location | Website | DB Status |
|----------|---------|-----------|
| Rutherglen Shopping Centre | rutherglenexchange.com | ✅ Matched |
| Springburn Shopping Centre | springburnshopping.com | ✅ Matched |
| The Avenue | avenueshopping.co.uk | ⚠️ Investigate |
| Rivergate Shopping Centre | rivergatecentre.com | ✅ Matched |
| Sanderson Arcade | sandersonarcade.co.uk | ✅ Matched |
| Park View Shopping Centre | parkviewshoppingcentre.co.uk | ✅ Matched |
| Newcastle Quays | newcastlequays.com | ✅ Matched |
| The Bridges | thebridges-shopping.com | ✅ Matched |
| Trinity Square | trinitysquaregateshead.co.uk | ✅ Matched |
| St. Cuthberts Walk | stcuthbertswalk.co.uk | ✅ Matched |
| Newgate Centre | newgatecentre.co.uk | ✅ Matched |
| Queen Street | queenstreetshoppingcentre.co.uk | ✅ Matched |
| Promenades | promenadesshoppingcentre.co.uk | ✅ Matched |
| Flemingate | flemingate.co.uk | ✅ Matched |
| North Point | northpointshoppingcentre.co.uk | ✅ Matched |
| The Parishes | theparishes.com | ✅ Matched |
| Britten Centre | brittencentre.co.uk | ✅ Matched |
| White River Place | whiteriverplace.co.uk | ✅ Matched |
| Saxon Square | saxon-square.co.uk | ✅ Matched |
| The Guild | theguildwiltshire.co.uk | ✅ Matched |

## 2. Methodology

### 2.1 Bulk Update Script
- Create `scripts/enrich-bulk-list.ts`.
- Defines a map of `{ nameQuery: string, url: string }`.
- For each item:
  - Find DB record (fuzzy match).
  - Update `website` field.
  - Attempt to scrape (lightweight):
    - Social Links (Facebook/Insta).
    - Page Title (to confirm Name).

### 2.2 Manual Investigation
- Find the correct ID for "The Avenue" (likely named differently in DB, or missing).

## 3. Workflow
1.  **Script**: `scripts/enrich-bulk-list.ts` -> Updates URLs + Scrapes Socials.
2.  **Execution**: Run script.
3.  **Verification**: Check map for new "Green" dots.

## 4. Verification Checklist
- [ ] 20 Locations have `website` set.
- [ ] Social links populated where available.
- [ ] Enrichment scores improved.
