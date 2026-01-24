
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(" repairing Batch 19 Damage...");

    // 1. Revert Eastgate Ipswich
    // ID: cmicxw4dl000g13hx18q88n63
    await prisma.location.update({
        where: { id: 'cmicxw4dl000g13hx18q88n63' },
        data: {
            name: 'Eastgate Shopping Centre',
            city: 'Ipswich',
            postcode: 'IP4 1HA',
            // Revert basic stats (approximation from Batch 12)
            totalFloorArea: 200000,
            numberOfStores: 40,
            parkingSpaces: 400
        }
    });
    console.log("✅ Reverted Eastgate Ipswich.");

    // 2. Revert Icon Outlet
    // ID: cmid0jnub00fpmtpuvwl5o66k
    await prisma.location.update({
        where: { id: 'cmid0jnub00fpmtpuvwl5o66k' },
        data: {
            name: 'Icon Outlet at The O2',
            city: 'London',
            postcode: 'SE10 0DX',
            totalFloorArea: 400000,
            numberOfStores: 60,
            parkingSpaces: 2000
        }
    });
    console.log("✅ Reverted Icon Outlet.");

    // 3. Revert Stockport Exchange
    // ID: cmid0ki7001bcmtpuomwmx6v7
    await prisma.location.update({
        where: { id: 'cmid0ki7001bcmtpuomwmx6v7' },
        data: {
            name: 'Stockport Exchange',
            city: 'Stockport',
            postcode: 'SK1 3TA',
            totalFloorArea: 150000,
            numberOfStores: 20
        }
    });
    console.log("✅ Reverted Stockport Exchange.");

    // 4. Revert White Lion Walk (Guildford)
    // ID: cmid0l71h020tmtpukpy9iqok
    await prisma.location.update({
        where: { id: 'cmid0l71h020tmtpukpy9iqok' },
        data: {
            name: 'White Lion Walk',
            city: 'Guildford',
            postcode: 'GU1 3DN',
            totalFloorArea: 100000,
            numberOfStores: 25
        }
    });
    console.log("✅ Reverted White Lion Walk.");

    // 5. Revert Broadway Bexleyheath (Overwritten by Bradford)
    // ID: cmid0kqn101jzmtpuf45o33vk
    await prisma.location.update({
        where: { id: 'cmid0kqn101jzmtpuf45o33vk' },
        data: {
            name: 'Broadway Shopping Centre',
            city: 'Bexleyheath',
            postcode: 'DA6 7JN',
            totalFloorArea: 500000,
            numberOfStores: 60,
            parkingSpaces: 1200
        }
    });
    console.log("✅ Reverted Broadway Bexleyheath.");

    // 6. Create the Missing Giants (Fresh)
    // Basildon, Wood Green, Ilford, Colchester, Bradford
    const newGiants = [
        { name: "Eastgate Shopping Centre", city: "Basildon", postcode: "SS14 1EB", stores: 100, area: 750000, park: 1800 },
        { name: "The Mall Wood Green", city: "London (Wood Green)", postcode: "N22 6YQ", stores: 100, area: 540000, park: 1200 },
        { name: "Exchange Ilford", city: "Ilford", postcode: "IG1 1RS", stores: 80, area: 300000, park: 1000 },
        { name: "Lion Walk Shopping Centre", city: "Colchester", postcode: "CO1 1DX", stores: 40, area: 200000, park: 0 },
        { name: "The Broadway", city: "Bradford", postcode: "BD1 1US", stores: 90, area: 570000, park: 1300 },
        // Add Vicar Lane Chesterfield ? No, that one worked?
        // Check finding log: "Enriching Vicar Lane... Found ID: cmid0l5zp01zsmtpu8hplkg1a (Vicar Lane Shopping Centre) -> Updated."
        // That seems correct.
    ];

    for (const g of newGiants) {
        // Create fresh
        await prisma.location.create({
            data: {
                name: g.name,
                city: g.city,
                postcode: g.postcode,
                totalFloorArea: g.area,
                numberOfStores: g.stores,
                parkingSpaces: g.park,
                county: g.city,
                type: "SHOPPING_CENTRE",
                isManaged: false,
                address: "Seeded Market Data (Batch 19 Repair)",
                latitude: 0.0,
                longitude: 0.0
            }
        });
        console.log(`✅ Created Fresh: ${g.name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
