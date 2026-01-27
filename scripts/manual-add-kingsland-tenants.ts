
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LOCATION_ID = "cmicxw4gi000m13hx9mghuxqm";

const TENANTS = [
    { name: "Morrisons", category: "Supermarket", isAnchor: true },
    { name: "Age UK", category: "Charity Shop", isAnchor: false },
    { name: "Leightons Opticians", category: "Health & Optical", isAnchor: false },
    { name: "House of Cards", category: "Cards & Gifts", isAnchor: false },
    { name: "Paggies Bar & Restaurant", category: "Bar & Restaurant", isAnchor: false }, // Fixed spelling 'Restuarant'
    { name: "Waitrose", category: "Supermarket", isAnchor: true },
    { name: "Costa", category: "Coffee Shop", isAnchor: false },
    { name: "Phone Surgery", category: "Mobile & Tech Services", isAnchor: false },
    { name: "Thatcham Nails and Beauty", category: "Health & Beauty", isAnchor: false },
    { name: "Baron Vapes Thatcham", category: "Vape Shop", isAnchor: false },
    { name: "Kingsland Café", category: "Café", isAnchor: false },
    { name: "InPost", category: "Services / Lockers", isAnchor: false },
    { name: "Papadam Takeaway", category: "Takeaway", isAnchor: false },
    { name: "Baker", category: "Bakery", isAnchor: false }, // Assumed generic name
    { name: "Scope", category: "Charity Shop", isAnchor: false }
];

async function main() {
    console.log("📝 Adding 15 Tenants to Kingsland Centre...");

    for (const t of TENANTS) {
        await prisma.tenant.upsert({
            where: {
                locationId_name: {
                    locationId: LOCATION_ID,
                    name: t.name
                }
            },
            update: {
                category: t.category,
                isAnchorTenant: t.isAnchor
            },
            create: {
                locationId: LOCATION_ID,
                name: t.name,
                category: t.category,
                isAnchorTenant: t.isAnchor
            }
        });
        console.log(`   ✅ Upserted: ${t.name} (${t.category})`);
    }

    // Update store count on location
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: { numberOfStores: TENANTS.length }
    });

    console.log("\n🎉 Done! Updated location store count to " + TENANTS.length);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
