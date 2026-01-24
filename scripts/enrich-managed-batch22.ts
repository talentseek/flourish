
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch 4
    { name: "Midsummer Place", floorArea: 430000, stores: 55 },
    { name: "The Pavilions", city: "Uxbridge", floorArea: 390000, stores: 60 },
    { name: "Great Northern", city: "Manchester", floorArea: 150000, stores: 20 }, // Est Leisure box + Retail
    { name: "The Exchange", city: "Ilford", floorArea: 300000, stores: 90 },
    { name: "Islington Square", floorArea: 170000, stores: 35 },
    { name: "The Aylesham Centre", floorArea: 60000, stores: 10 }, // Approx current + Morrisons
    { name: "West India Quay", floorArea: 50000, stores: 15 }, // Hotel/Resi Heavy, Leisure base
    { name: "Tower Park", floorArea: 200000, stores: 13 }, // Leisure park est
    { name: "Cardigan Fields", floorArea: 150000, stores: 15 }, // Leisure
    { name: "Riverside Leisure Park", floorArea: 200000, stores: 20 }, // Retail park est
    // Batch 5
    { name: "The Priory", city: "Dartford", floorArea: 203217, stores: 31 },
    { name: "Salford Shopping City", floorArea: 285000, stores: 81 },
    { name: "The Spindles", floorArea: 450000, stores: 40 },
    { name: "Arndale Centre", city: "Morecambe", floorArea: 102000, stores: 40 },
    { name: "Fishergate Centre", floorArea: 340000, stores: 32 },
    { name: "Eastgate Centre", city: "Inverness", floorArea: 410000, stores: 60 }, // Using 60 stores stat
    { name: "The Concourse", floorArea: 333156, stores: 91 },
    { name: "Four Seasons Shopping Centre", floorArea: 285000, stores: 58 },
    { name: "Abbey Centre", floorArea: 320000, stores: 70 },
    { name: "Weavers Wharf", floorArea: 325000, stores: 25 }, // Est stores
    // Batch 6
    { name: "5 Rise Shopping Centre", floorArea: 60000, stores: 18 },
    { name: "Hardshaw Centre", floorArea: 169000, stores: 35 }, // Est stores
    { name: "Cockhedge Retail Park", floorArea: 170000, stores: 32 },
    { name: "Wulfrun Centre", floorArea: 200000, stores: 50 }, // Est active > 40
    { name: "The Churchill Centre", floorArea: 150000, stores: 30 }, // Est anchored
    { name: "Southwater Square", floorArea: 50000, stores: 10 }, // Leisure hub
    { name: "The Octagon", city: "Burton", floorArea: 140000, stores: 40 },
    { name: "Kennedy Way", floorArea: 46000, stores: 20 },
    { name: "The Sovereign", city: "Weston", floorArea: 117000, stores: 35 },
    { name: "Baverstock", city: "Bristol", floorArea: 20000, stores: 5 } // Small parade/centre est
];

async function main() {
    console.log(`Enriching ${enrichmentData.length} Managed Centres (Batch 4-6)...`);

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
            console.log(`✅ Updated ${loc.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
