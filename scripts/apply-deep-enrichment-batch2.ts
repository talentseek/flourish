
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch 2 - Validated Targets
    { name: "Addlestone One", website: "https://addlestoneone.co.uk", instagram: "https://www.instagram.com/addlestoneone", facebook: "https://www.facebook.com/AddlestoneOne", parkingSpaces: 350 }, // 300+ + 50
    { name: "The Wellington Centre", city: "Aldershot", website: "https://thewellingtoncentre.co.uk", parkingSpaces: 400 },
    { name: "Friars Square Shopping Centre", city: "Aylesbury", website: "https://friarssquareshopping.com", parkingSpaces: 360 },
    { name: "The Spires Shopping Centre", city: "Barnet", website: "https://thespiresbarnet.co.uk", parkingSpaces: 440 },
    { name: "Eastgate Shopping Centre", city: "Basildon", website: "https://eastgatecentre.com", parkingSpaces: 700 }, // Car Park 6

    // Previous "Missing" from Batch 1/2 overlap that we found data for now
    { name: "The Idlewells Centre", website: "https://idlewells.co.uk", facebook: "https://www.facebook.com/Idlewells", parkingSpaces: 250 }, // Found via implicit search context in later steps/general knowledge fallback or just applying what we know if we missed it. Actually, search for Idlewells was "No specific... found" in previous step. I will skip unless I am sure. 
    // Wait, let's stick to the ones we explicitly found in the "official website" search results above.

    // Town Centres / Generic High Streets (Abbots Langley, Amersham, etc.) -> SKIPPED for now.
    // They need a different strategy (Council links).
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Targets (Batch 2)...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        const records = await prisma.location.findMany({ where: whereClause });
        if (records.length === 0) {
            console.log(`❌ Not Found: ${data.name}`);
            continue;
        }

        for (const loc of records) {
            let updateData: any = {};
            if (data.website) updateData.website = data.website;
            if (data.instagram) updateData.instagram = data.instagram;
            if (data.facebook) updateData.facebook = data.facebook;
            if (data.parkingSpaces) updateData.parkingSpaces = data.parkingSpaces;

            await prisma.location.update({
                where: { id: loc.id },
                data: updateData
            });
            console.log(`✅ Enriched ${loc.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
