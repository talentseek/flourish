/**
 * Category Lookup Helper
 *
 * Provides cached category resolution for enrichment scripts and migration.
 * Loads the full LDC 3-tier taxonomy from DB once, then resolves via in-memory maps.
 */

import { PrismaClient } from "@prisma/client";

interface CategoryNode {
    id: string;
    name: string;
    tier: number;
    parentCategoryId: string | null;
}

let categoryCache: CategoryNode[] | null = null;
let nameToId: Map<string, string> | null = null;
let nameToNode: Map<string, CategoryNode> | null = null;

// Aliases: maps common variant strings → canonical category name
const CATEGORY_ALIASES: Record<string, string> = {
    // Tier 2 aliases
    "Fashion & Clothing": "Clothing & Footwear",
    "Fashion": "Clothing & Footwear",
    "Fashion & Apparel": "Clothing & Footwear",
    "Electronics & Technology": "Electrical & Technology",
    "Electronics": "Electrical & Technology",
    "Entertainment": "Leisure & Entertainment",
    "Homeware & Lifestyle": "Home & Garden",
    "Home & Lifestyle": "Home & Garden",
    "Jewellery & Accessories": "Jewellery & Watches",
    "Food & Drink": "Cafes & Restaurants",
    "Food & Beverage": "Cafes & Restaurants",
    "Sports & Outdoors": "Leisure & Entertainment",

    // Tier 3 aliases (subcategory-level strings used as category)
    "Restaurant": "Restaurant",
    "Coffee Shop": "Coffee Shop",
    "Bakery": "Bakery",
    "Fast Food": "Fast Food",
    "Womenswear": "Womenswear",
    "Menswear": "Menswear",
    "Footwear": "Footwear",
    "Sportswear": "Sportswear",
    "Jewellery": "Jewellery",
    "Fragrance": "Fragrance",
    "Cosmetics": "Cosmetics",
    "Optician": "Optician",
    "Pharmacy": "Pharmacy",
    "Supermarket": "Supermarket",
    "Fast Fashion": "Fast Fashion",
    "Leisure": "Leisure & Entertainment",
    "Department Store": "Department Store",
    "Department Stores": "Department Stores",
    "Discount Store": "Discount Store",
    "Uncategorized": "Other",
    "Other": "Other",
};

async function loadCache(prisma: PrismaClient): Promise<void> {
    if (categoryCache) return;

    const categories = await prisma.category.findMany({
        select: { id: true, name: true, tier: true, parentCategoryId: true },
    });

    categoryCache = categories;
    nameToId = new Map(categories.map((c) => [c.name, c.id]));
    nameToNode = new Map(categories.map((c) => [c.name, c]));
}

/**
 * Resolve a category + subcategory pair to a canonical categoryId.
 *
 * Strategy:
 * 1. If subcategory matches a T3 name → return T3 id
 * 2. If category matches a T2 name (or alias) → return T2 id
 * 3. If category matches a T3 name (old-style scripts) → return T3 id
 * 4. Return null (unmatched)
 */
export async function getCategoryId(
    prisma: PrismaClient,
    category: string,
    subcategory?: string | null
): Promise<string | null> {
    await loadCache(prisma);

    // 1. Try subcategory as T3
    if (subcategory) {
        const t3Id = nameToId!.get(subcategory);
        if (t3Id) return t3Id;
    }

    // 2. Try category as canonical name
    const directId = nameToId!.get(category);
    if (directId) return directId;

    // 3. Try alias resolution
    const aliasName = CATEGORY_ALIASES[category];
    if (aliasName) {
        const aliasId = nameToId!.get(aliasName);
        if (aliasId) return aliasId;
    }

    return null;
}

/**
 * Get the Tier 2 (Category) name for a tenant, given its categoryId.
 * Walks up the hierarchy from T3 → T2.
 */
export async function getTier2Name(
    prisma: PrismaClient,
    categoryId: string
): Promise<string | null> {
    await loadCache(prisma);

    const node = Array.from(nameToNode!.values()).find((c) => c.id === categoryId);
    if (!node) return null;

    if (node.tier === 2) return node.name;
    if (node.tier === 3 && node.parentCategoryId) {
        const parent = Array.from(nameToNode!.values()).find(
            (c) => c.id === node.parentCategoryId
        );
        return parent?.name ?? null;
    }

    return null;
}

/**
 * Get the Tier 1 (Sector) name for a tenant, given its categoryId.
 * Walks up the hierarchy from T3 → T2 → T1.
 */
export async function getTier1Name(
    prisma: PrismaClient,
    categoryId: string
): Promise<string | null> {
    await loadCache(prisma);

    let node = Array.from(nameToNode!.values()).find((c) => c.id === categoryId);
    if (!node) return null;

    // Walk up to T1
    while (node && node.tier > 1 && node.parentCategoryId) {
        node = Array.from(nameToNode!.values()).find(
            (c) => c.id === node!.parentCategoryId
        );
    }

    return node?.tier === 1 ? node.name : null;
}

/**
 * Clear the in-memory cache (useful for tests or long-running scripts
 * that modify categories mid-run).
 */
export function clearCategoryCache(): void {
    categoryCache = null;
    nameToId = null;
    nameToNode = null;
}
