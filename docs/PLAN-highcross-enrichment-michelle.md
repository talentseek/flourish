# ENRICHMENT PLAN: Highcross (Michelle Clark)

## 📊 Current Status: Highcross
- **ID:** `cmid0kv0r01obmtpuinuwnn2n`
- **Location:** Leicestershire (LE1 4SA)
- **Data Completeness:**
  - ✅ **Physical:** 3,000 parking spaces, 83k sqm area, 151 stores.
  - ✅ **Management:** Savills.
  - ❌ **Commercial:** Footfall and Retailer counts are `NULL`.
  - ❌ **Demographics:** Population, median age, income data all `NULL`.
  - ⚠️ **Tenants:** 41 tenants found, but many are "category headers" (e.g., "Fashion") rather than individual brands. Needs a proper directory scrape.

---

## 🏗️ Phase 1: Real-Time Data Enrichment (N8N)
We will use the **n8n-workflow-builder** to fire up a deep-enrichment automation.

### 1.1: Tenant Directory Scrape
- **Node:** `Firecrawl Scraper` (Tool ID: `8Tp4fUF6NZCndbrTc2NIL`)
- **Target:** `https://highcrossleicester.com/shops`
- **Action:** Extract full list of actual retailers and map them to CACI categories.

### 1.2: Commercial Data Lookup
- **Node:** `Perplexity News Search` (Tool ID: `l2A8d4cghcQq5W8F`)
- **Query:** "Highcross Leicester annual footfall 2024-2025" and "Highcross Leicester catchment area demographic profile".

---

## 🏗️ Phase 2: Demographic & IMD Ingestion (Prisma)
- **Source:** `/public/census2021-ts007a` (Country, Region, OA) and IMD datasets.
- **Action:** Run `scripts/import-census-demographics.ts` focused on the `LE1` postcode.

---

## 🏗️ Phase 3: Spacebook Readiness
- **Next Step:** Once Footfall/Catchment data is in, we can build the **Spacebook Booking Module** for Michelle to manage vacant units (currently reported as 151 stores total, but vacancy % is unknown).
