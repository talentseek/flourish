
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Reverting Incorrect Kingsway Updates...");

    // 1. Revert Dundee & Derby records (Remove Newport website)
    // IDs identified from inspection:
    // cmid0k5qb00y9mtpu5hkt20om (Dundee Leisure)
    // cmid0k5r800yamtpudwklvezr (Dundee Retail)
    // cmid0k5p700y8mtpunv3hquop (Derby Retail)

    const idsToRevert = [
        "cmid0k5qb00y9mtpu5hkt20om",
        "cmid0k5r800yamtpudwklvezr",
        "cmid0k5p700y8mtpunv3hquop"
    ];

    await prisma.location.updateMany({
        where: { id: { in: idsToRevert } },
        data: {
            website: null,
            facebook: null,
            instagram: null
        }
    });
    console.log(`✅ Reverted ${idsToRevert.length} incorrect Kingsway records.`);

    // 2. Ensure Newport Record is Enriched
    const newportRecord = await prisma.location.findFirst({
        where: {
            name: { contains: "Kingsway" },
            city: { contains: "Newport" }
        }
    });

    if (newportRecord) {
        await prisma.location.update({
            where: { id: newportRecord.id },
            data: {
                name: "Kingsway Shopping Centre",
                website: "https://kingswaycentre.com",
                facebook: "https://www.facebook.com/KingswayCentreNewport",
                instagram: "https://www.instagram.com/kingswaynewport",
                parkingSpaces: 1050
            }
        });
        console.log(`✅ Verified/Enriched Newport Record: ${newportRecord.name}`);
    } else {
        // Create if missing (though inspection showed it existed)
        await prisma.location.create({
            data: {
                name: "Kingsway Shopping Centre",
                city: "Newport",
                website: "https://kingswaycentre.com",
                facebook: "https://www.facebook.com/KingswayCentreNewport",
                instagram: "https://www.instagram.com/kingswaynewport",
                parkingSpaces: 1050,
                type: "SHOPPING_CENTRE",
                address: "Kingsway Centre, Newport",
                county: "Wales",
                postcode: "NP20 1HY",
                latitude: 0.0,
                longitude: 0.0
            }
        });
        console.log(`✨ Created Kingsway Shopping Centre (Newport)`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
