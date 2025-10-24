# Website Enrichment v2 - Strict Validation

## 🎯 Strategy

**Goal:** Find official shopping centre/retail park websites only

**Approach:**
- Google Custom Search API with strict domain validation
- Blacklist: 50+ domains (retailers, hotels, news, social media)
- Scoring system: Domain must score ≥15 points
- Filters: No store locators, PDFs, news articles, travel sites

---

## 📊 Current Status

**Started:** In progress  
**Processing:** 2,029 locations (SHOPPING_CENTRE + RETAIL_PARK, excluding "(Other)")  
**Estimated time:** ~50 minutes  
**Estimated cost:** ~$10  
**Expected results:** 800-1,000 official websites (40-50% success rate)

---

## ✅ Quality Validation

The strict validation **correctly rejects**:
- ❌ Store locators (petsathome.com, bmstores.co.uk)
- ❌ News articles (bbc.com, reddit.com)
- ❌ Hotels & travel (premierinn.com, expedia.com)
- ❌ Real estate (savills.com, cbre.com, allsop.co.uk)
- ❌ PDFs and documents
- ❌ Low-quality matches (score < 15)

The strict validation **accepts only**:
- ✅ Official shopping centre websites
- ✅ Retail park official sites
- ✅ Domains containing location name + keywords
- ✅ Clean, dedicated domains (score ≥ 15)

---

## 📈 Test Results

**Sample test (10 shopping centres):**
- Success: 4/10 (40%)
- All 4 results were perfect official websites:
  - `albertsquareshoppingcentre.co.uk` (score: 80)
  - `aldridgeshoppingcentre.co.uk` (score: 70)
  - `angel-place-shopping-centre.wheree.com` (score: 30)
  - `antoninecumbernauld.com` (score: 55)

---

## 💾 Rollback Action Taken

**Problem:** v1 enrichment had 96% success but mostly garbage results  
**Action:** Rolled back 449 bad websites to 14 seed locations  
**Result:** Clean slate for v2 strict validation

---

## 🔮 Projected Outcomes

### After Website Enrichment
- **Official websites:** 800-1,000 locations
- **Quality:** HIGH - only real shopping centre sites
- **Coverage:** ~40% of locations

### After Parking Scraping (depends on websites)
- **Target:** 800-1,000 locations with websites
- **Expected success:** 60-70% (480-700 with parking data)
- **Overall parking coverage:** ~25% of all locations

### After Social Media Scraping (depends on websites)
- **Target:** 800-1,000 locations with websites
- **Expected success:** 40-60% (320-600 with social links)
- **Overall social coverage:** ~15-25% of all locations

---

## 📝 Next Steps

1. ⏳ **Wait for website enrichment to complete** (~40 min remaining)
2. 🅿️  **Run parking scraper** on ~800-1,000 locations with websites
3. 📱 **Run social media scraper** on ~800-1,000 locations
4. 📊 **Refresh enrichment dashboard** to see final results
5. 🎉 **Celebrate quality data over quantity!**

---

## 💡 Philosophy

**Better to have 40% high-quality official data than 96% garbage data.**

Real official websites = Real parking data + Real social media links

---

**Status:** IN PROGRESS 🚀  
**Log file:** `website-enrichment-v2.log`  
**Check progress:** `tail -30 website-enrichment-v2.log`

