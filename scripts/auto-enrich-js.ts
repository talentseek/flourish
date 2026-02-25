#!/usr/bin/env tsx
/**
 * 🎭 AUTO-ENRICH-JS — Playwright-based enrichment for JS-rendered sites
 *
 * Phase 2 of the overnight enrichment pipeline.
 * Targets locations that Phase 1 flagged as JS_RENDERED or sites known
 * to require JavaScript rendering for store directory content.
 *
 * Usage:
 *   npx tsx scripts/auto-enrich-js.ts                  # All JS sites
 *   npx tsx scripts/auto-enrich-js.ts --dry-run        # Preview only
 *   npx tsx scripts/auto-enrich-js.ts --id <locId>     # Single location
 */

import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";
import OpenAI from "openai";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();
const openai = new OpenAI();

const RENDER_TIMEOUT_MS = 30000;
const PAGE_WAIT_MS = 5000;
const GPT_TIMEOUT_MS = 60000;
const RATE_LIMIT_MS = 10000;
const MAX_HTML_LENGTH = 80000;

// Known JS-heavy sites that need Playwright rendering
const JS_HEAVY_DOMAINS = [
    "westfield.com",
    "thewestsidecentre.co.uk",
    "teessideshopping.co.uk",
    "gallerieswashington.co.uk",
    "caledoniapark.com",
    "sterlingmills.com",
    "thereddragoncentre.co.uk",
    "junction32.com",
    "thegalleria.co.uk",
    "craigleithretailpark.com",
];

// Store directory paths to try rendering
const DIRECTORY_PATHS = [
    "/stores", "/shops", "/retailers", "/brands",
    "/store-directory", "/directory", "/our-stores",
    "/shopping", "/whats-here", "/whos-here",
    "/all-stores", "/stores-and-restaurants",
    "", // homepage as fallback
];

// LDC Taxonomy (same as auto-enrich.ts)
const LDC_TAXONOMY = `
T2 CATEGORY → T3 SUBCATEGORIES:

Clothing & Footwear → Womenswear, Menswear, Childrenswear, Fast Fashion, Designer, Premium, Contemporary, Casual, Streetwear, Sportswear, Activewear, Outdoor, Lingerie, Loungewear, Footwear, Trainers, Occasion Wear, Plus Size, Denim, Accessories, Bags & Accessories, Outlet, Value, Surf & Outdoor, Concept Store, Mid-Range, Leather Goods, Luggage
Health & Beauty → Pharmacy, Cosmetics, Premium Cosmetics, Fragrance, Skincare, Optician, Eyewear, Beauty Salon, Hair Salon, Nail Salon, Barber, Spa, Health Food Store, Bath & Body, Body Care, Aesthetics, Wellness
Food & Grocery → Supermarket, Convenience Store, Butcher, Deli, Farm Shop, Confectionery, Chocolate Shop, Bubble Tea
General Retail → Discount Store, Variety Store, Vape Shop, Specialist
Department Stores → Department Store
Gifts & Stationery → Cards & Gifts, Books & Stationery, Books, Stationery, Souvenirs, Gifts, Art Gallery
Jewellery & Watches → Jewellery, Fashion Jewellery, Watches, Luxury Watches, Watch Repair
Electrical & Technology → Consumer Electronics, Mobile Network, Mobile Repair, Mobile Accessories, Entertainment Retail, Phone Repairs, Home Appliances
Home & Garden → Homeware, Kitchenware, Furniture, Bedding, Home Fragrance, Home & Lifestyle, Lifestyle
Kids & Toys → Toy Store, Toys, Kidswear
Cafes & Restaurants → Coffee Shop, Cafe, Tea Shop, Restaurant, Fast Food, Fast Casual, Premium Casual, Casual, Bakery, Sandwich Shop, Dessert, Dessert Shop, Food Hall, Takeaway, Pub, Bar
Leisure & Entertainment → Cinema, Gym, Bowling, Mini Golf, Escape Room, Trampoline Park, Climbing, Virtual Reality, Arcade, Amusements, Casino, Sports Retailer
Services → Travel Agency, Post Office, Photo Printing, Shoe Repair, Dry Cleaning, Alterations, Newsagent, Betting, Parcel Collection, Car Wash, Education, Community
Financial Services → Bank, Building Society, Currency Exchange, Pawnbroker
Charity & Second Hand → Charity Shop, Charity
Vacant → Vacant Unit, Under Refurbishment, Coming Soon
`.trim();

interface TenantInput {
    name: string;
    category: string;
    subcategory: string | null;
    isAnchorTenant: boolean;
}

function parseArgs() {
    const args = process.argv.slice(2);
    return {
        dryRun: args.includes("--dry-run"),
        id: args.includes("--id") ? args[args.indexOf("--id") + 1] : undefined,
    };
}

async function extractTenantsWithGPT(text: string, locationName: string): Promise<TenantInput[]> {
    const trimmed = text.slice(0, MAX_HTML_LENGTH);
    if (trimmed.length < 100) return [];

    const prompt = `You are extracting store/tenant data from a UK shopping centre directory page.

LOCATION: ${locationName}

PAGE TEXT:
${trimmed}

TASK: Extract ALL stores, restaurants, cafes, services, and leisure venues listed on this page.
For each tenant, classify using the LDC 3-Tier Retail Taxonomy below.

${LDC_TAXONOMY}

RULES:
1. "category" MUST be an exact T2 category name from the list above
2. "subcategory" MUST be an exact T3 subcategory name from the list above
3. Set isAnchorTenant=true for department stores, large fashion retailers (Primark, H&M, Zara, Next, M&S), cinemas, and major supermarkets
4. Do NOT include generic entries like "See all stores" or "Filter by"
5. Do NOT include categories/sections as tenants (e.g. "Fashion", "Food & Drink")

Return a JSON array ONLY (no markdown, no explanation):
[{"name": "Store Name", "category": "T2 Category", "subcategory": "T3 Subcategory", "isAnchorTenant": false}]

If you cannot find any stores on this page, return an empty array: []`;

    try {
        const response = await Promise.race([
            openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a UK retail data extraction specialist. Extract tenant names and classify them with the LDC taxonomy. Be thorough — extract every single store. Return only valid JSON." },
                    { role: "user", content: prompt },
                ],
                temperature: 0,
                max_tokens: 16000,
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("GPT timeout")), GPT_TIMEOUT_MS)),
        ]);

        const raw = response.choices[0]?.message?.content?.trim() || "[]";
        const cleaned = raw.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "").trim();
        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((t: any) => typeof t.name === "string" && t.name.length > 1 && typeof t.category === "string")
            .map((t: any) => ({
                name: t.name.trim(),
                category: t.category.trim(),
                subcategory: t.subcategory?.trim() || null,
                isAnchorTenant: Boolean(t.isAnchorTenant),
            }));
    } catch (err: any) {
        console.error(`   ❌ GPT extraction failed: ${err.message?.slice(0, 100)}`);
        return [];
    }
}

async function main() {
    const flags = parseArgs();

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  🎭 AUTO-ENRICH-JS — Playwright Enrichment Pipeline");
    console.log("═══════════════════════════════════════════════════════════\n");

    if (flags.dryRun) console.log("🔍 DRY RUN MODE — no database writes\n");

    // Find locations needing JS rendering
    let locations;

    if (flags.id) {
        const loc = await prisma.location.findUnique({
            where: { id: flags.id },
            select: { id: true, name: true, website: true, city: true, type: true },
        });
        if (!loc) { console.error(`❌ Location not found: ${flags.id}`); return; }
        locations = [loc];
    } else {
        // Get all locations with websites but no tenants
        const allLocs = await prisma.location.findMany({
            where: {
                type: { in: ["SHOPPING_CENTRE", "RETAIL_PARK", "OUTLET_CENTRE"] },
                website: { not: null },
                tenants: { none: {} },
            },
            select: { id: true, name: true, website: true, city: true, type: true },
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });

        // Filter to known JS-heavy domains
        locations = allLocs.filter((loc) => {
            const w = (loc.website || "").toLowerCase();
            return JS_HEAVY_DOMAINS.some((d) => w.includes(d));
        });
    }

    console.log(`📊 Found ${locations.length} JS-rendered locations to process\n`);
    if (locations.length === 0) { console.log("✅ No JS locations to process!"); return; }

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    });

    let success = 0;
    let failed = 0;
    let totalTenants = 0;

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        let website = loc.website!;
        if (!website.startsWith("http")) website = `https://${website}`;

        console.log(`\n┌─────────────────────────────────────────────────────────`);
        console.log(`│ [${i + 1}/${locations.length}] ${loc.name} (${loc.city || "?"}) — ${loc.type}`);
        console.log(`└─────────────────────────────────────────────────────────`);
        console.log(`   🌐 ${website}`);

        let bestTenants: TenantInput[] = [];
        let bestSource = "none";

        // Try each directory path with Playwright
        for (const dirPath of DIRECTORY_PATHS) {
            const fullUrl = dirPath ? new URL(dirPath, website).href : website;
            console.log(`   🎭 Rendering: ${dirPath || "/"}`);

            try {
                const page = await context.newPage();
                await page.goto(fullUrl, { waitUntil: "networkidle", timeout: RENDER_TIMEOUT_MS });
                await page.waitForTimeout(PAGE_WAIT_MS);

                // Get rendered text content
                const textContent = await page.evaluate(() => {
                    // Remove nav, footer, scripts
                    document.querySelectorAll("script, style, noscript, svg, nav, footer").forEach(el => el.remove());
                    return document.body?.innerText || "";
                });

                await page.close();

                if (textContent.length < 200) {
                    console.log(`   ⚠️ Too little content (${textContent.length} chars)`);
                    continue;
                }

                console.log(`   📄 Got ${textContent.length} chars of rendered content`);

                const tenants = await extractTenantsWithGPT(textContent, loc.name);
                console.log(`   🏪 Extracted ${tenants.length} tenants from ${dirPath || "/"}`);

                if (tenants.length > bestTenants.length) {
                    bestTenants = tenants;
                    bestSource = `playwright:${dirPath || "/"}`;
                }

                // If we found good results, stop trying paths
                if (tenants.length >= 10) break;
            } catch (err: any) {
                console.log(`   ⚠️ ${dirPath || "/"}: ${err.message?.slice(0, 80)}`);
            }
        }

        if (bestTenants.length === 0) {
            console.log("   ❌ No tenants extracted from any rendered page");
            failed++;
            continue;
        }

        console.log(`   ✅ Best: ${bestTenants.length} tenants from ${bestSource}`);

        if (flags.dryRun) {
            for (const t of bestTenants.slice(0, 5)) {
                console.log(`      ${t.isAnchorTenant ? "⭐" : "  "} ${t.name} → ${t.category} / ${t.subcategory || "—"}`);
            }
            if (bestTenants.length > 5) console.log(`      ... and ${bestTenants.length - 5} more`);
            success++;
            totalTenants += bestTenants.length;
            continue;
        }

        // Save to DB
        await prisma.tenant.deleteMany({ where: { locationId: loc.id } });

        let saved = 0;
        for (const t of bestTenants) {
            try {
                const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
                await prisma.tenant.create({
                    data: {
                        locationId: loc.id,
                        name: t.name,
                        category: t.category,
                        subcategory: t.subcategory,
                        categoryId,
                        isAnchorTenant: t.isAnchorTenant,
                    },
                });
                saved++;
            } catch (err: any) {
                if (!err.message?.includes("Unique constraint")) {
                    console.warn(`   ⚠️ Skipped "${t.name}": ${err.message?.slice(0, 80)}`);
                }
            }
        }

        // Update stats
        await prisma.location.update({
            where: { id: loc.id },
            data: { numberOfStores: saved, retailers: saved },
        });

        const cats = await prisma.tenant.groupBy({
            by: ["category"],
            where: { locationId: loc.id },
            _count: true,
            orderBy: { _count: { category: "desc" } },
        });

        const total = cats.reduce((sum, c) => sum + c._count, 0);
        if (cats.length > 0 && total > 0) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    largestCategory: cats[0].category,
                    largestCategoryPercent: Number((cats[0]._count / total).toFixed(3)),
                },
            });
        }

        console.log(`   💾 Saved ${saved} tenants`);
        success++;
        totalTenants += saved;

        // Rate limiting
        if (i < locations.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
        }
    }

    await browser.close();

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  📊 FINAL SUMMARY (Playwright)");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  ✅ Success:       ${success}/${locations.length}`);
    console.log(`  ❌ Failed:        ${failed}/${locations.length}`);
    console.log(`  🏪 Total tenants: ${totalTenants}`);
    console.log(`  📈 Success rate:  ${((success / locations.length) * 100).toFixed(1)}%\n`);
}

main()
    .catch((err) => {
        console.error("\n❌ Fatal error:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
