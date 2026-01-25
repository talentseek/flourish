
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scotlandRemediation = [
    { name: "St James Quarter", city: "Edinburgh", website: "https://stjamesquarter.com", instagram: "https://www.instagram.com/stjamesquarter", facebook: "https://www.facebook.com/StJamesQuarter", parkingSpaces: 1600 },
    { name: "EK, East Kilbride", city: "East Kilbride", website: "https://eklife.co.uk", facebook: "https://www.facebook.com/EKlife", instagram: "https://www.instagram.com/ek_life", parkingSpaces: 1574 },
    { name: "Braehead Shopping Centre", city: "Glasgow", website: "https://braehead.co.uk", facebook: "https://www.facebook.com/BraeheadCentre", instagram: "https://www.instagram.com/braeheadcentre", parkingSpaces: 6500 },
    { name: "Silverburn", city: "Glasgow", website: "https://shopsilverburn.com", facebook: "https://www.facebook.com/shopsilverburn", instagram: "https://www.instagram.com/shopsilverburn", parkingSpaces: 4500 },
    { name: "The Centre, Livingston", city: "Livingston", website: "https://thecentrelivingston.com", facebook: "https://www.facebook.com/shopthecentre", instagram: "https://www.instagram.com/shopthecentre", parkingSpaces: 2100 },
    { name: "St. Enoch Centre", city: "Glasgow", website: "https://st-enoch.com", facebook: "https://www.facebook.com/stenochcentre", instagram: "https://www.instagram.com/stenochcentre", parkingSpaces: 900 },
    { name: "Clyde Shopping Centre", city: "Clydebank", website: "https://clyde-shoppingcentre.co.uk", facebook: "https://www.facebook.com/ClydeShoppingCentre", instagram: "https://www.instagram.com/clydeshoppingcentre", parkingSpaces: 2000 },
    { name: "Union Square", city: "Aberdeen", website: "https://unionsquareaberdeen.com", facebook: "https://www.facebook.com/UnionSquareAberdeen", instagram: "https://www.instagram.com/unionsquareaberdeen", parkingSpaces: 1700 },
    { name: "Bon Accord", city: "Aberdeen", website: "https://bonaccordaberdeen.com", facebook: "https://www.facebook.com/BonAccordAberdeen", instagram: "https://www.instagram.com/bonaccordaberdeen", parkingSpaces: 1400 },
    { name: "Buchanan Galleries", city: "Glasgow", website: "https://buchanangalleries.co.uk", facebook: "https://www.facebook.com/buchanangalleries", instagram: "https://www.instagram.com/buchanangalleries", parkingSpaces: 2000 },
    { name: "The Thistles Shopping Centre", city: "Stirling", website: "https://thistlesstirling.com", facebook: "https://www.facebook.com/ThistlesStirling", instagram: "https://www.instagram.com/thistlesstirling", parkingSpaces: 1300 },
    { name: "The Kingdom Centre", city: "Glenrothes", website: "https://kingdomshopping.co.uk", facebook: "https://www.facebook.com/KingdomShoppingCentre", instagram: "https://www.instagram.com/kingdomshoppingcentre", parkingSpaces: 1400 },
    { name: "Overgate Centre", city: "Dundee", website: "https://overgate.co.uk", facebook: "https://www.facebook.com/OvergateDundee", instagram: "https://www.instagram.com/overgatedundee", parkingSpaces: 700 },
    { name: "Eastgate Shopping Centre", city: "Inverness", website: "https://eastgateshopping.co.uk", facebook: "https://www.facebook.com/EastgateShopping", instagram: "https://www.instagram.com/eastgateshopping", parkingSpaces: 1350 },
    { name: "Gyle Shopping Centre", city: "Edinburgh", website: "https://gyleshopping.com", facebook: "https://www.facebook.com/GyleShoppingCentre", instagram: "https://www.instagram.com/gyleshoppingcentre", parkingSpaces: 2300 },
    { name: "Ocean Terminal", city: "Edinburgh", website: "https://oceanterminal.com", facebook: "https://www.facebook.com/oceanterminal", instagram: "https://www.instagram.com/oceanterminal", parkingSpaces: 1600 },
    { name: "The Regent Shopping Centre", city: "Hamilton", website: "https://regentshoppingcentre.com", facebook: "https://www.facebook.com/RegentShoppingCentre", instagram: null, parkingSpaces: 750, legacyNames: ["Regent Shopping Centre"] },
    { name: "Rivergate Shopping Centre", city: "Irvine", website: "https://rivergatecentre.com", facebook: "https://www.facebook.com/RivergateShoppingCentre", instagram: "https://www.instagram.com/rivergatecentre", parkingSpaces: 1100 },
    { name: "Livingston Designer Outlet", city: "Livingston", website: "https://livingston-designer-outlet.co.uk", facebook: "https://www.facebook.com/livingstondesigneroutlet", instagram: "https://www.instagram.com/livingstonoutlet", parkingSpaces: 1775 },
    { name: "Oak Mall Shopping Centre", city: "Greenock", website: "https://oakmall.co.uk", facebook: "https://www.facebook.com/OakMallGreenock", instagram: "https://www.instagram.com/oakmallgreenock", parkingSpaces: 90 }
];

async function main() {
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Starting Scotland Remediation...');

    for (const centre of scotlandRemediation) {
        if (!centre || !centre.name) continue;

        console.log(`Processing ${centre.name}...`);

        let namesToCheck = [centre.name];
        if (centre.name) {
            namesToCheck.push(centre.name.replace("The ", ""));
            namesToCheck.push(centre.name + " Shopping Centre");
        }

        if ((centre as any).legacyNames) {
            namesToCheck.push(...(centre as any).legacyNames);
        }

        // Filter duplicates and undefined
        namesToCheck = [...new Set(namesToCheck.filter(Boolean))];

        try {
            let location = await prisma.location.findFirst({
                where: {
                    OR: namesToCheck.map(n => ({ name: n }))
                }
            });

            // Fallback Geosearch
            if (!location && centre.city) {
                location = await prisma.location.findFirst({
                    where: {
                        city: { contains: centre.city },
                        name: { contains: centre.name.split(" ")[0] }
                    }
                });
            }

            if (location) {
                console.log(`✅ MATCH: ${location.name} -> ${centre.name}`);

                await prisma.location.update({
                    where: { id: location.id },
                    data: {
                        name: centre.name,
                        website: centre.website,
                        facebook: centre.facebook,
                        instagram: centre.instagram,
                        parkingSpaces: centre.parkingSpaces,
                        description: null,
                    },
                });
            } else {
                const existingCheck = await prisma.location.findFirst({
                    where: {
                        name: centre.name,
                        city: centre.city
                    }
                });

                if (!existingCheck) {
                    console.log(`⚠️ NEW: Creating ${centre.name}`);
                    await prisma.location.create({
                        data: {
                            name: centre.name,
                            city: centre.city,
                            website: centre.website,
                            parkingSpaces: centre.parkingSpaces,
                            type: "SHOPPING_CENTRE",
                            address: `${centre.name}, ${centre.city}`,
                            postcode: "UNKNOWN",
                            latitude: 0,
                            longitude: 0,
                            description: null
                        },
                    });
                } else {
                    console.log(`✅ MATCH (Strict): ${existingCheck.name}`);
                    await prisma.location.update({
                        where: { id: existingCheck.id },
                        data: {
                            website: centre.website,
                            facebook: centre.facebook,
                            instagram: centre.instagram,
                            parkingSpaces: centre.parkingSpaces,
                            description: null
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Error processing ${centre.name}:`, e);
        }
    }

    console.log('Scotland Remediation complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
