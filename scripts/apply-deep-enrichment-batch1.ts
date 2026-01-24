
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Priority Targets (Top 10)
    { name: "The Kingdom Centre", website: "https://kingdomshoppingcentre.co.uk", facebook: "https://www.facebook.com/KingdomShoppingCentre", parkingSpaces: 1450 },
    { name: "Riverside Shopping Centre", city: "Evesham", parkingSpaces: 260 },
    { name: "Priors Hall Park", website: "https://priorshallpark.co.uk", instagram: "https://www.instagram.com/priorshallpark", facebook: "https://www.facebook.com/priorshallpark" },
    { name: "Parrswood Leisure Park", parkingSpaces: 744 },
    // Bath Riverside & Emperor's Gate - No specific data found, skipped for now to avoid bad data
    { name: "Ankerside Shopping Centre", website: "https://ankerside.co.uk", instagram: "https://www.instagram.com/ankerside_sc", facebook: "https://www.facebook.com/AnkersideShoppingCentre", parkingSpaces: 700 }, // Est handle
    { name: "The Centre, Livingston", website: "https://thecentrelivingston.com", parkingSpaces: 2116 },
    { name: "The Quadrant Centre", website: "https://quadrantswansea.co.uk", instagram: "https://www.instagram.com/quadrantswansea", facebook: "https://www.facebook.com/QuadrantSwansea", parkingSpaces: 565 }, // Est handles based on site
    { name: "St George's Shopping Centre", city: "Harrow", website: "https://stgeorgesharrow.co.uk", instagram: "https://www.instagram.com/stgeorgesharrow", facebook: "https://www.facebook.com/StGeorgesHarrow", parkingSpaces: 640 },

    // Next 15
    { name: "The Brunel", website: "https://thebrunel.co.uk", parkingSpaces: 1246 }, // 700+546
    { name: "The Malls Shopping Centre", website: "https://themalls.co.uk", parkingSpaces: 540 },
    { name: "The Merrion Centre", website: "https://merrioncentre.co.uk", instagram: "https://www.instagram.com/merrioncentre", facebook: "https://www.facebook.com/MerrionCentre", parkingSpaces: 1000 },
    { name: "The Stamford Quarter", website: "https://stamfordquarter.com", parkingSpaces: 550 },
    { name: "The Wellington Centre", city: "Aldershot", website: "https://thewellingtoncentre.co.uk", parkingSpaces: 400 },
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Targets...`);

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
