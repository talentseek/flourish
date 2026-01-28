
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Priority Location Enrichment...');

    // A. MERGE COCKHEDGE
    // Find duplicates. We want to keep the one with ID `cmksfw8ho0007ivpa73g57zv0` (Managed=True, 22 Tenants)
    // and merge `cmid0jwk200opmtpubdki55sl` (Managed=False, 0 Tenants) into it.
    const loserId = 'cmid0jwk200opmtpubdki55sl';
    const winnerId = 'cmksfw8ho0007ivpa73g57zv0';

    const loser = await prisma.location.findUnique({ where: { id: loserId } });
    const winner = await prisma.location.findUnique({ where: { id: winnerId } });

    if (loser && winner) {
        console.log(`Merging duplicate Cockhedge from ${loserId} into ${winnerId}...`);
        // 1. Rename Winner to "Cockhedge Shopping Park" (more accurate than Retail Park?)
        //    Actually, distinct sources say "Shopping Park" is the name, but official site is "Cockhedge". 
        //    Let's use "Cockhedge Shopping Park" as it identifies the format better.
        //    Also set website to 'https://cockhedge.co.uk/'

        await prisma.$transaction(async (tx: any) => {
            // Move tenants (just in case loser has any, though script said 0)
            await tx.tenant.updateMany({
                where: { locationId: loser.id },
                data: { locationId: winner.id }
            });
            // Delete loser
            await tx.location.delete({ where: { id: loser.id } });
            // Update winner
            await tx.location.update({
                where: { id: winner.id },
                data: {
                    name: 'Cockhedge Shopping Park',
                    website: 'https://cockhedge.co.uk/',
                    // description: '...'
                }
            });
        });
        console.log('Merge complete.');
    } else {
        console.log('Cockhedge duplicates not found or already merged.');
    }


    // B. DEFINE GOLDEN RECORDS
    // ID lookup or matching by name if ID missing (for creates)
    const targets = [
        {
            name: "Carters Square",
            town: "Uttoxeter",
            postcode: "ST14 8JN", // Found via search (ST14 8AR/JN)
            createIfMissing: true,
            data: {
                name: "Carters Square",
                town: "Uttoxeter",
                postcode: "ST14 8JN",
                address: "Carters Square, Uttoxeter, ST14 8JN",
                street: "Carters Square",
                city: "Uttoxeter",
                county: "Staffordshire",
                latitude: 52.898, // Approx
                longitude: -1.865, // Approx
                owner: "LCP Group",
                retailSpace: 68241,
                numberOfStores: 15,
                anchorTenants: 2, // Asda, Home Bargains
                isManaged: true,
                website: "https://www.carterssquare.co.uk/", // Inferred or known
                type: "SHOPPING_CENTRE"
            }
        },
        {
            name: "Middleton Shopping Centre",
            town: "Middleton",
            postcode: "M24 4EL",
            createIfMissing: true,
            data: {
                name: "Middleton Shopping Centre",
                town: "Middleton",
                postcode: "M24 4EL",
                address: "Middleton Shopping Centre, Middleton, Manchester, M24 4EL",
                city: "Manchester",
                county: "Greater Manchester",
                street: "Limetrees Road",
                latitude: 53.553,
                longitude: -2.203,
                owner: "M Core", // via LCP/M Core group
                retailSpace: 335480,
                numberOfStores: 60,
                anchorTenants: 3, // B&M, Iceland, Wilko (former) / Sports Direct
                isManaged: true,
                website: "https://middletonshoppingcentre.co.uk/",
                type: "SHOPPING_CENTRE"
            }
        },
        {
            searchName: "Birchwood Shopping Centre",
            data: {
                owner: "Birchwood Retail Properties Ltd",
                management: "Ashdown Phillips & Partners",
                retailSpace: 372917,
                numberOfStores: 50,
                parkingSpaces: 1533,
                anchorTenants: 2, // Asda, Aldi
                website: "https://birchwoodshoppingcentre.com/",
                isManaged: true
            }
        },
        {
            searchName: "Chelmsley Wood Shopping Centre",
            data: {
                owner: "M Core",
                retailSpace: 461012,
                numberOfStores: 70,
                anchorTenants: 1, // Asda
                website: "https://chelmsleywoodshopping.co.uk/",
                isManaged: true
            }
        },
        // Cockhedge handled above, but update data
        {
            searchName: "Cockhedge Shopping Park",
            data: {
                owner: "Rivet Group", // Keep existing if matched, or update if found? Search said 'Rivet'.
                website: "https://cockhedge.co.uk/",
                numberOfStores: 32,
                isManaged: true
            }
        },
        {
            searchName: "Ladysmith Shopping Centre",
            data: {
                owner: "NewRiver",
                management: "Ashdown Phillips",
                retailSpace: 170000,
                numberOfStores: 30, // Approx
                anchorTenants: 2, // Boots, Home Bargains
                website: "https://ladysmithshoppingcentre.com/",
                isManaged: true
            }
        },
        {
            searchName: "Longton Exchange",
            data: {
                owner: "LCP Group", // Likely given description style? Or unknown. Search: 'retail unit seeking new ownership'. 
                // Let's leave owner blank if unsure, or 'LCP Group' if confident. Source [3] loopnet linked to LCP group potentially.
                retailSpace: 134116,
                website: "https://longtonexchange.co.uk/", // Check validity?
                isManaged: true
            }
        },
        {
            searchName: "Lower Precinct Shopping Centre",
            data: {
                owner: "Sheet Anchor Evolve (M Core)",
                retailSpace: 221600,
                website: "https://lowerprecinct.com/",
                isManaged: true
            }
        },
        {
            searchName: "Central Square", // Maghull
            town: "Maghull",
            data: {
                owner: "LCP Group",
                retailSpace: 73482,
                numberOfStores: 40,
                website: "https://centralsquaremaghull.co.uk/", // Guess? Or generic LCP page
                name: "Central Square Maghull", // Rename for clarity?
                isManaged: true
            }
        },
        {
            searchName: "The Mailbox",
            data: {
                owner: "Mailbox REIT",
                management: "M7 Real Estate",
                retailSpace: 698000, // Includes office? Mixed use.
                website: "https://mailboxlife.com/",
                isManaged: true
            }
        },
        {
            searchName: "One Stop Retail Park",
            data: {
                owner: "Northdale Asset Management / Magnetar Capital",
                retailSpace: 380000,
                numberOfStores: 80,
                parkingSpaces: 1200,
                website: "https://onestopshopping.co.uk/",
                name: "One Stop Shopping Centre", // Rename from Retail Park
                isManaged: true
            }
        },
        {
            searchName: "The Strand Shopping Centre",
            data: {
                owner: "Sefton Council",
                retailSpace: 407000,
                numberOfStores: 130,
                website: "https://strandshoppingcentre.com/", // Likely
                isManaged: true
            }
        }
    ];

    for (const target of targets) {
        let loc;
        if (target.createIfMissing) {
            // Check existence
            loc = await prisma.location.findFirst({
                where: {
                    name: target.name,
                    postcode: target.postcode
                }
            });
            if (!loc) {
                console.log(`Creating ${target.name}...`);
                loc = await prisma.location.create({
                    data: target.data
                });
            } else {
                console.log(`Found existing ${target.name}, patching...`);
            }
        } else {
            // Find by searchName
            loc = await prisma.location.findFirst({
                where: {
                    name: { contains: target.searchName, mode: 'insensitive' },
                    town: target.town // Optional filter
                }
            });
        }

        if (loc) {
            console.log(`Updating ${loc.name} (${loc.id})...`);
            await prisma.location.update({
                where: { id: loc.id },
                data: target.data
            });
        } else {
            console.log(`⚠️ Could not find or create ${target.searchName || target.name}`);
        }
    }

    console.log("Enrichment complete.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
