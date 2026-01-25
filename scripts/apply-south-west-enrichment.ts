
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const southWestEnrichment = [
    { name: "The Mall at Cribbs Causeway", city: "Bristol", website: "https://mallcribbs.com", parkingSpaces: 7000 },
    { name: "Cabot Circus", city: "Bristol", website: "https://cabotcircus.com", parkingSpaces: 2500 },
    { name: "Castlepoint", city: "Bournemouth", website: "https://castlepointshopping.com", parkingSpaces: 2800 },
    { name: "The Dolphin", city: "Poole", website: "https://dolphinshoppingcentre.co.uk", parkingSpaces: 1400, legacyNames: ["Dolphin Shopping Centre", "The Dolphin Shopping Centre"] },
    { name: "Princesshay", city: "Exeter", website: "https://princesshay.co.uk", parkingSpaces: 290 },
    { name: "The Brunel", city: "Swindon", website: "https://thebrunel.co.uk", parkingSpaces: 700, legacyNames: ["Brunel Shopping Centre"] },
    { name: "Drake Circus", city: "Plymouth", website: "https://drakecircus.com", parkingSpaces: 1270 },
    { name: "SouthGate", city: "Bath", website: "https://southgatebath.com", parkingSpaces: 870, legacyNames: ["SouthGate Bath"] },
    { name: "Gloucester Quays", city: "Gloucester", website: "https://gloucesterquays.co.uk", parkingSpaces: 1400 },
    { name: "The Galleries", city: "Bristol", website: "https://galleriesbristol.co.uk", parkingSpaces: 1000 },
    { name: "McArthurGlen Swindon", city: "Swindon", website: "https://mcarthurglen.com/outlets/en/uk/designer-outlet-swindon", parkingSpaces: 1000, legacyNames: ["Swindon Designer Outlet"] },
    { name: "Regent Arcade", city: "Cheltenham", website: "https://regentarcade.co.uk", parkingSpaces: 500 },
    { name: "Clarks Village", city: "Street", website: "https://clarksvillage.co.uk", parkingSpaces: 1400 },
    { name: "Quedam Shopping Centre", city: "Yeovil", website: "https://quedamshopping.co.uk", parkingSpaces: 650, legacyNames: ["The Quedam Centre", "Quedam Centre"] },
    { name: "Guildhall Shopping Centre", city: "Exeter", website: "https://guildhallshoppingexeter.co.uk", parkingSpaces: 400 },
    { name: "Orchard Shopping Centre", city: "Taunton", website: "https://orchardtaunton.co.uk", parkingSpaces: 600 },
    { name: "Eastgate Shopping Centre", city: "Gloucester", website: "https://eastgateshoppingcentre.co.uk", parkingSpaces: 380 },
    { name: "Old George Mall", city: "Salisbury", website: "https://oldgeorgemall.co.uk", parkingSpaces: 500 },
    { name: "The Sovereign", city: "Weston-super-Mare", website: "https://sovereign-centre.co.uk", parkingSpaces: 850, legacyNames: ["Sovereign Shopping Centre", "Sovereign Centre"] },
    { name: "Emery Gate Shopping Centre", city: "Chippenham", website: "https://emerygate.co.uk", parkingSpaces: 350 },
];

async function main() {
    console.log('Starting South West enrichment...');

    for (const centre of southWestEnrichment) {
        console.log(`Processing ${centre.name}...`);

        const namesToCheck = [centre.name];
        if (centre.legacyNames) {
            namesToCheck.push(...centre.legacyNames);
        }

        let location = await prisma.location.findFirst({
            where: {
                name: { in: namesToCheck }
            }
        });

        // If still not found, try name + city strict
        if (!location) {
            location = await prisma.location.findFirst({
                where: {
                    name: centre.name,
                    city: centre.city
                }
            });
        }

        if (location) {
            console.log(`Found existing: ${location.name} (ID: ${location.id})`);

            const updateData: any = {
                name: centre.name,
                city: centre.city,
                website: centre.website,
                parkingSpaces: centre.parkingSpaces,
            };

            await prisma.location.update({
                where: { id: location.id },
                data: updateData,
            });
            console.log(`Updated ${centre.name}.`);
        } else {
            // Double check existence before create to avoid unique constraint race
            const existingCheck = await prisma.location.findFirst({
                where: {
                    name: centre.name,
                    city: centre.city
                }
            });

            if (!existingCheck) {
                console.log(`Creating new: ${centre.name}`);
                try {
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
                            longitude: 0
                        },
                    });
                } catch (e) {
                    console.log(`Error creating ${centre.name} - likely exists already.`);
                }
            } else {
                console.log(`Found exiting during secondary check: ${existingCheck.name}`);
                await prisma.location.update({
                    where: { id: existingCheck.id },
                    data: {
                        website: centre.website,
                        parkingSpaces: centre.parkingSpaces
                    },
                });
            }
        }
    }

    console.log('South West enrichment complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
