
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch 7
    { name: "Knightswood Shopping Centre", floorArea: 65063, stores: 26 },
    { name: "New Kirkgate", floorArea: 93867, stores: 17 },
    { name: "Cornmill Centre", floorArea: 243000, stores: 40 },
    { name: "The Pavilion", city: "Thornaby", floorArea: 315000, stores: 38 },
    { name: "Arc Shopping Centre", floorArea: 265000, stores: 36 },
    { name: "Swanley Shopping Centre", floorArea: 47000, stores: 20 }, // Est stores
    { name: "Fosse Park", floorArea: 580000, stores: 25 },
    { name: "Bowen Square", floorArea: 110395, stores: 38 },
    { name: "Clydebank Centre", floorArea: 775000, stores: 126 },
    { name: "Erneside Shopping Centre", floorArea: 171590, stores: 34 },
    // Batch 8
    { name: "Great Northern Mall", city: "Belfast", floorArea: 13087, stores: 14 },
    { name: "N1 Shopping Centre", floorArea: 170000, stores: 35 }, // Angel Central
    { name: "Dundrum Town Centre", floorArea: 1200000, stores: 165 },
    { name: "Queensgate", floorArea: 835000, stores: 90 },
    { name: "Xscape Milton Keynes", floorArea: 645000, stores: 40 }, // 60k sqm
    { name: "Swadlincote Shopping Centre", floorArea: 112000, stores: 30 }, // Pipeworks Est
    { name: "Gracechurch Centre", floorArea: 550000, stores: 80 }, // Est stores
    { name: "Old Square", city: "Walsall", floorArea: 100000, stores: 40 }, // Est floor area from store count
    { name: "Navan Town Centre", floorArea: 250000, stores: 70 }
];

async function main() {
    console.log(`Enriching ${enrichmentData.length} Managed Centres (Batch 7-8)...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        const records = await prisma.location.findMany({ where: whereClause });
        if (records.length === 0) {
            console.log(`❌ Not Found: ${data.name}`);
            continue;
        }

        for (const loc of records) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    totalFloorArea: data.floorArea,
                    numberOfStores: data.stores
                }
            });
            console.log(`✅ Updated ${loc.name} (${data.floorArea} sqft)`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
