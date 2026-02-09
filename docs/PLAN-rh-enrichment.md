# RivingtonHark Portfolio — DB Match & Enrichment Plan

## Objective

Match all 14 current RivingtonHark projects to Flourish DB records. Enrich missing fields. Fix incorrect data.

---

## Full Audit: RH Projects vs Flourish DB

### ✅ MATCHED — Already in DB

| # | RH Project | DB Match | DB ID | Confidence | Notes |
|---|------------|----------|-------|------------|-------|
| 1 | Palace Shopping, Enfield | `Palace Gardens & Palace Exchange` | `cmicxw4mg000z13hxqr5gzivf` | ✅ High | Postcode EN2 6SN. Has parking (500), stores (56), footfall (8M). **Good data.** |
| 2 | Eldon Square, Newcastle | `Eldon Square Shopping Centre` | `cmid0kti401msmtpuxbhb3zhp` | ✅ High | Postcode NE1 7JB. 1000 parking. Google 4.4 (20,590 reviews). |
| 3 | Rochdale Riverside | `Rochdale Riverside` | `cmid0kzgj01szmtpud9bcmqgi` | ✅ High | Postcode OL16 1BE. Google 4.3 (1,338 reviews). Phone ✅. |
| 4 | Royal Victoria Place, Tunbridge Wells | `Royal Victoria Place` | `cmid0kzl901t4mtpum4y8pkqm` | ✅ High | Postcode TN1 2SS. Website ✅. |
| 5 | St John's, Liverpool | `St. Johns Shopping Centre` | `cmid0l0qs01ucmtpuj6aeqmxy` | ✅ High | Postcode L1 1LY. Name uses "St. Johns" (period, no apostrophe). Website ✅. |
| 6 | Castle Quarter, Norwich | `Castle Quarter` | `cmid0kr9y01knmtpujxouxlzh` | ✅ High | Postcode NR1 3DD. Website ✅. (Note: RH page says "Castle Mall" but it was renamed to Castle Quarter.) |
| 7 | Kennet Centre, Newbury | `The Kennet Shopping Centre` | `cmid0l3c301wymtpujx05mrgt` | ✅ High | Postcode RG14 5EN. Name variant ("The Kennet Shopping Centre" vs "Kennet Centre"). |
| 8 | Merthyr Tydfil | `Merthyr Tydfil Leisure Village` | `cmid0k8hr0117mtpufn31q8cc` | ⚠️ Medium | Only leisure village match — may be a different asset. Need to verify which Merthyr asset RH manages. |

### ⚠️ MATCHED BUT NEEDS FIX

| # | RH Project | DB Match | Issue |
|---|------------|----------|-------|
| 9 | Victoria Centre, Southend | `Victoria Shopping Centre` (`cmid0l59001z0mtpue2t7m0l6`) | **WRONG POSTCODE.** DB has SS1 2NG (Southchurch Road). Correct is SS2 5SP (Chartwell Square). Website should be `https://www.victoriasc.co.uk/`. DB has `https://thevictoriacentre.co.uk/` — may be the old/wrong site. |
| 10 | Fareham Shopping Centre | `Market Quay` (`cmid0kwe101prmtpup1tpoyu9`) | **Possible same centre.** Market Quay DB record has `farehamshopping.com` as website, but postcode PO16 0BT differs from Fareham Shopping Centre PO16 0PQ. They are adjacent/connected centres in Fareham town centre. Council purchased Fareham SC in Oct 2023. Need to decide: update Market Quay record OR create new. |

### ❌ NOT IN DB — Need to Create or Classify

| # | RH Project | Status | Notes |
|---|------------|--------|-------|
| 11 | Heart of the City, Sheffield | Not found | This is a **major regeneration scheme**, not an existing shopping centre. Multiple new buildings. May not be appropriate for Flourish DB as a single "location". |
| 12 | Swansea Central North | Not found | **New-build development** on former St David's Centre site. Under construction. |
| 13 | Copr Bay, Swansea | Not found | **New-build mixed-use** including arena and hotel. |
| 14 | Smithfield Riverside, Shrewsbury | Not found | **Regeneration scheme** for Smithfield Riverside. Planning stage. |

---

## Proposed Actions

### Phase 1: Fix Existing Data (Quick Wins)

#### 1.1 Victoria Shopping Centre, Southend — Fix postcode & website
```
ID: cmid0l59001z0mtpue2t7m0l6
FIX: postcode → "SS2 5SP"
FIX: address → "362 Chartwell Square, Southend-On-Sea, Essex, SS2 5SP" 
FIX: website → "https://www.victoriasc.co.uk/"
FIX: phone → "01702 460931"
FIX: googleRating → "3.9"
FIX: googleReviews → 4163
```

#### 1.2 Fareham Shopping Centre — Update Market Quay record
The `Market Quay` record at PO16 0BT already uses `farehamshopping.com` — evidence it IS the Fareham Shopping Centre record. Update it:
```
ID: cmid0kwe101prmtpup1tpoyu9
FIX: name → "Fareham Shopping Centre"
FIX: postcode → "PO16 0PQ"
FIX: address → "28 Thackeray Mall, Fareham, Hampshire, PO16 0PQ"
FIX: phone → "01329 822506"
FIX: googleRating → "3.8"
FIX: googleReviews → 4875
```

### Phase 2: Enrich Matched Locations

For each matched location, run the enrichment workflow to fill missing fields:

| Location | Missing Fields |
|----------|---------------|
| St. Johns Shopping Centre, Liverpool | Google rating, parking, stores, footfall, owner |
| The Kennet Shopping Centre, Newbury | Website, phone, hours, parking, stores, owner, Google data |
| Castle Quarter, Norwich | Phone, parking, stores, owner, Google data |
| Royal Victoria Place, Tunbridge Wells | Phone, parking, stores, owner, Google data |
| Rochdale Riverside | Parking, stores, footfall, owner |
| Eldon Square, Newcastle | Footfall, owner |
| Merthyr Tydfil | Verify correct asset, then enrich |

### Phase 3: New Development Schemes (Deferred)

> [!IMPORTANT]
> Heart of the City (Sheffield), Swansea Central North, Copr Bay (Swansea), and Smithfield Riverside (Shrewsbury) are all **regeneration/new-build schemes** — not existing shopping centres with tenants. They don't fit the standard Flourish location model (vacancy, stores, tenants, footfall). Recommend **deferring** these until they are operational retail destinations.

---

## Verification

- [ ] Victoria Southend — postcode and website corrected
- [ ] Fareham — renamed and reposted
- [ ] All 7 matched locations enriched with Google data + operational fields
- [ ] Portal page updated if data changes affect displayed KPIs
