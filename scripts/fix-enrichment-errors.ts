
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Fixing Enrichment Errors...");

    // 1. Fix "Galleries Shopping Centre" (Washington) vs "Lomond Galleries" (Scotland)
    // The incorrect update was applied to Lomond Galleries.
    const lomond = await prisma.location.findFirst({ where: { name: "Lomond Galleries Shopping Centre" } });
    if (lomond && lomond.website?.includes("gallerieswashington")) {
        console.log(`   Fixing Lomond Galleries (was ${lomond.website})...`);
        // Revert or Set to null (I don't have the original, but it wasn't gallerieswashington)
        // I'll set it to null for now, or check if I have the correct one?
        // Lomond Galleries website is likely different. I'll just clear the wrong one.
        await prisma.location.update({
            where: { id: lomond.id },
            data: { website: null, facebook: null, instagram: null, twitter: null }
        });
    }

    // Now find the REAL Galleries Washington
    const washington = await prisma.location.findFirst({
        where: {
            name: { contains: "Galleries", mode: 'insensitive' },
            county: { contains: "Washington", mode: 'insensitive' }
        }
    });

    if (washington) {
        console.log(`   Updating Correct Galleries (Washington) - ${washington.name}...`);
        await prisma.location.update({
            where: { id: washington.id },
            data: {
                website: "https://www.gallerieswashington.co.uk/",
                facebook: "https://www.facebook.com/GalleriesWashington/", // Known from search
                instagram: "https://www.instagram.com/gallerieswashington/",
                twitter: "https://twitter.com/GalleriesWash"
            }
        });
    } else {
        // Broaden search
        const wash2 = await prisma.location.findFirst({
            where: {
                name: "Galleries Shopping Centre",
                city: "Washington"
            }
        });
        if (wash2) {
            console.log(`   Updating Correct Galleries (Washington) - ${wash2.name}...`);
            await prisma.location.update({
                where: { id: wash2.id },
                data: {
                    website: "https://www.gallerieswashington.co.uk/",
                    facebook: "https://www.facebook.com/GalleriesWashington/",
                    instagram: "https://www.instagram.com/gallerieswashington/",
                    twitter: "https://twitter.com/GalleriesWash"
                }
            });
        } else {
            console.log("   ❌ Could not find Galleries Washington in DB.");
        }
    }


    // 2. Fix "Park Centre" (Belfast) vs "Langley Park Centre" (Kent)
    const langley = await prisma.location.findFirst({ where: { name: "Langley Park Centre" } });
    if (langley && langley.website?.includes("theparkcentre.co.uk")) {
        console.log(`   Fixing Langley Park Centre (was ${langley.website})...`);
        await prisma.location.update({
            where: { id: langley.id },
            data: { website: null, facebook: null, instagram: null, twitter: null }
        });
    }

    const belfastPark = await prisma.location.findFirst({
        where: {
            name: "Park Centre",
            city: "Belfast"
        }
    });

    if (belfastPark) {
        console.log(`   Updating Correct Park Centre (Belfast) - ${belfastPark.name}...`);
        await prisma.location.update({
            where: { id: belfastPark.id },
            data: {
                website: "https://theparkcentre.co.uk/",
                facebook: "https://www.facebook.com/ParkCentreBelfast/"
            }
        });
    } else {
        console.log("   ❌ Could not find Park Centre Belfast in DB.");
    }

    console.log("✅ Fixes Applied.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
