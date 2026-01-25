
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const walesData = [
    // Top 5
    { name: "St David's Dewi Sant", city: "Cardiff", website: "https://stdavidscardiff.com", facebook: "https://www.facebook.com/StDavidsCardiff", instagram: "https://www.instagram.com/stdavidscardiff", parkingSpaces: 2000 },
    { name: "Cwmbran Centre", website: "https://cwmbrancentre.com", facebook: "https://www.facebook.com/CwmbranCentre", parkingSpaces: 3000 },
    { name: "The Quadrant Shopping Centre", website: "https://quadrantshopping.co.uk", facebook: "https://www.facebook.com/QuadrantShoppingCentre", parkingSpaces: 550 },
    { name: "Eagles Meadow", city: "Wrexham", website: "https://eagles-meadow.co.uk", facebook: "https://www.facebook.com/eaglesmeadow", parkingSpaces: 970 },
    { name: "Friars Walk", city: "Newport", website: "https://friarswalknewport.co.uk", facebook: "https://www.facebook.com/FriarsWalkNewport", parkingSpaces: 350 },

    // 6-10
    { name: "Aberafan Shopping Centre", website: "https://aberafanshopping.co.uk", parkingSpaces: 400 },
    { name: "Kingsway Centre", city: "Newport", website: "https://kingswaycentre.com", parkingSpaces: 1050 },
    { name: "St Catherine's Walk", create: true, city: "Carmarthen", website: "https://stcatherineswalk.com", facebook: "https://www.facebook.com/stcatherineswalk", parkingSpaces: 950 },
    { name: "McArthurGlen Bridgend Designer Outlet", website: "https://mcarthurglen.com/en/outlets/uk/designer-outlet-bridgend", parkingSpaces: 2000 },
    { name: "The Capitol", create: true, city: "Cardiff", website: "https://thecapitolcardiff.com", facebook: "https://www.facebook.com/CapitolCardiff", parkingSpaces: 388 },

    // 11-15
    { name: "Queens Arcade", website: "https://queensarcadecardiff.co.uk", parkingSpaces: 0 }, // Connected to St Davids
    { name: "Victoria Centre", city: "Llandudno", website: "https://victoriacentrellandudno.co.uk", parkingSpaces: 366 },
    { name: "White Rose Shopping Centre", website: "https://whiterosecentre.com", parkingSpaces: 300 },
    { name: "Daniel Owen Centre", create: true, city: "Mold", website: "https://danielowencentre.com", facebook: "https://www.facebook.com/DanielOwenCentre", parkingSpaces: 0 }, // Public Parking
    { name: "Riverside Shopping Centre", create: true, city: "Haverfordwest", website: "https://riverside-shopping.co.uk", facebook: "https://www.facebook.com/RiversideShoppingHaverfordwest", parkingSpaces: 0 } // Council Parking
];

async function main() {
    console.log("🏴󠁧󠁢󠁷󠁬󠁳󠁿 Applying Wales Top 15 Enrichment...");

    for (const data of walesData) {
        if (data.create) {
            // Check existence first
            const exists = await prisma.location.findFirst({ where: { name: data.name } });
            if (!exists) {
                await prisma.location.create({
                    data: {
                        name: data.name,
                        city: data.city || "Unknown",
                        website: data.website,
                        facebook: data.facebook,
                        instagram: data.instagram,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "Wales"}`,
                        county: "Wales",
                        postcode: "UNKNOWN",
                        latitude: 0.0,
                        longitude: 0.0
                    }
                });
                console.log(`✨ Created: ${data.name}`);
            } else {
                console.log(`⚠️ Exists (Skipping Create): ${data.name}`);
                // Optional update if exists
            }
            continue;
        }

        // Update logic
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        // Relaxed matching for specific difficult targets
        if (data.name === "Aberafan Shopping Centre") whereClause = { name: { contains: "Aberafan" } };
        if (data.name === "Kingsway Centre") whereClause = { name: { contains: "Kingsway" } };

        const loc = await prisma.location.findFirst({ where: whereClause });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: data.website,
                    facebook: data.facebook,
                    instagram: data.instagram,
                    parkingSpaces: data.parkingSpaces
                }
            });
            console.log(`✅ Updated: ${loc.name}`);
        } else {
            console.log(`❌ Not Found (Update): ${data.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
