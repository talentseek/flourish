
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch 5 Hits
    { name: "The Arcadian Centre", website: "https://thearcadian.co.uk", facebook: "https://www.facebook.com/TheArcadianBirmingham", instagram: "https://www.instagram.com/thearcadianbirmingham", parkingSpaces: 500 },
    { name: "Bay View Shopping Centre", city: "Colwyn Bay", nameUpdate: "Bayview Shopping Centre", website: "https://bayviewshoppingcentre.co.uk", facebook: "https://www.facebook.com/BayViewShoppingCentre", instagram: "https://www.instagram.com/bayviewshopping", parkingSpaces: 500 },
    { name: "Burns Mall", website: "https://burns-mall.com", facebook: "https://www.facebook.com/BurnsMall", instagram: "https://www.instagram.com/burnsmallkilmarnock", parkingSpaces: 430 },
    { name: "Byron Place Shopping Centre", website: "https://byronplace.co.uk", facebook: "https://www.facebook.com/ByronPlaceSeaham", parkingSpaces: 358 },
    { name: "Castle Dene Shopping Centre", website: "https://castledenepeterlee.co.uk", facebook: "https://www.facebook.com/CastleDeneShopping", parkingSpaces: 779 },
    { name: "Cannon Park Shopping Centre", website: "https://cannonparkshopping.co.uk", facebook: "https://www.facebook.com/CannonParkShoppingCentre", instagram: "https://www.instagram.com/cannonparkshops", parkingSpaces: 800 }, // Est major centre
    { name: "Coopers Square Shopping Centre", website: "https://cooperssquare.co.uk", facebook: "https://www.facebook.com/CoopersSquare", instagram: "https://www.instagram.com/cooperssquare", parkingSpaces: 800 },
    { name: "Civic Centre", city: "Manchester", nameUpdate: "Wythenshawe Town Centre", website: "https://wythenshawetowncentre.com", facebook: "https://www.facebook.com/WythenshaweTownCentre", instagram: "https://www.instagram.com/wythenshawetowncentre", parkingSpaces: 300 }, // Rename generic
    { name: "Crown Glass Shopping Centre", website: "https://crownglassshopping.co.uk", facebook: "https://www.facebook.com/CrownGlassShoppingCentre", parkingSpaces: 200 },
    { name: "Eagles Meadow", website: "https://eagles-meadow.co.uk", facebook: "https://www.facebook.com/EaglesMeadow", parkingSpaces: 970 }, // Official count 970
    { name: "The Enterprise Centre", website: "https://enterprisecentre.org", facebook: "https://www.facebook.com/TheEnterpriseCentre", parkingSpaces: 0 },
    { name: "Cibi Walk", website: "https://facebook.com/cibiwalkabergavenny", facebook: "https://facebook.com/cibiwalkabergavenny" }
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Targets (Batch 5)...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        // Relax city check for "Civic Centre" as it might be under 'Greater Manchester' or 'Wythenshawe'
        if (data.city && data.name !== "Civic Centre") whereClause.city = { contains: data.city };

        // Handle rename specially (Civic Centre -> Wythenshawe)
        if (data.nameUpdate) {
            const oldRec = await prisma.location.findFirst({ where: whereClause });
            if (oldRec) {
                await prisma.location.update({
                    where: { id: oldRec.id },
                    data: {
                        name: data.nameUpdate,
                        website: data.website,
                        instagram: data.instagram,
                        facebook: data.facebook,
                        parkingSpaces: data.parkingSpaces
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
            if (data.parkingSpaces !== undefined) updateData.parkingSpaces = data.parkingSpaces;

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
