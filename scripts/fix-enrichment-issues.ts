#!/usr/bin/env tsx
/**
 * Fix enrichment issues reported from batch run review.
 * 
 * Actions:
 * 1. Delete bad websites (null them out + remove wrongly-extracted tenants)
 * 2. Fix incorrect URLs to correct ones
 * 3. Re-enrich specific locations with known sitemaps/URLs
 */
import { PrismaClient } from "@prisma/client";
import { getCategoryId } from "../src/lib/category-lookup";
import OpenAI from "openai";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();
const openai = new OpenAI();

// ── 1. Websites to DELETE (null out) ──────────────────────────────────

const WEBSITES_TO_DELETE = [
    "leegateregeneration.co.uk",      // Not a shopping centre site
    "citypropertyglasgow.co.uk",      // Property management, not the centre
    "kingssquareshopping.com",        // Incorrect website
    "hardwickstore.co.uk",            // Incorrect
    "themercurymall.co.uk",           // Website not working
];

// ── 2. Websites to FIX (update to correct URL) ───────────────────────

const WEBSITE_FIXES: Record<string, string> = {
    "themaltingsstalbans.co.uk": "https://maltingsshoppingcentre.co.uk/",
    "the-mall.co.uk/blackburn": "https://themallblackburn.co.uk/",
    "rhiw.shopping": "https://www.rhiwshopping.com/",
    "exchangeilford.co.uk": "https://www.exchangeilford.com/",
};

// ── 3. Locations needing re-enrichment with known sitemaps ────────────

interface ReEnrichTarget {
    websiteMatch: string;
    sitemapUrl?: string;
    directoryUrl?: string;
}

const RE_ENRICH_TARGETS: ReEnrichTarget[] = [
    { websiteMatch: "moorshoppingcentre.co.uk", sitemapUrl: "https://moorshoppingcentre.co.uk/wp-sitemap-posts-portfolio-1.xml" },
    { websiteMatch: "quintinscentre.co.uk", sitemapUrl: "https://www.quintinscentre.co.uk/retailer-sitemap.xml" },
    { websiteMatch: "batterseapowerstation.co.uk", sitemapUrl: "https://batterseapowerstation.co.uk/retailer-sitemap.xml" },
    { websiteMatch: "harpurcentre.co.uk", sitemapUrl: "https://www.harpurcentre.co.uk/portfolio_page-sitemap.xml" },
    // Fixed URLs that need enrichment
    { websiteMatch: "maltingsshoppingcentre.co.uk" },
    { websiteMatch: "themallblackburn.co.uk" },
    { websiteMatch: "rhiwshopping.com" },
    { websiteMatch: "exchangeilford.com" },
    // Glasgow - tenants at specific URL
    { websiteMatch: "citypropertyglasgow.co.uk", directoryUrl: "https://www.citypropertyglasgow.co.uk/properties/the-lochs/" },
];

// ── LDC Taxonomy (for GPT categorisation) ─────────────────────────────

const LDC_TAXONOMY = `Retail: Clothing & Footwear, Health & Beauty, Electrical & Technology, Home & Garden, Jewellery & Watches, Food & Grocery, Books & Hobbies, Gifts & Stationery, General Retail
Leisure: Cafes & Restaurants, Leisure & Entertainment
Services: Services, Financial & Banking, Charity & Second Hand`;

async function fetchSitemapTenantNames(sitemapUrl: string): Promise<string[]> {
    try {
        const response = await fetch(sitemapUrl, {
            signal: AbortSignal.timeout(15000),
            headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
        });
        if (!response.ok) return [];
        const xml = await response.text();
        const $ = cheerio.load(xml, { xml: true });
        const urls = $("url loc").map((_, el) => $(el).text()).get();

        // Find store-like prefix
        const storeKeywords = ["store", "shop", "retail", "brand", "eat", "food", "drink",
            "restaurant", "leisure", "play", "directory", "listing", "retailer", "portfolio"];
        const prefixCounts = new Map<string, number>();
        for (const url of urls) {
            try {
                const path = new URL(url).pathname.replace(/\/$/, "");
                const segments = path.split("/").filter(Boolean);
                if (segments.length < 2) continue;
                for (let depth = 1; depth < segments.length; depth++) {
                    const prefix = "/" + segments.slice(0, depth).join("/");
                    prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
                }
            } catch { /* skip */ }
        }

        let bestPrefix: string | null = null;
        let bestSpec = 0;
        for (const [prefix, count] of prefixCounts) {
            if (count < 3) continue;
            if (storeKeywords.some((kw) => prefix.toLowerCase().includes(kw))) {
                const spec = prefix.split("/").length;
                if (spec > bestSpec) { bestPrefix = prefix; bestSpec = spec; }
            }
        }

        if (!bestPrefix) return [];

        const pfx = bestPrefix.endsWith("/") ? bestPrefix : bestPrefix + "/";
        const names: string[] = [];
        for (const url of urls) {
            try {
                const path = new URL(url).pathname;
                if (!path.startsWith(pfx)) continue;
                const remainder = path.slice(pfx.length).replace(/\/$/, "");
                if (remainder && !remainder.includes("/")) names.push(remainder);
            } catch { /* skip */ }
        }

        return names.map((slug) =>
            slug.replace(/-\d+$/, "").replace(/-/g, " ").replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()).trim()
        ).filter((n) => n.length > 1 && n.length < 60);
    } catch (err) {
        console.log(`   ⚠️ Failed to fetch sitemap: ${err}`);
        return [];
    }
}

async function fetchDirectoryTenants(url: string, locationName: string): Promise<Array<{ name: string; category: string; subcategory: string; isAnchorTenant: boolean }>> {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(15000),
            headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
        });
        if (!response.ok) return [];
        const html = await response.text();
        if (html.length < 500) return [];

        const truncated = html.substring(0, 80000);
        const prompt = `Extract ALL retail tenants/stores from this shopping centre page for ${locationName}.
For each tenant, classify using LDC taxonomy:
${LDC_TAXONOMY}
Return JSON array: [{"name": "Store Name", "category": "T2", "subcategory": "T3", "isAnchorTenant": false}]`;

        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Extract tenant names and classify with LDC taxonomy. Return valid JSON only." },
                { role: "user", content: `${prompt}\n\nHTML:\n${truncated}` },
            ],
            temperature: 0,
            max_tokens: 16000,
        });

        const raw = gptResponse.choices[0]?.message?.content?.trim() || "[]";
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.log(`   ⚠️ Failed to extract from directory: ${err}`);
        return [];
    }
}

async function categoriseNames(names: string[], locationName: string): Promise<Array<{ name: string; category: string; subcategory: string; isAnchorTenant: boolean }>> {
    const prompt = `Categorise these UK retail tenants for: ${locationName}
${LDC_TAXONOMY}
Tenants:\n${names.join("\n")}
Return JSON array: [{"name": "Store Name", "category": "T2", "subcategory": "T3", "isAnchorTenant": false}]`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "Classify store names into LDC taxonomy. Return valid JSON only." },
            { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 16000,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
}

async function saveTenants(locationId: string, locationName: string, tenants: Array<{ name: string; category: string; subcategory: string; isAnchorTenant: boolean }>) {
    // Delete existing tenants first
    await prisma.tenant.deleteMany({ where: { locationId } });

    let catResolved = 0;
    for (const t of tenants) {
        const categoryId = await getCategoryId(prisma, t.category, t.subcategory);
        if (categoryId) catResolved++;
        await prisma.tenant.create({
            data: {
                locationId,
                name: t.name,
                category: t.category,
                subcategory: t.subcategory || null,
                categoryId,
                isAnchorTenant: t.isAnchorTenant || false,
            },
        });
    }

    // Update numberOfStores and largestCategory
    const catCounts = new Map<string, number>();
    for (const t of tenants) {
        catCounts.set(t.category, (catCounts.get(t.category) || 0) + 1);
    }
    let largest = "";
    let largestCount = 0;
    for (const [cat, count] of catCounts) {
        if (count > largestCount) { largest = cat; largestCount = count; }
    }

    await prisma.location.update({
        where: { id: locationId },
        data: {
            numberOfStores: tenants.length,
            largestCategory: largest || null,
            largestCategoryPercent: tenants.length > 0 ? Math.round((largestCount / tenants.length) * 1000) / 10 : null,
        },
    });

    console.log(`   ✅ Saved ${tenants.length} tenants (${catResolved}/${tenants.length} categoryIds)`);
    console.log(`   📊 Largest: ${largest} (${tenants.length > 0 ? ((largestCount / tenants.length) * 100).toFixed(1) : 0}%)`);
}

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  🔧 FIX — Enrichment Issues Cleanup & Re-enrichment");
    console.log("═══════════════════════════════════════════════════════════\n");

    // ── Step 1: Delete bad websites ──
    console.log("── Step 1: Deleting bad websites ──\n");
    for (const domain of WEBSITES_TO_DELETE) {
        const locs = await prisma.location.findMany({
            where: { website: { contains: domain } },
            select: { id: true, name: true, website: true },
        });
        for (const loc of locs) {
            await prisma.tenant.deleteMany({ where: { locationId: loc.id } });
            await prisma.location.update({ where: { id: loc.id }, data: { website: null } });
            console.log(`   🗑️  ${loc.name} — deleted website + tenants`);
        }
    }

    // ── Step 2: Fix incorrect URLs ──
    console.log("\n── Step 2: Fixing incorrect URLs ──\n");
    for (const [oldDomain, newUrl] of Object.entries(WEBSITE_FIXES)) {
        const locs = await prisma.location.findMany({
            where: { website: { contains: oldDomain } },
            select: { id: true, name: true, website: true },
        });
        for (const loc of locs) {
            await prisma.tenant.deleteMany({ where: { locationId: loc.id } });
            await prisma.location.update({ where: { id: loc.id }, data: { website: newUrl } });
            console.log(`   🔄 ${loc.name}: ${loc.website} → ${newUrl}`);
        }
    }

    // ── Step 3: Re-enrich locations with known sitemaps ──
    console.log("\n── Step 3: Re-enriching with known sitemaps ──\n");
    for (const target of RE_ENRICH_TARGETS) {
        const locs = await prisma.location.findMany({
            where: { website: { contains: target.websiteMatch } },
            select: { id: true, name: true, website: true },
        });

        if (locs.length === 0) {
            console.log(`   ⚠️ No location found for ${target.websiteMatch}`);
            continue;
        }

        for (const loc of locs) {
            console.log(`\n┌── ${loc.name} (${target.websiteMatch})`);

            let tenants: Array<{ name: string; category: string; subcategory: string; isAnchorTenant: boolean }> = [];

            if (target.directoryUrl) {
                console.log(`   📄 Fetching directory: ${target.directoryUrl}`);
                tenants = await fetchDirectoryTenants(target.directoryUrl, loc.name);
            } else if (target.sitemapUrl) {
                console.log(`   🗺️  Fetching sitemap: ${target.sitemapUrl}`);
                const names = await fetchSitemapTenantNames(target.sitemapUrl);
                console.log(`   📋 Extracted ${names.length} names from sitemap`);
                if (names.length > 0) {
                    tenants = await categoriseNames(names, loc.name);
                }
            } else {
                // Try auto-discovery on the new URL
                const website = loc.website || "";
                const sitemapUrl = website.replace(/\/$/, "") + "/sitemap.xml";
                console.log(`   🔍 Auto-discovering: ${sitemapUrl}`);
                const names = await fetchSitemapTenantNames(sitemapUrl);
                if (names.length > 0) {
                    console.log(`   📋 Extracted ${names.length} names`);
                    tenants = await categoriseNames(names, loc.name);
                } else {
                    console.log(`   ❌ No tenants found via auto-discovery`);
                }
            }

            if (tenants.length > 0) {
                await saveTenants(loc.id, loc.name, tenants);
            } else {
                console.log(`   ❌ No tenants extracted`);
            }
        }
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  ✅ All fixes applied");
    console.log("═══════════════════════════════════════════════════════════");
}

main()
    .catch((err) => { console.error("Error:", err); process.exit(1); })
    .finally(() => prisma.$disconnect());
