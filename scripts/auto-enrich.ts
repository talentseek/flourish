#!/usr/bin/env tsx
/**
 * 🏪 AUTO-ENRICH — Automated Tenant & Metadata Enrichment Pipeline
 *
 * Discovers shopping centres lacking tenant data, fetches their sitemaps,
 * scrapes store directories, categorises tenants using LDC taxonomy via
 * GPT-4o-mini, and upserts everything to the database.
 *
 * Usage:
 *   npx tsx scripts/auto-enrich.ts                 # Enrich all (batch 50)
 *   npx tsx scripts/auto-enrich.ts --batch 20      # Custom batch size
 *   npx tsx scripts/auto-enrich.ts --id <locId>    # Single location
 *   npx tsx scripts/auto-enrich.ts --dry-run       # No DB writes
 *   npx tsx scripts/auto-enrich.ts --type SHOPPING_CENTRE
 *   npx tsx scripts/auto-enrich.ts --reset         # Clear progress file
 */

import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import * as fs from "fs";
import OpenAI from "openai";
import { getCategoryId } from "../src/lib/category-lookup";

const prisma = new PrismaClient();
const openai = new OpenAI();

// ── Config ───────────────────────────────────────────────────────────────

const PROGRESS_FILE = "/tmp/auto-enrich-progress.json";
const RATE_LIMIT_MS = 3000;
const FETCH_TIMEOUT_MS = 15000;
const MAX_HTML_LENGTH = 80000; // chars sent to GPT
const LOCATION_TIMEOUT_MS = 90000; // 90s max per location
const GPT_TIMEOUT_MS = 60000; // 60s max per GPT call
const MAX_TENANT_NAMES = 250; // cap names sent to GPT

const STORE_DIRECTORY_PATTERNS = [
    "/stores",
    "/store-directory",
    "/shop-directory",
    "/shops",
    "/retailers",
    "/retail-directory",
    "/our-stores",
    "/find-a-store",
    "/shopping",
    "/brands",
    "/directory",
    "/store-guide",
    "/stores-services",
    "/whats-here",
    "/whos-here",
    "/who-s-here",
    "/tenants",
    "/store-list",
    "/all-stores",
    "/store-listing",
    "/retailers-list",
    "/shops-and-restaurants",
    "/shops-restaurants",
    "/stores-and-restaurants",
    "/eat-drink",
    "/food-drink",
    "/food-and-drink",
    "/leisure",
    "/entertainment",
    "/our-shops",
    "/explore",
    "/units",
    "/whats-on",
    "/food",
];

// ── Known UK Retail Brands (for homepage quick-scan) ─────────────────────

const KNOWN_UK_BRANDS = [
    // Fashion & Footwear
    "Primark", "Next", "H&M", "New Look", "River Island", "TK Maxx",
    "JD Sports", "Sports Direct", "Zara", "Schuh", "Clarks", "Footasylum",
    "Fat Face", "White Stuff", "Superdry", "Jack & Jones", "Mango",
    "Monsoon", "Levi's", "GAP", "Bershka", "Pull & Bear", "Accessorize",
    "Ann Summers", "Bonmarché", "Burton", "Dorothy Perkins", "Joules",
    "Karen Millen", "Kurt Geiger", "Matalan", "Moss", "Oasis",
    "Office", "Phase Eight", "Quiz", "Regatta", "Trespass",
    "Mountain Warehouse", "Go Outdoors", "Craghoppers", "Nike", "Adidas",
    "Puma", "Reebok", "Under Armour", "Skechers", "Vans",
    // Health & Beauty
    "Boots", "Superdrug", "Holland & Barrett", "The Body Shop", "Lush",
    "Specsavers", "Vision Express", "Optical Express", "Body Shop",
    "The Perfume Shop", "Fragrance Shop", "Rituals", "Kiehl's",
    "Savers", "Sally", "Beauty Outlet",
    // Food & Coffee
    "McDonald's", "Costa", "Costa Coffee", "Starbucks", "Greggs",
    "Subway", "KFC", "Nando's", "Pizza Express", "PizzaExpress",
    "Wagamama", "Burger King", "Tim Hortons", "Five Guys",
    "Frankie & Benny's", "TGI Fridays", "Caffè Nero", "Caffe Nero",
    "Pret", "Pret A Manger", "Pizza Hut", "Domino's", "Taco Bell",
    "Bella Italia", "Prezzo", "Chiquito", "Slim Chickens",
    "Tortilla", "Chopstix", "Yo! Sushi", "Wasabi", "Leon",
    "Krispy Kreme", "Cinnabon", "Donut",
    // Grocery
    "Tesco", "Sainsbury's", "Aldi", "Lidl", "Asda", "Morrisons",
    "Co-op", "Waitrose", "Iceland", "Heron Foods", "Home Bargains",
    // Department / Anchor
    "M&S", "Marks & Spencer", "Marks and Spencer", "John Lewis",
    "Debenhams", "Selfridges", "IKEA", "Argos", "Wilko",
    // Electronics
    "Currys", "EE", "O2", "Vodafone", "Three", "Game", "CEX",
    "Apple", "Samsung", "Carphone Warehouse",
    // Home
    "DFS", "Sofology", "B&Q", "The Range", "B&M", "Dunelm",
    "HomeSense", "Home Bargains", "Bensons for Beds", "Dreams",
    "Wren Kitchens", "ScS", "Furniture Village", "Laura Ashley",
    "Barker and Stonehouse", "Pets at Home", "Hobbycraft",
    // General
    "Poundland", "Poundstretcher", "Card Factory", "WHSmith",
    "The Works", "The Entertainer", "Smyths", "One Beyond",
    "Tiger", "Flying Tiger", "Paperchase", "Waterstones",
    // Jewellery
    "Pandora", "H.Samuel", "Ernest Jones", "Goldsmiths", "Swarovski",
    "Warren James", "Lovisa",
    // Services
    "TUI", "Hays Travel", "Post Office", "Timpson",
    "Max Spielmann", "Clarks",
    // Entertainment
    "Cineworld", "Odeon", "ODEON", "Vue", "PureGym", "Pure Gym",
    "The Gym", "JD Gyms", "Bowling", "Laser",
    // Cafes & Bakeries
    "Cooplands", "Greggs", "Corn", "Millie's Cookies",
    // Charity
    "British Heart Foundation", "Cancer Research", "Oxfam",
    "Barnardo's", "Sue Ryder", "Mind",
];

/** Quick-scan HTML for known UK brands — no GPT needed */
function scanForKnownBrands(html: string): string[] {
    const textLower = html.toLowerCase();
    const found: string[] = [];
    for (const brand of KNOWN_UK_BRANDS) {
        if (textLower.includes(brand.toLowerCase())) {
            found.push(brand);
        }
    }
    return [...new Set(found)];
}

/** Detect if HTML looks like a JS-rendered SPA shell */
function isJsRenderedPage(html: string): boolean {
    const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const textOnly = stripped.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    // Very little text content but page exists (has title or meta)
    const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(html);
    const hasReactRoot = /__NEXT_DATA__|<div id="(app|root|__next)"/i.test(html);
    const tinyText = textOnly.length < 500;
    return hasTitle && (hasReactRoot || tinyText);
}

// ── LDC Taxonomy (embedded for GPT prompt) ───────────────────────────────

const LDC_TAXONOMY = `
T2 CATEGORY → T3 SUBCATEGORIES:

Clothing & Footwear → Womenswear, Menswear, Childrenswear, Fast Fashion, Designer, Premium, Contemporary, Casual, Streetwear, Sportswear, Activewear, Outdoor, Lingerie, Loungewear, Footwear, Trainers, Occasion Wear, Plus Size, Denim, Accessories, Bags & Accessories, Outlet, Value, Surf & Outdoor, Snow Sports, Concept Store, Country, Mid-Range, Leather Goods, Luggage, Cycling, Premium Menswear
Health & Beauty → Pharmacy, Cosmetics, Premium Cosmetics, Fragrance, Skincare, Optician, Eyewear, Beauty Salon, Hair Salon, Nail Salon, Barber, Spa, Health Food Store, Bath & Body, Body Care, Hair Care, Aesthetics, Wellness, Dental, K-Beauty
Food & Grocery → Supermarket, Convenience Store, Butcher, Deli, Farm Shop, Confectionery, Chocolate Shop, Chocolatier, Sweet Shop, Bubble Tea
General Retail → Discount Store, Variety Store, Vape Shop, Specialist
Department Stores → Department Store
Gifts & Stationery → Cards & Gifts, Books & Stationery, Books, Stationery, Souvenirs, Music Merchandise, Gifts, Gifts & Homeware, Gadgets & Gifts, Art, Art Gallery, Art & Jewellery, Pottery
Jewellery & Watches → Jewellery, Fashion Jewellery, Crystal Jewellery, Watches, Luxury Watches, Watch Repair
Electrical & Technology → Consumer Electronics, Mobile Network, Mobile Repair, Mobile Accessories, Mobile, Telecoms, Phone Repairs, Entertainment Retail, Second Hand Electronics, Home Appliances
Home & Garden → Homeware, Kitchenware, Kitchen & Home, Furniture, Bedding, Home Fragrance, Home & Lifestyle, Lifestyle
Kids & Toys → Toy Store, Toys, Kidswear
Cafes & Restaurants → Coffee Shop, Cafe, Tea Shop, Restaurant, Fast Food, Fast Casual, Premium Casual, Casual, Bakery, Sandwich Shop, Dessert, Dessert Shop, Milkshake Bar, Food Hall, Takeaway, Pub, Bar, Restaurant Bar
Leisure & Entertainment → Cinema, Gym, Bowling, Mini Golf, Escape Room, Trampoline Park, Indoor Skiing, Climbing, Virtual Reality, Arcade, Amusements, Casino, Social Gaming, Adventure, Collectibles, Sport Merchandise, Sports Retailer
Services → Travel Agency, Post Office, Photo Printing, Shoe Repair, Dry Cleaning, Launderette, Alterations, Newsagent, Betting, Parcel Collection, Parcel Locker, Trade Supplies, Car Wash, Employment Services, Education, Community, Community Hub
Financial Services → Bank, Building Society, Currency Exchange, Pawnbroker
Charity & Second Hand → Charity Shop, Charity
Vacant → Vacant Unit, Under Refurbishment, Coming Soon
`.trim();

// ── Types ────────────────────────────────────────────────────────────────

interface TenantInput {
    name: string;
    category: string;
    subcategory: string | null;
    isAnchorTenant: boolean;
}

interface LocationTarget {
    id: string;
    name: string;
    website: string | null;
    city: string | null;
    type: string;
    numberOfStores: number | null;
}

interface EnrichmentResult {
    locationId: string;
    locationName: string;
    tenantsFound: number;
    tenantsSaved: number;
    categoryIdResolved: number;
    source: string;
    error?: string;
}

interface ProgressData {
    processedIds: string[];
    results: EnrichmentResult[];
    startedAt: string;
}

// ── CLI Args ─────────────────────────────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);
    const flags = {
        batch: 50,
        id: null as string | null,
        dryRun: false,
        type: null as string | null,
        reset: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--batch":
                flags.batch = parseInt(args[++i], 10) || 50;
                break;
            case "--id":
                flags.id = args[++i];
                break;
            case "--dry-run":
                flags.dryRun = true;
                break;
            case "--type":
                flags.type = args[++i];
                break;
            case "--reset":
                flags.reset = true;
                break;
        }
    }

    return flags;
}

// ── Progress Tracking ────────────────────────────────────────────────────

function loadProgress(): ProgressData {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
        }
    } catch {
        // Corrupted file, start fresh
    }
    return { processedIds: [], results: [], startedAt: new Date().toISOString() };
}

function saveProgress(progress: ProgressData): void {
    try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    } catch {
        // Ignore write errors
    }
}

function clearProgress(): void {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            fs.unlinkSync(PROGRESS_FILE);
            console.log("🗑️  Progress file cleared");
        }
    } catch {
        // Ignore
    }
}

// ── HTTP Helpers ─────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            redirect: "follow",
        });

        if (!response.ok) return null;

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text") && !contentType.includes("xml")) return null;

        return await response.text();
    } catch {
        return null;
    }
}

// ── Sitemap Discovery ────────────────────────────────────────────────────

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
    const allUrls: string[] = [];

    // Try main sitemap.xml
    const sitemapUrl = new URL("/sitemap.xml", baseUrl).href;
    const sitemapXml = await fetchPage(sitemapUrl);
    if (!sitemapXml) return [];

    const $ = cheerio.load(sitemapXml, { xmlMode: true });

    // Check if this is a sitemap index (contains other sitemaps)
    const sitemapLocs = $("sitemap > loc");
    if (sitemapLocs.length > 0) {
        // It's a sitemap index — fetch each child sitemap
        const childSitemaps: string[] = [];
        sitemapLocs.each((_, elem) => {
            const loc = $(elem).text().trim();
            if (loc) childSitemaps.push(loc);
        });

        // Only fetch child sitemaps that look relevant (stores, shops, etc.)
        const storeKeywords = [
            "store", "shop", "retail", "tenant", "brand", "directory",
            "eat", "food", "drink", "restaurant", "leisure", "play",
            "business", "listing",
        ];

        const relevantSitemaps = childSitemaps.filter((url) => {
            const urlLower = url.toLowerCase();
            return storeKeywords.some((kw) => urlLower.includes(kw));
        });

        // If no relevant ones found, try all (up to 5)
        const toFetch = relevantSitemaps.length > 0
            ? relevantSitemaps.slice(0, 8)
            : childSitemaps.slice(0, 5);

        for (const childUrl of toFetch) {
            const childXml = await fetchPage(childUrl);
            if (childXml) {
                const child$ = cheerio.load(childXml, { xmlMode: true });
                child$("url > loc").each((_, elem) => {
                    const loc = child$(elem).text().trim();
                    if (loc) allUrls.push(loc);
                });
            }
        }
    } else {
        // Regular sitemap — extract URLs directly
        $("url > loc").each((_, elem) => {
            const loc = $(elem).text().trim();
            if (loc) allUrls.push(loc);
        });
    }

    return allUrls;
}

// ── Store Directory Discovery ────────────────────────────────────────────

function findStoreDirectoryUrls(sitemapUrls: string[]): string[] {
    const storeKeywords = [
        "store", "shop", "retailer", "tenant", "directory", "brand",
        "shopping", "whats-here", "find", "listing",
    ];

    // Find pages that are store DIRECTORY pages (not individual store pages)
    // Filter out individual store detail URLs (usually have /stores/store-name pattern)
    const candidates = sitemapUrls.filter((url) => {
        const urlLower = url.toLowerCase();
        const path = new URL(url).pathname;
        const segments = path.split("/").filter(Boolean);

        // Must contain a store keyword
        const hasKeyword = storeKeywords.some((kw) => urlLower.includes(kw));
        if (!hasKeyword) return false;

        // Prefer root directory pages (fewer path segments = more likely to be a list)
        // e.g. /stores (good) vs /stores/primark (individual store)
        return segments.length <= 2;
    });

    // Dedupe and prioritise shorter paths (more likely to be directory pages)
    const unique = [...new Set(candidates)];
    unique.sort((a, b) => new URL(a).pathname.length - new URL(b).pathname.length);

    return unique.slice(0, 5);
}

async function discoverStoreDirectoryUrl(
    website: string
): Promise<{ url: string; source: string; sitemapUrls?: string[]; storePrefix?: string } | null> {
    // Strategy 1: Sitemap discovery
    const sitemapUrls = await fetchSitemapUrls(website);
    if (sitemapUrls.length > 0) {
        // Check if sitemap contains individual store pages (e.g. /stores/primark, /en/shop-listing/primark)
        const storePrefix = detectStorePagePrefix(sitemapUrls);
        if (storePrefix) {
            return { url: "__SITEMAP_DIRECT__", source: "sitemap-urls", sitemapUrls, storePrefix };
        }

        // Otherwise look for directory pages in the sitemap
        const directoryUrls = findStoreDirectoryUrls(sitemapUrls);
        for (const dirUrl of directoryUrls) {
            const html = await fetchPage(dirUrl);
            if (html && html.length > 1000) {
                return { url: dirUrl, source: "sitemap-directory" };
            }
        }
    }

    // Strategy 2: Brute-force common paths
    for (const pattern of STORE_DIRECTORY_PATTERNS) {
        try {
            const testUrl = new URL(pattern, website).href;
            const response = await fetch(testUrl, {
                method: "HEAD",
                signal: AbortSignal.timeout(5000),
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                },
                redirect: "follow",
            });

            if (response.ok) {
                return { url: testUrl, source: `pattern:${pattern}` };
            }
        } catch {
            // Skip
        }
    }

    return null;
}

/**
 * Detect the most specific URL prefix that contains individual store pages.
 * Handles multi-segment paths like /en/shop-listing/ or /stores/.
 * Returns the prefix string (e.g. "/en/shop-listing") or null.
 */
function detectStorePagePrefix(urls: string[]): string | null {
    const storeKeywords = [
        "store", "shop", "retail", "brand", "eat", "food", "drink",
        "restaurant", "leisure", "play", "directory", "listing",
    ];

    // Build prefix counts at all depths
    const prefixCounts = new Map<string, number>();
    for (const url of urls) {
        try {
            const path = new URL(url).pathname.replace(/\/$/, "");
            const segments = path.split("/").filter(Boolean);
            if (segments.length < 2) continue;

            // Build all prefixes except the last segment (which is the store slug)
            for (let depth = 1; depth < segments.length; depth++) {
                const prefix = "/" + segments.slice(0, depth).join("/");
                prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
            }
        } catch {
            // Skip invalid URLs
        }
    }

    // Find the most specific prefix with a store keyword and 10+ child URLs
    let bestPrefix: string | null = null;
    let bestSpecificity = 0;

    for (const [prefix, count] of prefixCounts) {
        if (count < 10) continue;
        const prefixLower = prefix.toLowerCase();
        const isRelevant = storeKeywords.some((kw) => prefixLower.includes(kw));
        if (!isRelevant) continue;

        // Prefer more specific (longer) prefixes
        const specificity = prefix.split("/").length;
        if (specificity > bestSpecificity || (specificity === bestSpecificity && count > (prefixCounts.get(bestPrefix!) || 0))) {
            bestPrefix = prefix;
            bestSpecificity = specificity;
        }
    }

    return bestPrefix;
}

// ── Tenant Name Extraction from Sitemap URLs ─────────────────────────────

function extractTenantNamesFromUrls(sitemapUrls: string[], prefix: string): string[] {
    const tenantSlugs: string[] = [];
    const prefixWithSlash = prefix.endsWith("/") ? prefix : prefix + "/";

    for (const url of sitemapUrls) {
        try {
            const path = new URL(url).pathname;
            // Check if this URL starts with the detected prefix
            if (!path.startsWith(prefixWithSlash)) continue;

            // Extract the part after the prefix
            const remainder = path.slice(prefixWithSlash.length).replace(/\/$/, "");
            // Only take direct children (no further nesting)
            if (remainder && !remainder.includes("/")) {
                tenantSlugs.push(remainder);
            }
        } catch {
            // Skip
        }
    }

    // Convert slugs to readable names
    return tenantSlugs
        .map((slug) => {
            return slug
                .replace(/-\d+$/, "")        // Remove trailing numbers like "-1"
                .replace(/-/g, " ")          // Hyphens to spaces
                .replace(/_/g, " ")          // Underscores to spaces
                .replace(/\b\w/g, (c) => c.toUpperCase()) // Title case
                .trim();
        })
        .filter((name) => name.length > 1 && name.length < 60);
}

// ── GPT Tenant Extraction & Categorisation ───────────────────────────────

async function extractAndCategoriseTenants(
    html: string,
    locationName: string,
    source: string
): Promise<TenantInput[]> {
    // Strip HTML to text, keeping structure hints
    const $ = cheerio.load(html);
    $("script, style, noscript, svg, nav, footer, header").remove();

    // Extract text content with some structure
    const textContent = $("body").text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_HTML_LENGTH);

    if (textContent.length < 100) return [];

    const prompt = `You are extracting store/tenant data from a UK shopping centre directory page.

LOCATION: ${locationName}

PAGE TEXT:
${textContent}

TASK: Extract ALL stores, restaurants, cafes, services, and leisure venues listed on this page.
For each tenant, classify using the LDC 3-Tier Retail Taxonomy below.

${LDC_TAXONOMY}

RULES:
1. "category" MUST be an exact T2 category name from the list above
2. "subcategory" MUST be an exact T3 subcategory name from the list above
3. Set isAnchorTenant=true for department stores, large fashion retailers (Primark, H&M, Zara, Next, M&S), cinemas, and major supermarkets
4. Do NOT include generic entries like "See all stores" or "Filter by"
5. Do NOT include categories/sections as tenants (e.g. "Fashion", "Food & Drink")
6. If a store doesn't clearly fit a subcategory, use the most appropriate one

Return a JSON array ONLY (no markdown, no explanation):
[{"name": "Store Name", "category": "T2 Category", "subcategory": "T3 Subcategory", "isAnchorTenant": false}]

If you cannot find any stores on this page, return an empty array: []`;

    try {
        const response = await Promise.race([
            openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a UK retail data extraction specialist. Extract tenant names and classify them with the LDC taxonomy. Be thorough — extract every single store. Return only valid JSON.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0,
                max_tokens: 16000,
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("GPT timeout")), GPT_TIMEOUT_MS)),
        ]);

        const raw = response.choices[0]?.message?.content?.trim() || "[]";
        const cleaned = raw
            .replace(/^```json?\n?/i, "")
            .replace(/\n?```$/i, "")
            .trim();

        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (t: any) =>
                    typeof t.name === "string" &&
                    t.name.length > 1 &&
                    typeof t.category === "string"
            )
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

async function categoriseFromNames(
    names: string[],
    locationName: string
): Promise<TenantInput[]> {
    if (names.length === 0) return [];

    // Cap names to avoid GPT token limits
    const cappedNames = names.slice(0, MAX_TENANT_NAMES);
    if (names.length > MAX_TENANT_NAMES) {
        console.log(`   ✂️  Capped from ${names.length} to ${MAX_TENANT_NAMES} names for GPT`);
    }

    const nameList = cappedNames.join("\n");

    const prompt = `You are categorising UK retail tenants for: ${locationName}

Here are tenant names extracted from the shopping centre's sitemap URLs:

${nameList}

Classify each using the LDC 3-Tier Retail Taxonomy:

${LDC_TAXONOMY}

RULES:
1. "category" MUST be an exact T2 category name from the list above
2. "subcategory" MUST be an exact T3 subcategory name from the list above
3. Set isAnchorTenant=true for department stores, large fashion retailers (Primark, H&M, Zara, Next, M&S), cinemas, and major supermarkets
4. Skip entries that are clearly NOT stores (e.g. "Blog", "About Us", "Contact", "Car Park", "Events", "Jobs")

Return a JSON array ONLY (no markdown, no explanation):
[{"name": "Store Name", "category": "T2 Category", "subcategory": "T3 Subcategory", "isAnchorTenant": false}]`;

    try {
        const response = await Promise.race([
            openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a UK retail data specialist. Classify store names into LDC taxonomy categories. Only include actual retail tenants, restaurants, or service providers. Return valid JSON only.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0,
                max_tokens: 16000,
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("GPT timeout")), GPT_TIMEOUT_MS)),
        ]);

        const raw = response.choices[0]?.message?.content?.trim() || "[]";
        const cleaned = raw
            .replace(/^```json?\n?/i, "")
            .replace(/\n?```$/i, "")
            .trim();

        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (t: any) =>
                    typeof t.name === "string" &&
                    t.name.length > 1 &&
                    typeof t.category === "string"
            )
            .map((t: any) => ({
                name: t.name.trim(),
                category: t.category.trim(),
                subcategory: t.subcategory?.trim() || null,
                isAnchorTenant: Boolean(t.isAnchorTenant),
            }));
    } catch (err: any) {
        console.error(`   ❌ GPT categorisation failed: ${err.message?.slice(0, 100)}`);
        return [];
    }
}

// ── Main Enrichment Logic per Location ───────────────────────────────────

async function enrichLocation(
    location: LocationTarget,
    dryRun: boolean
): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
        locationId: location.id,
        locationName: location.name,
        tenantsFound: 0,
        tenantsSaved: 0,
        categoryIdResolved: 0,
        source: "none",
    };

    if (!location.website) {
        result.error = "No website";
        return result;
    }

    // Skip aggregator/listing sites that aren't actual centre websites
    const BLACKLISTED_DOMAINS = [
        // Aggregator / listing sites
        "completelyretail.co.uk", "yell.com", "tripadvisor.co.uk", "yelp.co.uk",
        // Social media
        "google.com", "facebook.com", "instagram.com", "twitter.com", "linkedin.com",
        // Property / estate agents
        "rightmove.co.uk", "zoopla.co.uk", "inpost.co.uk",
        "consolprop.co.uk", "derwentlondon.com", "evolveestates.com",
        "marshallcdp.com", "clowes.co.uk", "nrr.co.uk", "ashbycapital.com",
        "xprop.co.uk", "fletchermorgan.co.uk",
        // Individual store pages (not retail parks)
        "currys.co.uk/store-finder", "next.co.uk/storelocator",
        "my.morrisons.com/storefinder", "store.homebase.co.uk",
        "therange.co.uk/stores", "poundland.co.uk/store-finder",
        "anytimefitness.co.uk", "snapfitness.com",
        // Supermarket homepages
        "www.tesco.com", "www.asda.com", "www.lidl.co.uk",
        // Parked / placeholder domains
        "poi.place", "domain-parking.uk", "ukbackorder.uk",
        "perfectdomains.co.uk", "easyspace.com",
        // Non-retail
        "networkspace.co.uk", "parkopedia.co.uk",
        "investinshropshire.co.uk", "haloleisure.org.uk",
        "waterworld.co.uk", "jumpinfun.co.uk",
        "stadiumcarparks.co.uk", "majestic.co.uk",
        "bostontestingstation.co.uk", "atlanticbowl.co.uk",
        "ageuk.org.uk", "showcasecinemas.co.uk",
        "supplementfactoryuk.com", "lincolnshire.coop",
        "britishland.com", "cardfactory.co.uk",
        // Business / corporate
        "aibp.co.uk", "gillinghambusinesspark.co.uk", "gemini8.co.uk",
        // Newspapers / directories
        "wirralglobe.co.uk", "huddersfieldonline.co.uk",
        "rotherhamweb.co.uk",
        // Government / tourism
        "visittamworth.co.uk", ".gov.uk",
    ];
    const websiteLower = location.website.toLowerCase();
    if (BLACKLISTED_DOMAINS.some((d) => websiteLower.includes(d))) {
        result.error = `BLACKLISTED: ${location.website}`;
        console.log(`   🚫 Skipping blacklisted domain`);
        return result;
    }

    // Normalise website URL
    let website = location.website;
    if (!website.startsWith("http")) website = `https://${website}`;

    console.log(`   🌐 Website: ${website}`);

    // Step 1: Discover store directory
    const discovery = await discoverStoreDirectoryUrl(website);
    let tenants: TenantInput[] = [];

    if (discovery) {
        console.log(`   📍 Source: ${discovery.source}`);

        // Step 2A: Extract tenants from sitemap or directory
        if (discovery.source === "sitemap-urls" && discovery.sitemapUrls && discovery.storePrefix) {
            const names = extractTenantNamesFromUrls(discovery.sitemapUrls, discovery.storePrefix);
            console.log(`   📋 Extracted ${names.length} names from sitemap URLs (prefix: ${discovery.storePrefix})`);

            if (names.length >= 5) {
                tenants = await categoriseFromNames(names, location.name);
            }

            // Fallback: if URL-based extraction yielded too few, try fetching the directory page
            if (tenants.length < 5) {
                console.log("   🔄 URL extraction insufficient, trying directory page...");
                const dirUrl = new URL(discovery.storePrefix, website).href;
                const dirHtml = await fetchPage(dirUrl);
                if (dirHtml && dirHtml.length > 500) {
                    console.log(`   📄 Fetched directory page: ${discovery.storePrefix}`);
                    const dirTenants = await extractAndCategoriseTenants(dirHtml, location.name, "sitemap-directory-fallback");
                    if (dirTenants.length > tenants.length) {
                        tenants = dirTenants;
                        result.source = "sitemap-directory-fallback";
                    }
                }
            }
        } else {
            const html = await fetchPage(discovery.url);
            if (html && html.length > 500) {
                tenants = await extractAndCategoriseTenants(html, location.name, discovery.source);
            } else {
                console.log("   ⚠️ Directory page fetched but too small");
            }
        }
    }

    // Step 2B: Homepage fallback — if no tenants found yet, try the homepage
    if (tenants.length < 3) {
        console.log("   🏠 Trying homepage fallback...");
        const homepageHtml = await fetchPage(website);

        if (homepageHtml) {
            // Check if homepage is JS-rendered (SPA shell)
            if (isJsRenderedPage(homepageHtml)) {
                result.error = "JS_RENDERED: Homepage is a SPA shell — needs Playwright";
                console.log("   🔄 JS-rendered page detected — flagging for Phase 2");
                if (tenants.length === 0) return result;
            } else {
                // Quick scan for known brands without GPT
                const brands = scanForKnownBrands(homepageHtml);
                console.log(`   🔍 Known brands found on homepage: ${brands.length}`);

                if (brands.length >= 3) {
                    // Use GPT to properly categorise from the homepage HTML
                    const homeTenants = await extractAndCategoriseTenants(
                        homepageHtml, location.name, "homepage-fallback"
                    );
                    if (homeTenants.length > tenants.length) {
                        tenants = homeTenants;
                        result.source = "homepage-fallback";
                        console.log(`   ✅ Homepage extraction got ${tenants.length} tenants`);
                    }
                } else if (brands.length > 0 && tenants.length === 0) {
                    // Few brands — try GPT anyway as last resort
                    const homeTenants = await extractAndCategoriseTenants(
                        homepageHtml, location.name, "homepage-lastresort"
                    );
                    if (homeTenants.length > 0) {
                        tenants = homeTenants;
                        result.source = "homepage-lastresort";
                    }
                }
            }
        } else {
            if (tenants.length === 0) {
                result.error = "FETCH_FAILED: Could not reach website";
                console.log("   ❌ Could not fetch homepage");
                return result;
            }
        }
    }

    if (tenants.length === 0 && !result.error) {
        result.error = "NO_TENANTS: No tenants could be extracted from any source";
        console.log("   ❌ No tenants extracted from any source");
    }

    result.tenantsFound = tenants.length;
    if (!result.source || result.source === "none") {
        result.source = discovery?.source || "none";
    }

    if (tenants.length === 0) {
        if (!result.error) result.error = "NO_TENANTS: No tenants extracted";
        return result;
    }

    console.log(`   🏪 Extracted ${tenants.length} tenants`);

    // Step 3: Resolve categoryIds
    for (const tenant of tenants) {
        const catId = await getCategoryId(prisma, tenant.category, tenant.subcategory);
        if (catId) result.categoryIdResolved++;
    }

    console.log(
        `   🏷️  Category IDs resolved: ${result.categoryIdResolved}/${tenants.length}`
    );

    if (dryRun) {
        console.log("   🔍 DRY RUN — no DB writes");
        // Print sample
        for (const t of tenants.slice(0, 5)) {
            console.log(
                `      ${t.isAnchorTenant ? "⭐" : "  "} ${t.name} → ${t.category} / ${t.subcategory || "—"}`
            );
        }
        if (tenants.length > 5) {
            console.log(`      ... and ${tenants.length - 5} more`);
        }
        result.tenantsSaved = 0;
        return result;
    }

    // Step 4: Delete existing tenants and insert new ones
    const deleted = await prisma.tenant.deleteMany({
        where: { locationId: location.id },
    });
    if (deleted.count > 0) {
        console.log(`   🗑️  Deleted ${deleted.count} existing tenants`);
    }

    let saved = 0;
    for (const t of tenants) {
        try {
            const categoryId = await getCategoryId(prisma, t.category, t.subcategory);

            await prisma.tenant.create({
                data: {
                    locationId: location.id,
                    name: t.name,
                    category: t.category,
                    subcategory: t.subcategory,
                    categoryId,
                    isAnchorTenant: t.isAnchorTenant,
                },
            });
            saved++;
        } catch (err: any) {
            // Skip duplicates
            if (!err.message?.includes("Unique constraint")) {
                console.warn(`   ⚠️ Skipped "${t.name}": ${err.message?.slice(0, 80)}`);
            }
        }
    }

    result.tenantsSaved = saved;
    console.log(`   ✅ Saved ${saved} tenants`);

    // Step 5: Update numberOfStores + largestCategory
    await updateLocationStats(location.id, saved);

    return result;
}

// ── Location Stats Update ────────────────────────────────────────────────

async function updateLocationStats(locationId: string, tenantCount: number) {
    // Update numberOfStores
    await prisma.location.update({
        where: { id: locationId },
        data: { numberOfStores: tenantCount, retailers: tenantCount },
    });

    // Calculate and update largestCategory
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });

    const total = cats.reduce((sum, c) => sum + c._count, 0);
    if (cats.length > 0 && total > 0) {
        await prisma.location.update({
            where: { id: locationId },
            data: {
                largestCategory: cats[0].category,
                largestCategoryPercent: Number((cats[0]._count / total).toFixed(3)),
            },
        });
        console.log(
            `   📊 Largest: ${cats[0].category} (${((cats[0]._count / total) * 100).toFixed(1)}%)`
        );
    }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
    const flags = parseArgs();

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  🏪 AUTO-ENRICH — Automated Tenant Enrichment Pipeline");
    console.log("═══════════════════════════════════════════════════════════\n");

    if (flags.dryRun) console.log("🔍 DRY RUN MODE — no database writes\n");

    if (flags.reset) {
        clearProgress();
        return;
    }

    // Load progress
    const progress = loadProgress();
    if (progress.processedIds.length > 0) {
        console.log(
            `📂 Resuming — ${progress.processedIds.length} locations already processed\n`
        );
    }

    // Build query
    let locations: LocationTarget[];

    if (flags.id) {
        // Single location mode
        const loc = await prisma.location.findUnique({
            where: { id: flags.id },
            select: { id: true, name: true, website: true, city: true, type: true, numberOfStores: true },
        });

        if (!loc) {
            console.error(`❌ Location not found: ${flags.id}`);
            return;
        }
        locations = [loc];
        console.log(`🎯 Single location mode: ${loc.name}\n`);
    } else {
        // Batch mode — find locations needing enrichment
        const where: any = {
            website: { not: null },
            tenants: { none: {} },
            id: { notIn: progress.processedIds },
        };

        if (flags.type) {
            where.type = flags.type;
        } else {
            where.type = { in: ["SHOPPING_CENTRE", "RETAIL_PARK", "OUTLET_CENTRE"] };
        }

        locations = await prisma.location.findMany({
            where,
            select: {
                id: true,
                name: true,
                website: true,
                city: true,
                type: true,
                numberOfStores: true,
            },
            orderBy: [
                { type: "asc" }, // SHOPPING_CENTRE first
                { numberOfStores: "desc" }, // Largest first
            ],
            take: flags.batch,
        });

        console.log(
            `📊 Found ${locations.length} locations to enrich (batch: ${flags.batch})\n`
        );
    }

    if (locations.length === 0) {
        console.log("✅ No locations need enrichment!");
        return;
    }

    // Process locations
    let success = 0;
    let failed = 0;
    let totalTenants = 0;

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];

        console.log(`\n┌─────────────────────────────────────────────────────────`);
        console.log(`│ [${i + 1}/${locations.length}] ${loc.name} (${loc.city || "?"}) — ${loc.type}`);
        console.log(`└─────────────────────────────────────────────────────────`);

        // Wrap enrichLocation in a timeout to prevent hanging on oversized directories
        let result: EnrichmentResult;
        try {
            result = await Promise.race([
                enrichLocation(loc, flags.dryRun),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), LOCATION_TIMEOUT_MS)
                ),
            ]);
        } catch (err: any) {
            console.log(`   ⏰ Timed out after ${LOCATION_TIMEOUT_MS / 1000}s — skipping`);
            result = {
                locationId: loc.id,
                locationName: loc.name,
                tenantsFound: 0,
                tenantsSaved: 0,
                categoryIdResolved: 0,
                source: "none",
                error: `Timeout: ${err.message}`,
            };
        }

        if (result.tenantsSaved > 0 || (flags.dryRun && result.tenantsFound > 0)) {
            success++;
            totalTenants += flags.dryRun ? result.tenantsFound : result.tenantsSaved;
        } else {
            failed++;
            if (result.error) console.log(`   ⚠️ ${result.error}`);
        }

        // Save progress
        if (!flags.id) {
            progress.processedIds.push(loc.id);
            progress.results.push(result);
            saveProgress(progress);
        }

        // Checkpoint every 10 locations
        if ((i + 1) % 10 === 0) {
            console.log(`\n📊 CHECKPOINT [${i + 1}/${locations.length}]`);
            console.log(`   ✅ Success: ${success}  ❌ Failed: ${failed}  🏪 Total tenants: ${totalTenants}`);
        }

        // Rate limiting
        if (i < locations.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
        }
    }

    // Final summary
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  📊 FINAL SUMMARY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  ✅ Success:       ${success}/${locations.length}`);
    console.log(`  ❌ Failed:        ${failed}/${locations.length}`);
    console.log(`  🏪 Total tenants: ${totalTenants}`);
    console.log(
        `  📈 Success rate:  ${((success / locations.length) * 100).toFixed(1)}%`
    );

    if (!flags.dryRun && !flags.id) {
        console.log(`\n  Progress saved to: ${PROGRESS_FILE}`);
        console.log(`  Run again to continue with the next batch.`);
        console.log(`  Use --reset to start fresh.\n`);
    }
}

main()
    .catch((err) => {
        console.error("\n❌ Fatal error:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
