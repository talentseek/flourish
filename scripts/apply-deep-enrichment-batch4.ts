
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Validated Targets Batch 4
    { name: "Byron Place Shopping Centre", website: "https://byronplace.co.uk", facebook: "https://www.facebook.com/ByronPlaceSeaham", parkingSpaces: 358 },
    { name: "Cascades Shopping Centre", website: "https://cascades-shopping.co.uk", parkingSpaces: 1000 }, // Est multi-storey
    { name: "Cherry Tree Shopping Centre", website: "https://cherrytreeshoppingcentre.co.uk", facebook: "https://www.facebook.com/CherryTreePopUpMarket", parkingSpaces: 225 },
    { name: "Exchange Shopping Centre", city: "Ilford", website: "https://exchangeilford.co.uk", parkingSpaces: 1200 }, // Multi-storey
    { name: "Exchange Shopping Centre", city: "Rochdale", website: "https://rochdaleexchange.co.uk", instagram: "https://www.instagram.com/rochdaleexchange", facebook: "https://www.facebook.com/rochdaleexchange", parkingSpaces: 732 },
    { name: "Piccadilly Train Station", website: "https://networkrail.co.uk/communities/passengers/our-stations/manchester-piccadilly", parkingSpaces: 903 }, // 856 long + 47 short
    { name: "The Meadows", city: "Chelmsford", website: "https://themeadows.co.uk", instagram: "https://www.instagram.com/themeadowschelmsford", facebook: "https://www.facebook.com/TheMeadowsChelmsford", parkingSpaces: 454 },
    { name: "Cornmill Centre", website: "https://cornmillcentre.co.uk", parkingSpaces: 400 }, // Est
    { name: "Kingfisher Shopping Centre", website: "https://kingfishershopping.co.uk", facebook: "https://www.facebook.com/KingfisherRedditch", instagram: "https://www.instagram.com/shopkingfisher", parkingSpaces: 2400 }, // 4000 total mentioned, conservative estimate for owned car parks
    { name: "The Arcadian Centre", website: "https://thearcadian.co.uk", parkingSpaces: 500 }, // Est
    { name: "Bay View Shopping Centre", website: "https://bayviewshoppingcentre.co.uk", facebook: "https://www.facebook.com/BayViewShoppingCentre", instagram: "https://www.instagram.com/bayviewshopping", parkingSpaces: 200 }, // Est
    { name: "Aldridge Shopping Centre", website: "https://aldridgeshoppingcentre.co.uk", parkingSpaces: 300 },

    // Status Update
    { name: "Broadwalk Shopping Centre", parkingSpaces: 0 } // Permanently Closed
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Targets (Batch 4)...`);

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
