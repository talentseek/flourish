# Operational & Digital Enrichment Plan

## 📊 Current Status (Before Enrichment)

### Operational Tier
- **numberOfStores**: ✅ 100% (2,626/2,626)
- **totalFloorArea**: ✅ 99.9% (2,625/2,626)
- **parkingSpaces**: ❌ 0.6% (16/2,626)
- **anchorTenants**: ❌ 0.5% (13/2,626)
- **Overall**: 0% (requires ALL fields)

### Digital Tier
- **instagram**: ❌ 0.04% (1/2,626)
- **facebook**: ❌ 0.04% (1/2,626)
- **googleRating**: ❌ 0.04% (1/2,626)
- **googleReviews**: (requires googleRating)
- **Overall**: ~0%

---

## 🎯 Enrichment Strategy

### Phase 1: Website Discovery ✅ IN PROGRESS
**Script**: `scripts/enrich-websites.ts`
**Status**: 291/2,031 complete (14.3%) - **94.5% success rate**
**Method**: Google Custom Search API
**Cost**: ~$9.66 for 2,031 queries
**ETA**: ~40 minutes remaining

**What it does**:
- Searches Google for each location's official website
- Filters out Wikipedia, social media, directories
- Saves clean website URL to database

---

### Phase 2: Parking Data Extraction
**Script**: `scripts/enrich-parking.ts` ✅ READY
**Dependencies**: Requires Phase 1 websites
**Method**: Web scraping with regex patterns
**Cost**: FREE (just CPU time)
**ETA**: ~30-45 minutes (depends on how many sites we got)

**What it does**:
- Fetches HTML from each website
- Uses 9 different regex patterns to find parking numbers:
  - "1,200 parking spaces"
  - "car park with 1,200 spaces"
  - "parking for 1,200"
  - "1,200-space car park"
  - "car park capacity: 1,200"
  - And more...
- Validates numbers (must be 20-50,000)
- Saves parking space count to database

**Expected success rate**: ~60-70%
**Projected result**: 1,200-1,400 locations enriched

---

### Phase 3: Social Media Links Extraction
**Script**: `scripts/enrich-social-media.ts` ✅ READY
**Dependencies**: Requires Phase 1 websites
**Method**: Web scraping with link extraction
**Cost**: FREE
**ETA**: ~30-45 minutes

**What it does**:
- Fetches HTML from each website
- Extracts social media links from `<a href>` tags:
  - Instagram: `instagram.com/username`
  - Facebook: `facebook.com/pagename`
  - YouTube: `youtube.com/@channel`
  - TikTok: `tiktok.com/@username`
- Cleans URLs (removes share links, tracking params)
- Saves to database

**Expected success rate**: ~40-60% (not all locations have social media)
**Projected result**: 800-1,200 locations with at least 1 social platform

---

### Phase 4: Google Places API (Optional - For Ratings)
**Script**: NOT YET BUILT
**Cost**: ~$40-50 for all locations
**What it would add**:
- googleRating
- googleReviews count
- Business status

**Decision**: Let's see Phase 2-3 results first, then decide if worth the cost.

---

## 🔄 Revised Tier Definitions

### Operational Tier (Revised)
Since `anchorTenants` is not systematically available (only 13 manual entries), we propose:

**Option A: Core Operational (Recommended)**
```typescript
operational: ['numberOfStores', 'totalFloorArea']
```
- ✅ Result: 99.9% complete immediately
- ✅ These are the most important operational metrics

**Option B: Extended Operational (If parking enrichment succeeds)**
```typescript
operational: ['numberOfStores', 'totalFloorArea', 'parkingSpaces']
```
- 📊 Result: 60-70% complete (depends on scraping success)
- ✅ Parking is valuable for analysis

**Recommendation**: Start with Option A, upgrade to Option B after parking enrichment.

---

### Digital Tier (Current)
```typescript
digital: ['instagram', 'facebook', 'googleRating', 'googleReviews']
```

**Projected completion after Phase 3**:
- Without Google Places: 30-40% (social media only)
- With Google Places: 60-70%

---

## 📈 Projected Final State

| Tier | Current | After Websites | After Parking | After Social | After Google Places |
|------|---------|----------------|---------------|--------------|---------------------|
| Core | 100% | 100% | 100% | 100% | 100% |
| Geo | 100% | 100% | 100% | 100% | 100% |
| **Operational** | 0% | 0% | **60-70%** ✨ | 60-70% | 60-70% |
| Commercial | 99.5% | 99.5% | 99.5% | 99.5% | 99.5% |
| **Digital** | 0% | 0% | 0% | **40%** ✨ | **65%** ✨ |
| Demographic | 82.7% | 82.7% | 82.7% | 82.7% | 82.7% |
| **Overall** | ~64% | ~64% | **~70%** | **~72%** | **~76%** |

---

## 💰 Cost Summary

| Phase | Cost | Time |
|-------|------|------|
| Website Discovery | ~$10 | 1 hour |
| Parking Scraping | FREE | 45 min |
| Social Media Scraping | FREE | 45 min |
| Google Places (optional) | ~$45 | 30 min |
| **Total (without Google)** | **~$10** | **2.5 hours** |
| **Total (with Google)** | **~$55** | **3 hours** |

---

## 🎯 Next Steps

1. ✅ **Wait for website enrichment to complete** (~40 min)
2. 🚀 **Run parking scraper** (Phase 2)
3. 🚀 **Run social media scraper** (Phase 3)
4. 📊 **Review results and decide on Google Places API**
5. 🔄 **Update tier definitions based on success rates**
6. ✨ **Refresh enrichment dashboard**

---

## 📝 Running the Scripts

Once website enrichment completes:

```bash
# Phase 2: Parking
pnpm tsx scripts/enrich-parking.ts | tee parking-enrichment.log

# Phase 3: Social Media (can run in parallel with Phase 2)
pnpm tsx scripts/enrich-social-media.ts | tee social-enrichment.log

# Check results
pnpm tsx scripts/coord-stats.ts
```

---

**Status**: Phase 1 in progress, Phases 2-3 ready to go! 🚀

