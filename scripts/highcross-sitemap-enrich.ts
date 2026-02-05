import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const locationId = "cmid0kv0r01obmtpuinuwnn2n";

// Simplified mapping of sitemap slugs to CACI-style categories
const tenantMap = [
    { name: "Jeans and Jeans", cat: "Fashion & Apparel" },
    { name: "Wingstop", cat: "Food & Beverage" },
    { name: "Superdrug", cat: "Health & Beauty" },
    { name: "Nomination", cat: "Jewellery & Accessories" },
    { name: "Sell Your Car 2 Jack", cat: "Services" },
    { name: "Raykdi", cat: "Fashion & Apparel" },
    { name: "Love Churros", cat: "Food & Beverage" },
    { name: "Austen & Blake", cat: "Jewellery & Accessories" },
    { name: "Mamas & Papas", cat: "Kids & Toys" },
    { name: "Bill's", cat: "Food & Beverage" },
    { name: "Heart of England", cat: "Services" },
    { name: "Set", cat: "Gifts & Cards" },
    { name: "Cochani", cat: "Fashion & Apparel" },
    { name: "Space NK", cat: "Health & Beauty" },
    { name: "Maki Ramen", cat: "Food & Beverage" },
    { name: "Mango", cat: "Fashion & Apparel" },
    { name: "Baggage World", cat: "Fashion & Apparel" },
    { name: "Castore", cat: "Sports & Outdoors" },
    { name: "Sunglass Hut", cat: "Jewellery & Accessories" },
    { name: "Mobilise", cat: "Services" },
    { name: "Card Factory", cat: "Gifts & Cards" },
    { name: "Swarovski", cat: "Jewellery & Accessories" },
    { name: "The Works", cat: "Books, Stationery & News" },
    { name: "Luke 1977", cat: "Fashion & Apparel" },
    { name: "Tamatanga", cat: "Food & Beverage" },
    { name: "Ernest Jones", cat: "Jewellery & Accessories" },
    { name: "Ann Summers", cat: "Fashion & Apparel" },
    { name: "Breitling", cat: "Jewellery & Accessories" },
    { name: "Hugo Boss", cat: "Fashion & Apparel" },
    { name: "Typo", cat: "Gifts & Cards" },
    { name: "Hotel Chocolat", cat: "Food & Beverage" },
    { name: "Suit Direct", cat: "Fashion & Apparel" },
    { name: "Menkind", cat: "Gifts & Cards" },
    { name: "Bubbleology", cat: "Food & Beverage" },
    { name: "Better Brows", cat: "Health & Beauty" },
    { name: "Jo Malone London", cat: "Health & Beauty" },
    { name: "Reiss", cat: "Fashion & Apparel" },
    { name: "Warren James", cat: "Jewellery & Accessories" },
    { name: "The Perfume Shop", cat: "Health & Beauty" },
    { name: "The Gym", cat: "Leisure" },
    { name: "Starbucks", cat: "Food & Beverage" },
    { name: "Pizza Express", cat: "Food & Beverage" },
    { name: "Pho", cat: "Food & Beverage" },
    { name: "Next", cat: "Fashion & Apparel", anchor: true },
    { name: "New Look", cat: "Fashion & Apparel" },
    { name: "Nando's", cat: "Food & Beverage" },
    { name: "McDonald's", cat: "Food & Beverage" },
    { name: "JD Sports", cat: "Sports & Outdoors" },
    { name: "Boost", cat: "Food & Beverage" },
    { name: "Treetop Adventure Golf", cat: "Leisure" },
    { name: "Damaged Society", cat: "Fashion & Apparel" },
    { name: "Lovisa", cat: "Jewellery & Accessories" },
    { name: "Turtle Bay", cat: "Food & Beverage" },
    { name: "Frankie & Benny's", cat: "Food & Beverage" },
    { name: "Soho Coffee", cat: "Food & Beverage" },
    { name: "Yankee Candle", cat: "Gifts & Cards" },
    { name: "Slim Chickens", cat: "Food & Beverage" },
    { name: "Yo! Sushi", cat: "Food & Beverage" },
    { name: "Eurochange", cat: "Financial Services" },
    { name: "The Body Shop", cat: "Health & Beauty" },
    { name: "River Island", cat: "Fashion & Apparel" },
    { name: "Levi's", cat: "Fashion & Apparel" },
    { name: "John Lewis & Partners", cat: "Department Store", anchor: true },
    { name: "Apple", cat: "Electronics & Technology", anchor: true },
    { name: "Zara", cat: "Fashion & Apparel", anchor: true },
    { name: "H&M", cat: "Fashion & Apparel", anchor: true },
    { name: "Primark", cat: "Fashion & Apparel", anchor: true },
    { name: "Showcase Cinema de Lux", cat: "Leisure", anchor: true },
    { name: "Boots", cat: "Health & Beauty", anchor: true }
];

async function main() {
    console.log(`🚀 Enriching Highcross with ${tenantMap.length} verified CACI-mapped tenants...`);

    for (const tenant of tenantMap) {
        await prisma.tenant.create({
            data: {
                locationId: locationId,
                name: tenant.name,
                category: tenant.cat,
                isAnchorTenant: tenant.anchor || false
            }
        });
    }

    console.log("✅ Highcross Tenant Enrichment Complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
