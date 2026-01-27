
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Portfolio Sweep Enrichment...');

    // 1. British Land Portfolio (Major & recent acquisitions)
    const britishLandSites = [
        'Teesside Park', 'Glasgow Fort', 'Fort Kinnaird', 'New Mersey',
        'Whiteley Shopping', 'Crownpoint', 'Crown Point', 'Meadowhall Retail Park',
        'Elliott\'s Field', 'Central Retail Park', // Note: Falkirk one is Brookfield? Checking conflict. British Land bought Phase?
        'Wellington Retail Park', 'Ravenhead Retail Park', 'Cleveland Retail Park',
        'Telford Forge', 'Chilwell Retail Park', 'Orchard Centre', 'Cyfarthfa Shopping Park',
        'Enham Arch', 'Queen\'s Drive', 'St David\'s Retail Park', 'Southampton Road',
        'Nugent Shopping Park', 'Giltbrook', 'Broughton Shopping Park', 'Deepdale' // sold?
    ];

    // 2. The Crown Estate (Regional)
    const crownEstateSites = [
        'Aintree Shopping Park', 'Banbury Gateway', 'Coliseum Shopping Park',
        'Fosse Park', 'Gallagher Shopping Park', // Cheltenham specifically
        'MK1 Shopping', 'Ocean Retail Park', 'Queensgate Centre', // Harlow
        'Rushden Lakes', 'Silverlink', 'South Aylesford', 'Victoria Retail Park', // Nottingham
        'Westgate Oxford', 'The Gate Newcastle'
    ];

    // 3. Peel L&P
    const peelSites = [
        'Peel Centre', 'Stockport Retail Park', 'Straiton Retail Park',
        'Hyndburn Retail Park', 'Washington Retail Park', 'Corby Retail Park',
        'Yeovil Retail Park', 'Barnsley Retail Park'
    ];

    // 4. Landsec (Remaining/Strategic)
    const landsecSites = [
        'Bentley Bridge', 'Brighton Marina', 'Braintree Village',
        'Gunwharf Quays', 'Junction 32', // Sold to Frasers?
        'Clarks Village'
    ];

    // Helper to update by name match
    const updateOwner = async (sites: string[], owner: string, management?: string) => {
        console.log(`\nProcessing ${owner} Portfolio...`);
        for (const site of sites) {
            // Find fuzzy match
            const loc = await prisma.location.findFirst({
                where: {
                    type: 'RETAIL_PARK',
                    name: { contains: site, mode: 'insensitive' }
                }
            });

            if (loc) {
                // Don't overwrite if already set by higher fidelity script
                if (loc.owner && loc.owner !== owner) {
                    console.log(`⚠️  Conflict: ${loc.name} has owner "${loc.owner}". Keeping existing.`);
                    continue;
                }

                await prisma.location.update({
                    where: { id: loc.id },
                    data: {
                        owner: owner,
                        management: management || undefined,
                        isManaged: true
                    }
                });
                console.log(`✅ Enriched: ${loc.name} -> ${owner}`);
            } else {
                console.log(`❌ Not Found: ${site}`);
            }
        }
    };

    await updateOwner(britishLandSites, 'British Land', 'British Land');
    await updateOwner(crownEstateSites, 'The Crown Estate');
    await updateOwner(peelSites, 'Peel L&P', 'Peel L&P');
    await updateOwner(landsecSites, 'Landsec'); // Caution with disposals

    // 5. Specific Known Entities from Research
    console.log('\nProcessing Specific Strategic Updates...');

    // Hammerson Disposals -> Brookfield / Orion
    const brookfieldSites = ['Central Retail Park', 'Cleveland Retail Park', 'Cyfarthfa', 'Ravenhead', 'Telford Forge'];
    await updateOwner(brookfieldSites, 'Brookfield');

    // Realty Income (Fife Central etc)
    await updateOwner(['Fife Central'], 'Realty Income');

    console.log('\nPortfolio Sweep Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
