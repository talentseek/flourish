
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch 1
    { name: "Lower Precinct Shopping Centre", floorArea: 227000, stores: 34 },
    { name: "Market Quay Shopping Centre", floorArea: 168907, stores: 17 },
    { name: "Chelmsley Wood Shopping Centre", floorArea: 461012, stores: 70 }, // Est 70 orig, keeping as valid data point
    { name: "Beacons Place Shopping Centre", floorArea: 28858, stores: 13 },
    { name: "Middleton Shopping Centre", floorArea: 335480, stores: 50 }, // Est from list of major retailers
    { name: "Rainham Shopping Centre", floorArea: 85000, stores: 25 },
    { name: "The Swan Centre", floorArea: 324126, stores: 40 }, // Est based on key tenants list
    { name: "Ankerside Shopping Centre", floorArea: 188623, stores: 35 },
    { name: "Kingfisher Shopping Centre", floorArea: 1000000, stores: 150 },
    // Batch 2
    { name: "The Centre, Livingston", floorArea: 1000000, stores: 166 },
    { name: "St George's Shopping Centre", city: "Harrow", floorArea: 215000, stores: 30 },
    { name: "The Brunel", floorArea: 496833, stores: 60 },
    { name: "The Idlewells Centre", floorArea: 149750, stores: 43 },
    { name: "The Malls Shopping Centre", floorArea: 290000, stores: 29 },
    { name: "The Merrion Centre", floorArea: 800000, stores: 115 }, // Mixed use, high store count
    { name: "The Stamford Quarter", floorArea: 367000, stores: 38 }, // 24+14
    { name: "The Thistles Shopping Centre", floorArea: 500000, stores: 80 },
    { name: "Piccadilly Train Station", floorArea: 50000, stores: 15 }, // Est Retail area for station hub
    { name: "Quedam Shopping Centre", floorArea: 170000, stores: 35 },
    // Batch 3
    { name: "Swords Pavilions", floorArea: 490000, stores: 100 },
    { name: "The Harvey Centre", floorArea: 530000, stores: 65 },
    { name: "The Meadows", city: "Chelmsford", floorArea: 155000, stores: 39 },
    { name: "The Regent Centre", city: "Kirkintilloch", floorArea: 79072, stores: 17 },
    { name: "Willow Place & Corby Town Shopping", floorArea: 705000, stores: 140 },
    { name: "CastleCourt", floorArea: 340000, stores: 81 },
    { name: "Bloomfield Shopping Centre", floorArea: 296632, stores: 49 },
    { name: "Elephant & Castle Shopping Centre", floorArea: 135000, stores: 50 }, // New dev
    { name: "Freshney Place", floorArea: 500000, stores: 80 },
    { name: "Broadmarsh Centre", floorArea: 215000, stores: 0 } // Demolished/Redev - set to 20k sqm (~215k sqft) future
];

async function main() {
    console.log(`Enriching ${enrichmentData.length} Managed Centres...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        // Ensure we target the Shopping Centre mostly
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
            console.log(`✅ Updated ${loc.name} (${data.floorArea} sqft, ${data.stores} stores)`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
