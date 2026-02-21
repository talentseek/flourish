/**
 * Migrate Tenant Categories
 *
 * Backfills `categoryId` on all existing tenants by matching their
 * freetext `category` and `subcategory` strings to canonical LDC categories.
 *
 * Strategy:
 *   1. subcategory matches a T3 name → use T3 id
 *   2. category matches a T2 name or alias → use T2 id
 *   3. category matches a T3 name (old-style scripts) → use T3 id
 *   4. Unmatched → logged for manual review
 *
 * Usage:
 *   npx tsx scripts/migrate-tenant-categories.ts            # live run
 *   npx tsx scripts/migrate-tenant-categories.ts --dry-run   # preview only
 *
 * Run: npx tsx scripts/migrate-tenant-categories.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");

// ─── Alias Map ─────────────────────────────────────────────────
// Maps variant category strings → canonical Category.name
const CATEGORY_ALIASES: Record<string, string> = {
    // T2 aliases (category-level variants)
    "Fashion & Clothing": "Clothing & Footwear",
    "Fashion": "Clothing & Footwear",
    "Fashion & Apparel": "Clothing & Footwear",
    "Electronics & Technology": "Electrical & Technology",
    "Electronics": "Electrical & Technology",
    "Electronics & Phones": "Electrical & Technology",
    "Mobile & Electronics": "Electrical & Technology",
    "Mobile & Electronics / Mobile Phones": "Electrical & Technology",
    "Mobile & Tech Services": "Electrical & Technology",
    "Technology": "Electrical & Technology",
    "App/Technology": "Electrical & Technology",
    "Homeware & Lifestyle": "Home & Garden",
    "Home & Living": "Home & Garden",
    "Home & Living / Baby & Nursery": "Home & Garden",
    "Household Goods": "Home & Garden",
    "Jewellery & Accessories": "Jewellery & Watches",
    "Food & Drink": "Cafes & Restaurants",
    "Food & Beverage": "Cafes & Restaurants",
    "Sports & Outdoors": "Leisure & Entertainment",
    "Sports & Fitness": "Leisure & Entertainment",
    "Health & Fitness": "Leisure & Entertainment",
    "Sporting Goods": "Leisure & Entertainment",
    // Variant T2 names
    "Opticians": "Health & Beauty",
    "Health & Optical": "Health & Beauty",
    "Accessory": "Clothing & Footwear",
    "Gifts & Cards": "Gifts & Stationery",
    "Books, Arts & Crafts": "Gifts & Stationery",
    "Books, Stationery & News": "Gifts & Stationery",
    "Newsagents & Stationery": "Gifts & Stationery",
    "Art & Hobby": "Gifts & Stationery",
    "Art & Hobby / Art Supplies": "Gifts & Stationery",
    "Arts & Crafts": "Gifts & Stationery",
    "Arts & Crafts / Pottery Store": "Gifts & Stationery",
    "Arts & Crafts / Ceramics": "Gifts & Stationery",
    "Toys & Games": "Kids & Toys",
    "Café": "Cafes & Restaurants",
    "Dining": "Cafes & Restaurants",
    "Bar & Restaurant": "Cafes & Restaurants",
    "Groceries": "Food & Grocery",
    "Grocery Stores": "Food & Grocery",
    "Convenience Stores": "General Retail",
    "Pets": "General Retail",
    "Media": "General Retail",
    "Miscellaneous": "General Retail",
    "Other": "General Retail",
    "Uncategorized": "General Retail",
    // Composite / slash-style strings
    "Vintage & Antiques": "Charity & Second Hand",
    "Vintage & Antiques / Vintage Emporium": "Charity & Second Hand",
    "Vintage & Antiques / Vintage/Creative Store": "Charity & Second Hand",
    "Creative Hub": "Leisure & Entertainment",
    "Creative Hub / Independent Market": "Leisure & Entertainment",
    "Services / Lockers": "Services",
};

// ─── Main ──────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log(`  Tenant Category Migration ${DRY_RUN ? "(DRY RUN)" : "(LIVE)"}`);
    console.log("═══════════════════════════════════════════════\n");

    // Load all canonical categories
    const categories = await prisma.category.findMany({
        select: { id: true, name: true },
    });
    const nameToId = new Map(categories.map((c) => [c.name, c.id]));

    console.log(`📚 Loaded ${categories.length} canonical categories\n`);

    // Load all tenants
    const tenants = await prisma.tenant.findMany({
        select: {
            id: true,
            name: true,
            category: true,
            subcategory: true,
            categoryId: true,
            locationId: true,
        },
    });

    console.log(`🏪 Processing ${tenants.length} tenants...\n`);

    let matched = 0;
    let alreadySet = 0;
    let unmatched = 0;
    const unmatchedList: Array<{
        tenantId: string;
        tenantName: string;
        category: string;
        subcategory: string | null;
        locationId: string;
    }> = [];
    const matchStats = new Map<string, number>();

    for (const tenant of tenants) {
        // Skip if already has a categoryId
        if (tenant.categoryId) {
            alreadySet++;
            continue;
        }

        let resolvedId: string | null = null;
        let matchSource = "";

        // Strategy 1: subcategory matches T3 name directly
        if (tenant.subcategory) {
            const t3Id = nameToId.get(tenant.subcategory);
            if (t3Id) {
                resolvedId = t3Id;
                matchSource = `T3 subcategory: "${tenant.subcategory}"`;
            }
        }

        // Strategy 2: category matches an alias → canonical T2 name
        if (!resolvedId) {
            const aliasName = CATEGORY_ALIASES[tenant.category];
            if (aliasName) {
                const aliasId = nameToId.get(aliasName);
                if (aliasId) {
                    resolvedId = aliasId;
                    matchSource = `alias: "${tenant.category}" → "${aliasName}"`;
                }
            }
        }

        // Strategy 3: category matches a canonical name directly
        if (!resolvedId) {
            const directId = nameToId.get(tenant.category);
            if (directId) {
                resolvedId = directId;
                matchSource = `direct: "${tenant.category}"`;
            }
        }

        // Strategy 4: category string is actually a T3 name (old scripts)
        // (This is a fallback — if category matched as T2 above, it won't reach here)
        if (!resolvedId) {
            // Already covered by Strategy 3 since both T2 and T3 are in nameToId
        }

        if (resolvedId) {
            matched++;
            matchStats.set(matchSource, (matchStats.get(matchSource) || 0) + 1);

            if (!DRY_RUN) {
                await prisma.tenant.update({
                    where: { id: tenant.id },
                    data: { categoryId: resolvedId },
                });
            }
        } else {
            unmatched++;
            unmatchedList.push({
                tenantId: tenant.id,
                tenantName: tenant.name,
                category: tenant.category,
                subcategory: tenant.subcategory,
                locationId: tenant.locationId,
            });
        }
    }

    // ─── Report ────────────────────────────────────────────────

    const total = tenants.length;
    const matchRate = total > 0 ? ((matched / (total - alreadySet)) * 100).toFixed(1) : "0";

    console.log("═══════════════════════════════════════════════");
    console.log("  Results");
    console.log("═══════════════════════════════════════════════");
    console.log(`  Total tenants:     ${total}`);
    console.log(`  Already had ID:    ${alreadySet}`);
    console.log(`  Matched:           ${matched} (${matchRate}%)`);
    console.log(`  Unmatched:         ${unmatched}`);
    console.log("═══════════════════════════════════════════════\n");

    // Match breakdown
    if (matchStats.size > 0) {
        console.log("📊 Match Breakdown:");
        const sorted = [...matchStats.entries()].sort((a, b) => b[1] - a[1]);
        for (const [source, count] of sorted) {
            console.log(`  ${count.toString().padStart(4)} × ${source}`);
        }
        console.log();
    }

    // Unmatched details
    if (unmatchedList.length > 0) {
        console.log("⚠️  Unmatched Tenants:");

        // Group by category string
        const byCategory = new Map<string, typeof unmatchedList>();
        for (const item of unmatchedList) {
            const key = item.subcategory
                ? `${item.category} / ${item.subcategory}`
                : item.category;
            if (!byCategory.has(key)) byCategory.set(key, []);
            byCategory.get(key)!.push(item);
        }

        const sortedUnmatched = [...byCategory.entries()].sort(
            (a, b) => b[1].length - a[1].length
        );
        for (const [catKey, items] of sortedUnmatched) {
            console.log(`\n  "${catKey}" (${items.length} tenants):`);
            for (const item of items.slice(0, 3)) {
                console.log(`    - ${item.tenantName}`);
            }
            if (items.length > 3) {
                console.log(`    ... and ${items.length - 3} more`);
            }
        }
        console.log();
    }

    if (DRY_RUN) {
        console.log("ℹ️  This was a DRY RUN. No changes were made.");
        console.log("   Run without --dry-run to apply changes.\n");
    } else {
        console.log("✅ Migration complete!\n");
    }
}

main()
    .catch((err) => {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
