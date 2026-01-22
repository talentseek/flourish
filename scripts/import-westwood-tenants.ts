import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tenants = [
    // RETAIL STORES
    { name: '3 Store', category: 'Mobile & Electronics', subcategory: 'Mobile Phones' },
    { name: 'All Sorts of Sweets and Treats', category: 'Food & Beverage', subcategory: 'Confectionery' },
    { name: 'Boots', category: 'Health & Beauty', subcategory: 'Pharmacy', isAnchorTenant: true },
    { name: 'Boots Opticians', category: 'Health & Beauty', subcategory: 'Opticians' },
    { name: 'Brows', category: 'Health & Beauty', subcategory: 'Beauty Services' },
    { name: 'Clintons', category: 'Cards & Gifts', subcategory: 'Cards' },
    { name: 'Deichmann', category: 'Fashion & Clothing', subcategory: 'Footwear' },
    { name: 'EE', category: 'Mobile & Electronics', subcategory: 'Mobile Phones' },
    { name: 'Evapo', category: 'Health & Beauty', subcategory: 'Vaping' },
    { name: 'Footasylum', category: 'Fashion & Clothing', subcategory: 'Sportswear' },
    { name: 'Guildcrest Estates', category: 'Services', subcategory: 'Estate Agents' },
    { name: 'H Samuel', category: 'Jewellery & Watches', subcategory: 'Jewellery' },
    { name: 'Holland & Barrett', category: 'Health & Beauty', subcategory: 'Health Food' },
    { name: 'Hotel Chocolat', category: 'Food & Beverage', subcategory: 'Chocolatier' },
    { name: 'HSBC', category: 'Services', subcategory: 'Banking' },
    { name: 'iConnect', category: 'Mobile & Electronics', subcategory: 'Phone Repairs' },
    { name: 'Instant Printing', category: 'Services', subcategory: 'Printing' },
    { name: 'JD Sports', category: 'Fashion & Clothing', subcategory: 'Sportswear', isAnchorTenant: true },
    { name: 'Just Fitness by Bannatyne', category: 'Leisure', subcategory: 'Gym' },
    { name: 'Lovisa', category: 'Jewellery & Watches', subcategory: 'Fashion Jewellery' },
    { name: 'Mamas & Papas', category: 'Home & Living', subcategory: 'Baby & Nursery' },
    { name: 'Marks & Spencer', category: 'Department Store', subcategory: 'Department Store', isAnchorTenant: true },
    { name: 'Mountain Warehouse', category: 'Fashion & Clothing', subcategory: 'Outdoor Wear' },
    { name: 'New Look', category: 'Fashion & Clothing', subcategory: 'Womenswear' },
    { name: 'Next', category: 'Fashion & Clothing', subcategory: 'Mixed Fashion', isAnchorTenant: true },
    { name: 'O2', category: 'Mobile & Electronics', subcategory: 'Mobile Phones' },
    { name: 'Pandora', category: 'Jewellery & Watches', subcategory: 'Jewellery' },
    { name: 'Primark', category: 'Fashion & Clothing', subcategory: 'Value Fashion', isAnchorTenant: true },
    { name: 'Rituals', category: 'Health & Beauty', subcategory: 'Cosmetics' },
    { name: 'River Island', category: 'Fashion & Clothing', subcategory: 'Mixed Fashion' },
    { name: 'Skechers', category: 'Fashion & Clothing', subcategory: 'Footwear' },
    { name: 'Superdrug', category: 'Health & Beauty', subcategory: 'Pharmacy' },
    { name: 'The Perfume Shop', category: 'Health & Beauty', subcategory: 'Fragrances' },
    { name: 'The Works', category: 'Books & Stationery', subcategory: 'Books & Gifts' },
    { name: 'TK Maxx & Homesense', category: 'Department Store', subcategory: 'Discount Store', isAnchorTenant: true },
    { name: 'Travelodge', category: 'Services', subcategory: 'Hotel' },
    { name: 'Vision Express', category: 'Health & Beauty', subcategory: 'Opticians' },
    { name: 'Warren James', category: 'Jewellery & Watches', subcategory: 'Jewellery' },
    { name: 'Waterstones', category: 'Books & Stationery', subcategory: 'Books' },
    { name: 'We Buy Any Car', category: 'Services', subcategory: 'Automotive' },
    { name: 'WHSmith', category: 'Books & Stationery', subcategory: 'Newsagent' },
    { name: 'Worth Its Weight', category: 'Services', subcategory: 'Second Hand' },
    { name: 'Yours', category: 'Fashion & Clothing', subcategory: 'Plus Size Fashion' },

    // FOOD & DRINK
    { name: 'Ask Italian', category: 'Food & Drink', subcategory: 'Restaurant - Italian' },
    { name: 'Caffè Nero', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: "Captain D's", category: 'Food & Drink', subcategory: 'Restaurant - Seafood' },
    { name: 'Coffee Corner', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'Costa Coffee', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: "Frankie & Benny's", category: 'Food & Drink', subcategory: 'Restaurant - American' },
    { name: 'Greggs', category: 'Food & Drink', subcategory: 'Bakery' },
    { name: "McDonald's", category: 'Food & Drink', subcategory: 'Fast Food' },
    { name: "Nando's", category: 'Food & Drink', subcategory: 'Restaurant - Casual' },
    { name: 'Riparo Lounge', category: 'Food & Drink', subcategory: 'Restaurant - Casual' },
    { name: 'Starbucks', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'Subway', category: 'Food & Drink', subcategory: 'Fast Food' },
    { name: 'Taco Bell', category: 'Food & Drink', subcategory: 'Fast Food' },
    { name: 'Thai Village', category: 'Food & Drink', subcategory: 'Restaurant - Thai' },

    // LEISURE
    { name: 'AirHop', category: 'Leisure', subcategory: 'Trampoline Park' },
    { name: 'Grosvenor Casino', category: 'Leisure', subcategory: 'Casino' },
    { name: 'Hollywood Bowl', category: 'Leisure', subcategory: 'Bowling' },
    { name: 'Mecca Bingo', category: 'Leisure', subcategory: 'Bingo' },
    { name: 'Vue Cinema', category: 'Leisure', subcategory: 'Cinema', isAnchorTenant: true },
];

async function main() {
    const location = await prisma.location.findFirst({
        where: { name: { contains: 'Westwood Cross' } }
    });

    if (!location) {
        console.log('❌ Location not found');
        return;
    }

    console.log('Found location:', location.name, '(ID:', location.id, ')');
    console.log('Importing', tenants.length, 'tenants...\n');

    // Delete existing tenants for this location (if any)
    const deleted = await prisma.tenant.deleteMany({
        where: { locationId: location.id }
    });
    console.log('Cleared', deleted.count, 'existing tenants');

    // Create all new tenants
    let created = 0;
    for (const tenant of tenants) {
        await prisma.tenant.create({
            data: {
                name: tenant.name,
                category: tenant.category,
                subcategory: tenant.subcategory || null,
                isAnchorTenant: tenant.isAnchorTenant || false,
                locationId: location.id,
            }
        });
        created++;
        process.stdout.write(`\rCreated ${created}/${tenants.length} tenants`);
    }

    console.log('\n\n✅ Successfully imported', created, 'tenants for', location.name);

    // Summary by category
    console.log('\n=== CATEGORY BREAKDOWN ===');
    const categories: Record<string, number> = {};
    tenants.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });
    Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => console.log(`${cat}: ${count}`));

    const anchors = tenants.filter(t => t.isAnchorTenant);
    console.log('\n=== ANCHOR TENANTS ===');
    anchors.forEach(t => console.log(`- ${t.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
