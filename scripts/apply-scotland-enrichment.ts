
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scotlandData = [
    // Top 5
    { name: "St James Quarter", city: "Edinburgh", website: "https://stjamesquarter.com", instagram: "https://www.instagram.com/stjamesquarter", parkingSpaces: 1600 },
    { name: "East Kilbride Shopping Centre", nameUpdate: "EK, East Kilbride", website: "https://eklife.co.uk", facebook: "https://www.facebook.com/EKlife", parkingSpaces: 3000 },
    { name: "Braehead Shopping Centre", website: "https://braehead.co.uk", facebook: "https://www.facebook.com/BraeheadCentre", instagram: "https://www.instagram.com/braeheadcentre", parkingSpaces: 6500 },
    { name: "Silverburn", website: "https://shopsilverburn.com", facebook: "https://www.facebook.com/shopsilverburn", instagram: "https://www.instagram.com/shopsilverburn", parkingSpaces: 4500 },
    { name: "The Centre, Livingston", website: "https://thecentrelivingston.com", facebook: "https://www.facebook.com/shopthecentre", instagram: "https://www.instagram.com/shopthecentre", parkingSpaces: 2100 },

    // 6-10
    { name: "St. Enoch Centre", website: "https://st-enoch.com", parkingSpaces: 900 },
    { name: "Clyde Retail Park", nameUpdate: "Clyde Shopping Centre", website: "https://clyde-shoppingcentre.co.uk", facebook: "https://www.facebook.com/ClydeShoppingCentre", instagram: "https://www.instagram.com/clydeshoppingcentre", parkingSpaces: 2000 },
    { name: "Union Square", website: "https://unionsquareaberdeen.com", parkingSpaces: 1700 },
    { name: "Bon Accord Centre", website: "https://bonaccordcentre.com", parkingSpaces: 1400 },
    { name: "Buchanan Galleries", website: "https://buchanangalleries.co.uk", parkingSpaces: 2000 },

    // 11-15
    { name: "The Thistles Shopping Centre", website: "https://thistlesstirling.com", parkingSpaces: 1300 },
    { name: "The Kingdom Centre", website: "https://kingdomshopping.co.uk", parkingSpaces: 1400 },
    { name: "Overgate Centre", website: "https://overgate.co.uk", parkingSpaces: 700 },
    { name: "Eastgate Shopping Centre", city: "Inverness", website: "https://eastgateshopping.co.uk", parkingSpaces: 1350 },
    { name: "The Gyle Shopping Centre", city: "Edinburgh", create: true, website: "https://gyleshopping.com", facebook: "https://www.facebook.com/GyleShoppingCentre", instagram: "https://www.instagram.com/gyleshoppingcentre", parkingSpaces: 2300, postcode: "EH12 9JY" },

    // 16-20
    { name: "Ocean Terminal", website: "https://oceanterminal.com", parkingSpaces: 1600 },
    { name: "The Regent Centre", website: "https://regentshoppingcentre.com", parkingSpaces: 750 },
    { name: "Rivergate Shopping Centre", website: "https://rivergateshoppingcentre.com", facebook: "https://www.facebook.com/RivergateShoppingCentre", instagram: "https://www.instagram.com/rivergatecentre", parkingSpaces: 1100 },
    { name: "Livingston Designer Outlet", create: true, city: "Livingston", website: "https://livingston-designer-outlet.co.uk", facebook: "https://www.facebook.com/livingstondesigneroutlet", instagram: "https://www.instagram.com/livingstonoutlet", parkingSpaces: 1775, postcode: "EH54 6QX" },
    { name: "Oak Mall Shopping Centre", website: "https://oakmall.co.uk", parkingSpaces: 90 }
];

async function main() {
    console.log("🏴󠁧󠁢󠁳󠁣󠁴󠁿 Applying Scotland Top 20 Enrichment...");

    for (const data of scotlandData) {
        if (data.create) {
            // Check existence first
            const exists = await prisma.location.findFirst({ where: { name: data.name, postcode: data.postcode } });
            if (!exists) {
                await prisma.location.create({
                    data: {
                        name: data.name,
                        city: data.city || "Unknown",
                        website: data.website,
                        facebook: data.facebook,
                        instagram: data.instagram,
                        parkingSpaces: data.parkingSpaces,
                        postcode: data.postcode,
                        description: "Scotland Top 20 Regional Asset"
                    }
                });
                console.log(`✨ Created: ${data.name}`);
            } else {
                console.log(`⚠️ Exists (Skipping Create): ${data.name}`);
            }
            continue;
        }

        // Update logic
        let whereClause: any = { name: { contains: data.name } };

        // Specific checks for common names
        if (data.name === "Eastgate Shopping Centre") whereClause.city = { contains: "Inverness" };

        const loc = await prisma.location.findFirst({ where: whereClause });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    name: data.nameUpdate || undefined,
                    website: data.website,
                    facebook: data.facebook,
                    instagram: data.instagram,
                    parkingSpaces: data.parkingSpaces
                }
            });
            console.log(`✅ Updated: ${loc.name} -> ${data.nameUpdate || data.name}`);
        } else {
            console.log(`❌ Not Found (Update): ${data.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
