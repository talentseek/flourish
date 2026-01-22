import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tenants = [
    // Anchor Tenants / Department Stores
    { name: 'Fenwick', category: 'Department Store', subcategory: 'Luxury', isAnchorTenant: true },
    { name: 'Marks & Spencer', category: 'Department Store', subcategory: 'Mixed Retail', isAnchorTenant: true },
    { name: 'Primark', category: 'Fashion & Clothing', subcategory: 'Value Fashion', isAnchorTenant: true },
    { name: 'Next', category: 'Fashion & Clothing', subcategory: 'Fashion', isAnchorTenant: true },

    // Fashion & Clothing
    { name: 'H&M', category: 'Fashion & Clothing', subcategory: 'Fast Fashion' },
    { name: 'Zara', category: 'Fashion & Clothing', subcategory: 'Fast Fashion' },
    { name: 'River Island', category: 'Fashion & Clothing', subcategory: 'Fashion' },
    { name: 'Urban Outfitters', category: 'Fashion & Clothing', subcategory: 'Lifestyle Fashion' },
    { name: 'Crew Clothing Company', category: 'Fashion & Clothing', subcategory: 'British Lifestyle' },
    { name: 'Brook Taverner', category: 'Fashion & Clothing', subcategory: 'Menswear' },
    { name: 'Lucy & Yak', category: 'Fashion & Clothing', subcategory: 'Sustainable Fashion' },
    { name: 'Seasalt Cornwall', category: 'Fashion & Clothing', subcategory: 'Lifestyle Fashion' },
    { name: 'Moss', category: 'Fashion & Clothing', subcategory: 'Menswear' },
    { name: 'Select', category: 'Fashion & Clothing', subcategory: 'Womenswear' },
    { name: 'Ann Summers', category: 'Fashion & Clothing', subcategory: 'Lingerie' },

    // Sports & Footwear
    { name: 'JD Sports', category: 'Sports & Leisure', subcategory: 'Sportswear' },
    { name: 'Sports Direct', category: 'Sports & Leisure', subcategory: 'Sportswear' },
    { name: 'Clarks', category: 'Footwear', subcategory: 'Footwear' },
    { name: 'Skechers', category: 'Footwear', subcategory: 'Footwear' },

    // Health & Beauty
    { name: 'Boots', category: 'Health & Beauty', subcategory: 'Pharmacy' },
    { name: 'Space NK', category: 'Health & Beauty', subcategory: 'Premium Cosmetics' },
    { name: 'Therapie Clinic', category: 'Health & Beauty', subcategory: 'Aesthetics' },
    { name: 'Kesson Physiotherapy', category: 'Health & Beauty', subcategory: 'Physiotherapy' },

    // Jewellery & Accessories
    { name: 'Pandora', category: 'Jewellery & Accessories', subcategory: 'Jewellery' },
    { name: 'Swarovski', category: 'Jewellery & Accessories', subcategory: 'Crystal Jewellery' },
    { name: 'Goldsmiths', category: 'Jewellery & Accessories', subcategory: 'Luxury Watches' },
    { name: 'Rolex at Goldsmiths', category: 'Jewellery & Accessories', subcategory: 'Luxury Watches' },
    { name: 'H. Samuel', category: 'Jewellery & Accessories', subcategory: 'Jewellery' },
    { name: 'Lovisa', category: 'Jewellery & Accessories', subcategory: 'Fashion Jewellery' },
    { name: 'Sunglasses Hut', category: 'Jewellery & Accessories', subcategory: 'Eyewear' },

    // Homeware & Lifestyle
    { name: 'Oliver Bonas', category: 'Homeware & Lifestyle', subcategory: 'Gifts & Homeware' },
    { name: 'ProCook', category: 'Homeware & Lifestyle', subcategory: 'Kitchenware' },
    { name: 'The Cotswold Company', category: 'Homeware & Lifestyle', subcategory: 'Furniture' },
    { name: 'Flying Tiger Copenhagen', category: 'Homeware & Lifestyle', subcategory: 'Variety Store' },
    { name: 'Typo', category: 'Homeware & Lifestyle', subcategory: 'Stationery' },
    { name: 'Smiggle', category: 'Homeware & Lifestyle', subcategory: 'Stationery' },
    { name: 'Little Blue Finch', category: 'Homeware & Lifestyle', subcategory: 'Gifts' },

    // Art & Hobby
    { name: 'Cowling & Wilcox', category: 'Art & Hobby', subcategory: 'Art Supplies' },
    { name: 'Cycles UK', category: 'Sports & Leisure', subcategory: 'Cycling' },

    // Opticians
    { name: 'Specsavers', category: 'Health & Beauty', subcategory: 'Opticians' },
    { name: 'Closs & Hamblin', category: 'Health & Beauty', subcategory: 'Opticians' },

    // Telecoms
    { name: 'Three', category: 'Electronics & Telecoms', subcategory: 'Mobile Network' },

    // Services
    { name: 'Shoecare', category: 'Services', subcategory: 'Shoe Repair' },
    { name: 'The Car Wash Company', category: 'Services', subcategory: 'Car Wash' },

    // Banks
    { name: 'Halifax', category: 'Financial Services', subcategory: 'Bank' },
    { name: 'HSBC', category: 'Financial Services', subcategory: 'Bank' },
    { name: 'Metro Bank', category: 'Financial Services', subcategory: 'Bank' },

    // Grocery
    { name: 'Tesco Metro', category: 'Grocery', subcategory: 'Supermarket' },

    // Food & Drink - Cafés
    { name: 'Costa Coffee', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'Caffè Nero', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'Soho Coffee', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'Stag Coffee & Kitchen', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'M&S Café', category: 'Food & Drink', subcategory: 'Café' },

    // Food & Drink - Restaurants
    { name: "Bill's", category: 'Food & Drink', subcategory: 'Restaurant - British' },
    { name: 'The Eatery at Fenwick', category: 'Food & Drink', subcategory: 'Restaurant' },
    { name: 'Real Eating Company', category: 'Food & Drink', subcategory: 'Restaurant - Brunch' },

    // Food & Drink - Fast Food
    { name: 'Burger King', category: 'Food & Drink', subcategory: 'Fast Food' },
    { name: 'KFC', category: 'Food & Drink', subcategory: 'Fast Food' },
    { name: "McDonald's", category: 'Food & Drink', subcategory: 'Fast Food' },
    { name: 'Greggs', category: 'Food & Drink', subcategory: 'Bakery' },
    { name: 'Chopstix', category: 'Food & Drink', subcategory: 'Fast Food - Asian' },
    { name: 'German Doner Kebab', category: 'Food & Drink', subcategory: 'Fast Food' },

    // Food & Drink - Sweet Treats
    { name: 'Canterbury Bakery', category: 'Food & Drink', subcategory: 'Bakery' },
    { name: 'Love Brownies', category: 'Food & Drink', subcategory: 'Desserts' },
];

async function main() {
    const locationId = 'cmid0l76u020ymtpuixnytlvp';

    console.log('Importing', tenants.length, 'tenants for Whitefriars Canterbury...\n');

    // Delete existing tenants
    const deleted = await prisma.tenant.deleteMany({
        where: { locationId }
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
                locationId,
            }
        });
        created++;
        process.stdout.write(`\rCreated ${created}/${tenants.length} tenants`);
    }

    console.log('\n\n✅ Successfully imported', created, 'tenants for Whitefriars Canterbury');

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
