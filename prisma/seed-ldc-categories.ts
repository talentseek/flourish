/**
 * LDC-Inspired 3-Tier Category Taxonomy Seed
 *
 * Seeds the `categories` table with a canonical 3-tier hierarchy:
 *   Tier 1 (Sector)      → Retail, Leisure, Food & Beverage, Service, Vacant
 *   Tier 2 (Category)    → Clothing & Footwear, Health & Beauty, etc.
 *   Tier 3 (Subcategory) → Womenswear, Coffee Shop, Pharmacy, etc.
 *
 * Run: npx tsx prisma/seed-ldc-categories.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Taxonomy Definition ───────────────────────────────────────
// Structure: { tier1: { tier2: [tier3, tier3, ...] } }

const TAXONOMY: Record<string, Record<string, string[]>> = {
    // ═══════════════════════════════════════════════════════════
    // TIER 1: RETAIL
    // ═══════════════════════════════════════════════════════════
    Retail: {
        "Clothing & Footwear": [
            "Womenswear",
            "Menswear",
            "Childrenswear",
            "Fast Fashion",
            "Designer",
            "Premium",
            "Contemporary",
            "Casual",
            "Streetwear",
            "Sportswear",
            "Activewear",
            "Outdoor",
            "Lingerie",
            "Loungewear",
            "Footwear",
            "Trainers",
            "Occasion Wear",
            "Plus Size",
            "Denim",
            "Accessories",
            "Bags & Accessories",
            "Outlet",
            "Value",
            "Surf & Outdoor",
            "Snow Sports",
            "Concept Store",
            "Country",
            "Mid-Range",
            "Leather Goods",
            "Luggage",
            "Cycling",
            "Premium Menswear",
        ],
        "Health & Beauty": [
            "Pharmacy",
            "Cosmetics",
            "Premium Cosmetics",
            "Fragrance",
            "Skincare",
            "Optician",
            "Eyewear",
            "Beauty Salon",
            "Hair Salon",
            "Nail Salon",
            "Barber",
            "Spa",
            "Health Food Store",
            "Bath & Body",
            "Body Care",
            "Hair Care",
            "Aesthetics",
            "Wellness",
            "Dental",
            "K-Beauty",
        ],
        "Food & Grocery": [
            "Supermarket",
            "Convenience Store",
            "Butcher",
            "Deli",
            "Farm Shop",
            "Confectionery",
            "Chocolate Shop",
            "Chocolatier",
            "Sweet Shop",
            "Bubble Tea",
        ],
        "General Retail": [
            "Discount Store",
            "Variety Store",
            "Vape Shop",
            "Specialist",
        ],
        "Department Stores": [
            "Department Store",
        ],
        "Gifts & Stationery": [
            "Cards & Gifts",
            "Books & Stationery",
            "Books",
            "Stationery",
            "Souvenirs",
            "Music Merchandise",
            "Gifts",
            "Gifts & Homeware",
            "Gadgets & Gifts",
            "Art",
            "Art Gallery",
            "Art & Jewellery",
            "Pottery",
        ],
        "Jewellery & Watches": [
            "Jewellery",
            "Fashion Jewellery",
            "Crystal Jewellery",
            "Watches",
            "Luxury Watches",
            "Watch Repair",
        ],
        "Electrical & Technology": [
            "Consumer Electronics",
            "Mobile Network",
            "Mobile Repair",
            "Mobile Accessories",
            "Mobile",
            "Telecoms",
            "Phone Repairs",
            "Entertainment Retail",
            "Second Hand Electronics",
            "Home Appliances",
        ],
        "Home & Garden": [
            "Homeware",
            "Kitchenware",
            "Kitchen & Home",
            "Furniture",
            "Bedding",
            "Home Fragrance",
            "Home & Lifestyle",
            "Lifestyle",
        ],
        "Kids & Toys": [
            "Toy Store",
            "Toys",
            "Kidswear",
        ],
    },

    // ═══════════════════════════════════════════════════════════
    // TIER 1: FOOD & BEVERAGE
    // ═══════════════════════════════════════════════════════════
    "Food & Beverage": {
        "Cafes & Restaurants": [
            "Coffee Shop",
            "Cafe",
            "Tea Shop",
            "Restaurant",
            "Fast Food",
            "Fast Casual",
            "Premium Casual",
            "Casual",
            "Bakery",
            "Sandwich Shop",
            "Dessert",
            "Dessert Shop",
            "Milkshake Bar",
            "Food Hall",
            "Takeaway",
            "Pub",
            "Bar",
            "Restaurant Bar",
        ],
    },

    // ═══════════════════════════════════════════════════════════
    // TIER 1: LEISURE
    // ═══════════════════════════════════════════════════════════
    Leisure: {
        "Leisure & Entertainment": [
            "Cinema",
            "Gym",
            "Bowling",
            "Mini Golf",
            "Escape Room",
            "Trampoline Park",
            "Indoor Skiing",
            "Climbing",
            "Virtual Reality",
            "Arcade",
            "Amusements",
            "Casino",
            "Social Gaming",
            "Adventure",
            "Collectibles",
            "Sport Merchandise",
            "Sports Retailer",
        ],
    },

    // ═══════════════════════════════════════════════════════════
    // TIER 1: SERVICE
    // ═══════════════════════════════════════════════════════════
    Service: {
        Services: [
            "Travel Agency",
            "Post Office",
            "Photo Printing",
            "Shoe Repair",
            "Dry Cleaning",
            "Launderette",
            "Alterations",
            "Newsagent",
            "Betting",
            "Parcel Collection",
            "Parcel Locker",
            "Trade Supplies",
            "Car Wash",
            "Employment Services",
            "Education",
            "Community",
            "Community Hub",
        ],
        "Financial Services": [
            "Bank",
            "Building Society",
            "Currency Exchange",
            "Pawnbroker",
        ],
        "Charity & Second Hand": [
            "Charity Shop",
            "Charity",
        ],
    },

    // ═══════════════════════════════════════════════════════════
    // TIER 1: VACANT
    // ═══════════════════════════════════════════════════════════
    Vacant: {
        Vacant: [
            "Vacant Unit",
            "Under Refurbishment",
            "Coming Soon",
        ],
    },
};

// ─── Seed Function ─────────────────────────────────────────────

async function seedCategories() {
    console.log("═══════════════════════════════════════════════");
    console.log("  LDC 3-Tier Category Taxonomy Seed");
    console.log("═══════════════════════════════════════════════\n");

    let t1Count = 0;
    let t2Count = 0;
    let t3Count = 0;

    for (const [tier1Name, tier2Map] of Object.entries(TAXONOMY)) {
        // Upsert Tier 1 (Sector)
        const t1 = await prisma.category.upsert({
            where: { name: tier1Name },
            update: { tier: 1, parentCategoryId: null, description: `Sector: ${tier1Name}` },
            create: {
                name: tier1Name,
                tier: 1,
                description: `Sector: ${tier1Name}`,
                parentCategoryId: null,
            },
        });
        t1Count++;
        console.log(`\n📂 T1: ${tier1Name} (${t1.id})`);

        for (const [tier2Name, tier3List] of Object.entries(tier2Map)) {
            // Upsert Tier 2 (Category)
            const t2 = await prisma.category.upsert({
                where: { name: tier2Name },
                update: { tier: 2, parentCategoryId: t1.id, description: `Category under ${tier1Name}` },
                create: {
                    name: tier2Name,
                    tier: 2,
                    description: `Category under ${tier1Name}`,
                    parentCategoryId: t1.id,
                },
            });
            t2Count++;
            console.log(`  📁 T2: ${tier2Name} (${t2.id})`);

            for (const tier3Name of tier3List) {
                // Upsert Tier 3 (Subcategory)
                await prisma.category.upsert({
                    where: { name: tier3Name },
                    update: { tier: 3, parentCategoryId: t2.id },
                    create: {
                        name: tier3Name,
                        tier: 3,
                        description: `${tier3Name} under ${tier2Name}`,
                        parentCategoryId: t2.id,
                    },
                });
                t3Count++;
            }
            console.log(`     └─ ${tier3List.length} subcategories`);
        }
    }

    const total = t1Count + t2Count + t3Count;
    console.log("\n═══════════════════════════════════════════════");
    console.log(`  ✅ Seeded ${total} categories`);
    console.log(`     T1 (Sectors):       ${t1Count}`);
    console.log(`     T2 (Categories):    ${t2Count}`);
    console.log(`     T3 (Subcategories): ${t3Count}`);
    console.log("═══════════════════════════════════════════════\n");
}

// ─── Main ──────────────────────────────────────────────────────

seedCategories()
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
