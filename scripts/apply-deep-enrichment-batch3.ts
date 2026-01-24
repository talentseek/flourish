
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch 3 - Strict Shopping Centres
    { name: "The Thistles Shopping Centre", website: "https://thistlesstirling.com", facebook: "https://www.facebook.com/ThistlesStirling", instagram: "https://www.instagram.com/thistlesstirling", parkingSpaces: 1300 },
    { name: "Trinity Walk Shopping Centre", website: "https://trinitywalk.com", facebook: "https://www.facebook.com/TrinityWalkWakefield", parkingSpaces: 1000 },
    { name: "Swords Pavilions", website: "https://pavilions.ie", facebook: "https://www.facebook.com/SwordsPavilions", instagram: "https://www.instagram.com/swordspavilions", parkingSpaces: 2000 },
    { name: "The Regent Centre", website: "https://regentcentre.co.uk", facebook: "https://www.facebook.com/TheRegentCentre", parkingSpaces: 180 },
    { name: "Willow Place & Corby Town Shopping", website: "https://willowplace.co.uk", facebook: "https://www.facebook.com/WillowPlaceCorby", parkingSpaces: 750 },
    { name: "CastleCourt", website: "https://castlecourt-uk.com", facebook: "https://www.facebook.com/CastleCourtBelfast", instagram: "https://www.instagram.com/castlecourtbelfast", parkingSpaces: 1600 },

    // Additional Targets from Search
    { name: "Telford Centre", website: "https://telfordcentre.com", facebook: "https://www.facebook.com/TelfordCentre", instagram: "https://www.instagram.com/telfordcentre", parkingSpaces: 4000 },
    { name: "New Kirkgate", website: "https://newkirkgate.co.uk", parkingSpaces: 100 }, // Est nearby/on-site
    { name: "The Pavilion", city: "Thornaby", website: "https://thepavilionthornaby.co.uk", parkingSpaces: 300 }, // Est ample
    { name: "Arc Shopping Centre", website: "https://arc-burystedmunds.co.uk", facebook: "https://www.facebook.com/arcburystedmunds", instagram: "https://www.instagram.com/arcburystedmunds", parkingSpaces: 850 },
    { name: "Quedam Shopping Centre", website: "https://quedamshopping.co.uk", parkingSpaces: 650 }, // Est multi-storey
    { name: "The Harvey Centre", website: "https://theharveycentre.com", parkingSpaces: 700 }, // Multi-storey
    { name: "Freshney Place", website: "https://freshneyplace.co.uk", parkingSpaces: 800 }, // East & West car parks
    { name: "Broadmarsh Centre", website: "https://broadmarshnottingham.co.uk", parkingSpaces: 1304 }, // New Car Park

    // Renamed/Redeveloped
    { name: "Elephant & Castle Shopping Centre", website: "https://elephantandcastletowncentre.co.uk" }, // Redevelopment site
    { name: "Arndale Shopping Centre", city: "Headingley", nameUpdate: "Headingley Central", website: "https://headingleycentral.com", facebook: "https://www.facebook.com/HeadingleyCentral", instagram: "https://www.instagram.com/headingleycentral" }
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Strict Targets (Batch 3)...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        // Handle rename specially
        if (data.nameUpdate) {
            const oldRec = await prisma.location.findFirst({ where: whereClause });
            if (oldRec) {
                await prisma.location.update({
                    where: { id: oldRec.id },
                    data: {
                        name: data.nameUpdate,
                        website: data.website,
                        instagram: data.instagram,
                        facebook: data.facebook
                    }
                });
                console.log(`✅ Renamed & Enriched ${oldRec.name} -> ${data.nameUpdate}`);
                continue;
            }
        }

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
