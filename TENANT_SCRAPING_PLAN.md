# 🎯 TENANT SCRAPING STRATEGY - TOMORROW

## 📊 **THE REAL NUMBERS:**

**Original "Tier 1"**: 239 locations  
**ACTUAL Shopping Centers**: **15 locations** ✅  
**Fake "Tier 1"**: 224 postcode clusters ❌

---

## 🏆 **TIER 1 PRIORITY (15 locations, 200+ stores each)**

### ✅ **Already Scraped (12 locations, 620 tenants):**
1. ✅ **Manchester Arndale** - 235 stores → 221 tenants *(94% success!)*
2. ✅ **Derbion** - 235 stores → 171 tenants *(73% success)*
3. ✅ **The Trafford Centre** - 234 stores → 104 tenants *(duplicate)*
4. ✅ **Trafford Centre** - 290 stores → 56 tenants *(duplicate)*
5. ✅ **Westfield Stratford City** - 325 stores → 16 tenants *(LOW - needs retry)*
6. ✅ **Meadowhall** - 280 stores → 13 tenants *(LOW - needs retry)*
7. ✅ **Meadowhall Centre** - 252 stores → 12 tenants *(duplicate)*
8. ✅ **Lakeside Shopping Centre** - 279 stores → 12 tenants *(LOW - needs retry)*
9. ✅ **Metrocentre** - 284 stores → 12 tenants *(LOW - needs retry)*
10. ✅ **Bluewater** - 330 stores → 11 tenants *(LOW - needs retry)*
11. ✅ **Bluewater Shopping Centre** - 289 stores → 9 tenants *(duplicate)*
12. ✅ **Westfield London** - 452 stores → 8 tenants *(VERY LOW - needs retry)*

### ❌ **Never Attempted (3 locations):**
13. ❌ **Lakeside** - 320 stores - https://lakeside.co.uk/
14. ❌ **Merry Hill** - 241 stores - https://retailtechinnovationhub.com/... *(bad URL)*
15. ❌ **Canary Wharf** - 230 stores - https://group.canarywharf.com/

---

## 🥈 **TIER 2 PRIORITY (51 locations, 100-199 stores each)**

### ✅ **Already Scraped (5 locations, 300+ tenants):**
1. ✅ **The Lexicon** - 162 stores → 156 tenants *(96% success!)*
2. ✅ **Liverpool One** - 196 stores → 122 tenants *(62% success)*
3. ✅ **Telford Centre** - 155 stores → 20 tenants *(LOW)*
4. ✅ **Luton Point** - 161 stores → 18 tenants *(LOW)*
5. ✅ **The Centre:Mk** - 184 stores → 3 tenants *(VERY LOW - needs retry)*

### ❌ **Never Attempted (46 locations):**
- Atria Watford, Bullring, Cwmbran, Braehead, Highcross, Golden Square, Eldon Square, Battersea Power Station, etc.

---

## 🥉 **TIER 3 (148 locations, 50-99 stores each)**
- Lower priority
- Scrape after Tier 1+2 complete

---

## 🎯 **TOMORROW'S EXECUTION PLAN:**

### **Phase 1: Fix URL Discovery (1-2 hours)**
1. **Test manually on failures:**
   - Westfield London (8/452 = only 2%!)
   - Bluewater (11/330 = only 3%)
   - Metrocentre (12/284 = only 4%)

2. **Build smart URL finder:**
   ```typescript
   // Better URL patterns:
   - Check sitemap.xml first
   - Try: /stores, /brands, /retailers, /directory, /shopping, /tenants
   - Validate: page size > 20KB (indicates full directory)
   - Google search: site:example.com "store directory"
   ```

3. **Update scraper:**
   - Add sitemap parser
   - Add page size validation
   - Increase scroll attempts (20 → 50)
   - Increase AI token limit (16K → 32K for huge directories)

### **Phase 2: Re-run Priority Locations (2-3 hours)**
1. **Tier 1 Low-Success Locations (9 locations):**
   - Westfield London, Stratford, Bluewater, Lakeside x2, Meadowhall x2, Metrocentre, Trafford
   
2. **New Tier 1 Locations (3 locations):**
   - Lakeside (original), Canary Wharf, Merry Hill

3. **Tier 2 High-Value (20 locations):**
   - Focus on 150+ store locations first

### **Phase 3: Bulk Run (4-6 hours)**
1. Run all Tier 2 (46 remaining)
2. Start Tier 3 if time permits

---

## 📈 **EXPECTED OUTCOMES:**

### **Conservative Estimate (70% success rate):**
- Tier 1: 15 locations × 250 avg stores × 70% = **2,625 tenants**
- Tier 2: 51 locations × 130 avg stores × 70% = **4,641 tenants**
- **Total: ~7,200 tenants** added

### **Optimistic Estimate (85% success rate):**
- Tier 1: 15 locations × 250 avg stores × 85% = **3,188 tenants**
- Tier 2: 51 locations × 130 avg stores × 85% = **5,635 tenants**
- **Total: ~8,800 tenants** added

---

## 💰 **COST ESTIMATE:**

**Tier 1+2 (66 locations):**
- 66 locations × $0.15/location (OpenAI GPT-4o-mini) = **~$10**
- Time: 66 locations × 2 mins/location = **2.2 hours**

**Tier 3 (148 locations):**
- 148 locations × $0.10/location = **~$15**
- Time: 148 locations × 1.5 mins/location = **3.7 hours**

**Total: $25, ~6 hours runtime**

---

## 🔧 **KEY IMPROVEMENTS NEEDED:**

1. ✅ **Auto-scroll** - DONE (added 20 scroll attempts)
2. ✅ **Larger context** - DONE (50K chars, 16K tokens)
3. ⚠️  **URL discovery** - NEEDS WORK
4. ⚠️  **Sitemap parsing** - TO ADD
5. ⚠️  **Page validation** - TO ADD

---

## 📝 **RESUME COMMANDS:**

```bash
cd /Users/mbeckett/Documents/codeprojects/flourish

# Option 1: Continue current script (will have same issues)
export OPENAI_API_KEY="[your-key]"
pnpm tsx scripts/enrich-stores-crawl4ai.ts

# Option 2: Build improved version first (recommended)
# We'll build this together tomorrow morning
```

---

## 🎉 **BOTTOM LINE:**

**Today:** Validated AI scraper works (99% on Queensgate!)  
**Tomorrow:** Fix URL discovery → Scrape 66 priority locations → Add 7,000-9,000 tenants  
**Cost:** ~$25  
**Time:** 6 hours  

**Then your gap analysis will FINALLY have comprehensive data!** 🚀

