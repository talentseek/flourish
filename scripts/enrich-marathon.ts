#!/usr/bin/env tsx
/**
 * 🏃‍♂️ ULTIMATE ENRICHMENT MARATHON
 * 
 * A comprehensive multi-hour enrichment script that runs multiple strategies:
 * 1. Tenant scraping for ALL Tier 1+2 locations (66 total)
 * 2. Operational details for locations missing key fields
 * 3. Commercial backfill for high-value locations
 * 
 * Designed to run for 3-6 hours unattended with comprehensive logging.
 */

import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";
import path from "path";

const prisma = new PrismaClient();

// Configuration
const PYTHON_PATH = "/Users/mbeckett/miniconda3/bin/python3";
const SCRAPER_PATH = path.join(process.cwd(), "scripts", "playwright_openai_scraper.py");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface EnrichmentStats {
  tenantsScraping: { success: number; failed: number; total: number };
  operational: { success: number; failed: number; total: number };
  commercial: { success: number; failed: number; total: number };
  startTime: Date;
  endTime?: Date;
}

const stats: EnrichmentStats = {
  tenantsScraping: { success: 0, failed: 0, total: 0 },
  operational: { success: 0, failed: 0, total: 0 },
  commercial: { success: 0, failed: 0, total: 0 },
  startTime: new Date(),
};

// ============================================================================
// PHASE 1: TENANT SCRAPING (All Tier 1+2 locations)
// ============================================================================

async function runTenantScraping() {
  console.log("\n" + "=".repeat(80));
  console.log("🏪 PHASE 1: TENANT DIRECTORY SCRAPING");
  console.log("=".repeat(80));

  // Get all Tier 1 and Tier 2 locations with websites
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      OR: [
        { numberOfStores: { gte: 30 } }, // Tier 1
        { numberOfStores: { gte: 15, lt: 30 } }, // Tier 2
      ],
    },
    orderBy: { numberOfStores: "desc" },
    select: {
      id: true,
      name: true,
      county: true,
      website: true,
      numberOfStores: true,
      _count: { select: { tenants: true } },
    },
  });

  stats.tenantsScraping.total = locations.length;

  console.log(`\n📊 Found ${locations.length} Tier 1+2 locations to enrich`);
  console.log(`   Tier 1 (30+ stores): ${locations.filter(l => (l.numberOfStores || 0) >= 30).length}`);
  console.log(`   Tier 2 (15-29 stores): ${locations.filter(l => (l.numberOfStores || 0) >= 15 && (l.numberOfStores || 0) < 30).length}`);

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const currentTenants = loc._count.tenants;
    const expectedStores = loc.numberOfStores || 0;

    // Skip if we already have good coverage (>80%)
    if (currentTenants >= expectedStores * 0.8) {
      console.log(`\n[${i + 1}/${locations.length}] ⏭️  Skipping ${loc.name} (${currentTenants}/${expectedStores} stores - ${Math.round(currentTenants / expectedStores * 100)}% coverage)`);
      continue;
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(`[${i + 1}/${locations.length}] ${loc.name} (${loc.county})`);
    console.log("=".repeat(80));
    console.log(`   Expected: ${expectedStores} | Current: ${currentTenants} | Coverage: ${expectedStores > 0 ? Math.round(currentTenants / expectedStores * 100) : 0}%`);

    if (!loc.website) {
      console.log("   ⏭️  No website");
      stats.tenantsScraping.failed++;
      continue;
    }

    try {
      const stores = await scrapeStores(loc.website, loc.id);
      if (stores && stores.length > 0) {
        console.log(`   ✅ SUCCESS! Found ${stores.length} stores`);
        stats.tenantsScraping.success++;
      } else {
        console.log(`   ⚠️  No stores found`);
        stats.tenantsScraping.failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      stats.tenantsScraping.failed++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      console.log("   ⏱️  Waiting 3s before next location...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 PHASE 1 COMPLETE - Tenant Scraping");
  console.log("=".repeat(80));
  console.log(`   ✅ Success: ${stats.tenantsScraping.success}`);
  console.log(`   ❌ Failed:  ${stats.tenantsScraping.failed}`);
  console.log(`   📈 Rate:    ${Math.round(stats.tenantsScraping.success / stats.tenantsScraping.total * 100)}%`);
}

// ============================================================================
// PHASE 2: OPERATIONAL ENRICHMENT (Missing fields)
// ============================================================================

async function runOperationalEnrichment() {
  console.log("\n" + "=".repeat(80));
  console.log("🚗 PHASE 2: OPERATIONAL DETAILS ENRICHMENT");
  console.log("=".repeat(80));

  // Get locations missing critical operational data
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      OR: [
        { carParkPrice: null },
        { numberOfFloors: null },
        { publicTransit: null },
        { openedYear: null },
      ],
    },
    orderBy: { numberOfStores: "desc" },
    take: 200, // Limit to top 200 for time
    select: {
      id: true,
      name: true,
      website: true,
      carParkPrice: true,
      evCharging: true,
      numberOfFloors: true,
      publicTransit: true,
      openedYear: true,
    },
  });

  stats.operational.total = locations.length;

  console.log(`\n📊 Found ${locations.length} locations with missing operational data`);

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`\n[${i + 1}/${locations.length}] ${loc.name}`);

    const missingFields = [];
    if (!loc.carParkPrice) missingFields.push("parking");
    if (!loc.evCharging) missingFields.push("EV charging");
    if (!loc.numberOfFloors) missingFields.push("floors");
    if (!loc.publicTransit) missingFields.push("transit");
    if (!loc.openedYear) missingFields.push("year opened");

    console.log(`   Missing: ${missingFields.join(", ")}`);

    try {
      const enriched = await scrapeOperationalDetails(loc.website!);
      if (enriched && Object.keys(enriched).length > 0) {
        await prisma.location.update({
          where: { id: loc.id },
          data: enriched,
        });
        console.log(`   ✅ Enriched: ${Object.keys(enriched).join(", ")}`);
        stats.operational.success++;
      } else {
        console.log(`   ⚠️  No data found`);
        stats.operational.failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      stats.operational.failed++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 PHASE 2 COMPLETE - Operational Enrichment");
  console.log("=".repeat(80));
  console.log(`   ✅ Success: ${stats.operational.success}`);
  console.log(`   ❌ Failed:  ${stats.operational.failed}`);
  console.log(`   📈 Rate:    ${Math.round(stats.operational.success / stats.operational.total * 100)}%`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function scrapeStores(websiteUrl: string, locationId: string): Promise<any[] | null> {
  const urlPatterns = [
    "/stores",
    "/store-directory",
    "/shops",
    "/brands",
    "/retailers",
    "/directory",
    "/store-finder",
    "",
  ];

  for (const pattern of urlPatterns) {
    const url = websiteUrl.replace(/\/$/, "") + pattern;
    console.log(`   📍 Trying: ${pattern || "homepage"}...`);

    try {
      const result = await runPythonScraper(url);
      if (result && result.length > 5) {
        // Save to database
        await saveTenants(result, locationId);
        return result;
      }
    } catch (error) {
      console.log(`   ⚠️  ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
  }

  return null;
}

async function runPythonScraper(url: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
      env: { ...process.env, OPENAI_API_KEY },
    });

    let stdout = "";
    let stderr = "";

    childProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // 120s timeout
    const timeout = setTimeout(() => {
      childProcess.kill();
      reject(new Error("Timeout after 120s"));
    }, 120000);

    childProcess.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result.stores || []);
        } catch (e) {
          reject(new Error("Failed to parse JSON"));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}`));
      }
    });
  });
}

async function saveTenants(stores: any[], locationId: string) {
  const categoryMap: Record<string, string> = {
    fashion: "Fashion & Apparel",
    electronics: "Electronics",
    food: "Food & Beverage",
    "health & beauty": "Health & Beauty",
    home: "Home & Garden",
    entertainment: "Entertainment",
    services: "Services",
    sportswear: "Sports & Outdoors",
  };

  let anchorCount = 0;
  const categories = new Set<string>();

  for (const store of stores) {
    const isAnchor = store.category?.toLowerCase().includes("anchor") || false;
    if (isAnchor) anchorCount++;

    const category = categoryMap[store.category?.toLowerCase()] || "Other";
    categories.add(category);

    await prisma.tenant.upsert({
      where: {
        locationId_name: {
          locationId,
          name: store.name,
        },
      },
      create: {
        locationId,
        name: store.name,
        category,
        website: store.url || null,
        isAnchor,
      },
      update: {
        category,
        website: store.url || null,
        isAnchor,
      },
    });
  }

  console.log(`   ✅ Added ${stores.length} stores to database`);
  console.log(`   🏬 Categories: ${Array.from(categories).join(", ")}`);
  console.log(`   ⭐ Anchor tenants: ${anchorCount}`);
}

async function scrapeOperationalDetails(websiteUrl: string): Promise<any> {
  // Simple HTML scraping for operational details
  const response = await fetch(websiteUrl);
  const html = await response.text();

  const details: any = {};

  // EV Charging detection
  if (/electric vehicle|ev charg|electric car/i.test(html)) {
    details.evCharging = "Yes";
  }

  // Parking price detection
  const parkingMatch = html.match(/parking[:\s]+£?([\d.]+)/i);
  if (parkingMatch) {
    details.carParkPrice = parkingMatch[1];
  }

  // Number of floors
  const floorsMatch = html.match(/(\d+)\s+floors?/i);
  if (floorsMatch) {
    details.numberOfFloors = parseInt(floorsMatch[1]);
  }

  // Year opened
  const yearMatch = html.match(/opened?[:\s]+(\d{4})/i);
  if (yearMatch) {
    details.openedYear = parseInt(yearMatch[1]);
  }

  // Public transit
  if (/bus|train|tube|metro|underground|station/i.test(html)) {
    details.publicTransit = "Yes";
  }

  return details;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("\n🏃‍♂️ ULTIMATE ENRICHMENT MARATHON");
  console.log("=".repeat(80));
  console.log(`Started at: ${stats.startTime.toLocaleString()}`);
  console.log(`Estimated duration: 3-6 hours`);
  console.log("=".repeat(80));

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  try {
    // Phase 1: Tenant scraping (longest phase)
    await runTenantScraping();

    // Phase 2: Operational enrichment
    await runOperationalEnrichment();

    // Final summary
    stats.endTime = new Date();
    const duration = (stats.endTime.getTime() - stats.startTime.getTime()) / 1000 / 60;

    console.log("\n" + "=".repeat(80));
    console.log("🎉 MARATHON COMPLETE!");
    console.log("=".repeat(80));
    console.log(`Duration: ${Math.round(duration)} minutes`);
    console.log(`\n📊 Final Stats:`);
    console.log(`   Tenant Scraping: ${stats.tenantsScraping.success}/${stats.tenantsScraping.total} (${Math.round(stats.tenantsScraping.success / stats.tenantsScraping.total * 100)}%)`);
    console.log(`   Operational:     ${stats.operational.success}/${stats.operational.total} (${Math.round(stats.operational.success / stats.operational.total * 100)}%)`);
    console.log(`\nStarted:  ${stats.startTime.toLocaleString()}`);
    console.log(`Finished: ${stats.endTime.toLocaleString()}`);
  } catch (error) {
    console.error("\n❌ MARATHON FAILED:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

