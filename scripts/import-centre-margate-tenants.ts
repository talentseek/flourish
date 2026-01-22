import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tenants = [
    // National Anchors
    { name: 'Boots', category: 'Health & Beauty', subcategory: 'Pharmacy', isAnchorTenant: true },
    { name: 'Peacocks', category: 'Fashion & Clothing', subcategory: 'Value Fashion', isAnchorTenant: true },
    { name: 'Poundland', category: 'Discount Store', subcategory: 'Variety Store', isAnchorTenant: true },
    { name: 'Card Factory', category: 'Cards & Gifts', subcategory: 'Cards', isAnchorTenant: true },
    { name: 'The Works', category: 'Books & Stationery', subcategory: 'Books & Gifts' },
    { name: 'Subway', category: 'Food & Drink', subcategory: 'Fast Food' },

    // Independent Traders
    { name: 'UpMargate', category: 'Creative Hub', subcategory: 'Independent Market', isAnchorTenant: true },
    { name: 'Elsewhere', category: 'Entertainment', subcategory: 'Music Venue & Record Store' },
    { name: 'Modern Provider', category: 'Food & Drink', subcategory: 'Bakery' },
    { name: 'Palms Pizzeria', category: 'Food & Drink', subcategory: 'Restaurant - Italian' },
    { name: 'Sunwax Records', category: 'Entertainment', subcategory: 'Record Store' },
    { name: 'Pie in the Sky', category: 'Vintage & Antiques', subcategory: 'Vintage Emporium' },
    { name: 'Ocean Nails', category: 'Health & Beauty', subcategory: 'Nail Salon' },
    { name: 'Mariachi', category: 'Food & Drink', subcategory: 'Bar - Cocktails' },
    { name: 'Crybaby Jazz Rooms', category: 'Entertainment', subcategory: 'Live Music Venue' },
    { name: "Kelly's Sweets & Treats", category: 'Food & Beverage', subcategory: 'Confectionery' },
    { name: 'Enchanted Treasures', category: 'Cards & Gifts', subcategory: 'Gift Shop' },
    { name: 'RG (Re-Generation)', category: 'Vintage & Antiques', subcategory: 'Vintage/Creative Store' },
    { name: "Penfold's H2O", category: 'Services', subcategory: 'Water Sports' },
    { name: 'Curve Coffee Store', category: 'Food & Drink', subcategory: 'Coffee Shop' },
    { name: 'Glitz & Gadgets', category: 'Health & Beauty', subcategory: 'Body Piercing Studio' },
    { name: 'Just 4 Kids', category: 'Fashion & Clothing', subcategory: 'Childrenswear' },
];

async function main() {
    const location = await prisma.location.findFirst({
        where: { name: { contains: 'Centre Margate' } }
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
