
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch B Highlights
    { name: "The Brewery", city: "Romford", website: "https://thebreweryromford.co.uk", facebook: "https://www.facebook.com/TheBreweryRomford", instagram: "https://www.instagram.com/thebreweryromford", parkingSpaces: 1700 },
    { name: "The Gate", city: "Newcastle", website: "https://thegatenewcastle.co.uk", facebook: "https://www.facebook.com/TheGateNewcastle", instagram: "https://www.instagram.com/thegatenewcastle", parkingSpaces: 250 },
    { name: "The Orchards", city: "Dartford", website: "https://theorchardsdartford.co.uk", facebook: "https://www.facebook.com/orchardsdartford", instagram: "https://www.instagram.com/orchardsdartford", parkingSpaces: 250 },
    { name: "The Pentagon Shopping Centre", website: "https://pentagonshoppingcentre.co.uk", parkingSpaces: 433 },
    { name: "The Piazza", city: "Huddersfield", website: "https://piazzacentre.co.uk", facebook: "https://www.facebook.com/PiazzaCentre", parkingSpaces: 0 },
    { name: "West India Quay", website: "https://westindiaquayquarter.com", parkingSpaces: 0 }, // Leisure focused
    { name: "Tower Park", website: "https://towerparkentertainment.co.uk", parkingSpaces: 0 }, // Leisure
    { name: "Xscape", city: "Milton Keynes", website: "https://xscapemiltonkeynes.co.uk", facebook: "https://www.facebook.com/XscapeMK", instagram: "https://www.instagram.com/xscapemk", parkingSpaces: 1000 },
    { name: "The Bridges", city: "Sunderland", website: "https://thebridges-shopping.com", facebook: "https://www.facebook.com/TheBridgesShopping", instagram: "https://www.instagram.com/thebridgesshopping", parkingSpaces: 900 },
    { name: "County Square Shopping Centre", website: "https://countysquareshoppingcentre.com", facebook: "https://www.facebook.com/CountySquareShoppingCentre", instagram: "https://www.instagram.com/countysquare", parkingSpaces: 600 },
    { name: "Culver Square Shopping Centre", website: "https://culversquare.co.uk", facebook: "https://www.facebook.com/CulverSquare", instagram: "https://www.instagram.com/culversquare", parkingSpaces: 500 },
    { name: "Ealing Broadway Shopping Centre", website: "https://ealingbroadwayshopping.co.uk", facebook: "https://www.facebook.com/EalingBroadwayShopping", instagram: "https://www.instagram.com/ealingbroadway", parkingSpaces: 800 },
    { name: "Fairhill Shopping Centre", website: "https://fairhillshopping.co.uk", facebook: "https://www.facebook.com/FairhillShoppingCentre", instagram: "https://www.instagram.com/fairhillsc", parkingSpaces: 900 },
    { name: "The Forge Shopping Centre", website: "https://forgeshopping.com", facebook: "https://www.facebook.com/ForgeShoppingCentre", instagram: "https://www.instagram.com/forgeshopping", parkingSpaces: 1600 },
    { name: "Wellgate Shopping Centre", website: "https://wellgatedundee.co.uk", parkingSpaces: 600 },
    { name: "Waterside Shopping Centre", website: "https://watersideshopping.com", facebook: "https://www.facebook.com/WatersideShopping", instagram: "https://www.instagram.com/watersideshopping", parkingSpaces: 0 },
    { name: "Newkirkgate Shopping Centre", website: "https://newkirkgate.com", parkingSpaces: 100 },
    { name: "The Ryemarket Shopping Centre", website: "https://ryemarketshoppingcentre.co.uk", parkingSpaces: 300 },
    { name: "Princes Square", website: "https://princessquare.co.uk", parkingSpaces: 0 },
    { name: "Touchwood", website: "https://touchwoodsolihull.co.uk", instagram: "https://www.instagram.com/touchwoodsolihull", parkingSpaces: 1700 }, // Found separately
    { name: "Eastgate Shopping Centre", city: "Basildon", website: "https://eastgateshoppingcentre.com", facebook: "https://www.facebook.com/EastgateBasildon", instagram: "https://www.instagram.com/eastgatebasildon", parkingSpaces: 1500 }
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Managed Assets (Batch B)...`);

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
