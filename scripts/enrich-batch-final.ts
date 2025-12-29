import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    console.log('=== APPLYING NAME CORRECTIONS ===\n');

    // Rename Penicuick to Penicuik
    const penicuik = await prisma.location.updateMany({
        where: { name: 'Penicuick' },
        data: { name: 'Penicuik Shopping Centre' }
    });
    if (penicuik.count > 0) console.log('✅ Renamed: "Penicuick" → "Penicuik Shopping Centre"');

    // Rename Totten to Totton
    const totton = await prisma.location.updateMany({
        where: { name: 'Totten Shopping Centre' },
        data: { name: 'Totton Shopping Centre' }
    });
    if (totton.count > 0) console.log('✅ Renamed: "Totten Shopping Centre" → "Totton Shopping Centre"');

    // Rename St Stephens Place Plympton to The Ridgeway, Plympton
    const ridgeway = await prisma.location.updateMany({
        where: { name: 'St Stephens Place Plympton' },
        data: { name: 'The Ridgeway, Plympton' }
    });
    if (ridgeway.count > 0) console.log('✅ Renamed: "St Stephens Place Plympton" → "The Ridgeway, Plympton"');

    console.log('\n=== ENRICHING FINAL BATCH (#52-61) ===\n');

    const updates = [
        {
            name: 'Parc-t-Lyn Retail Park',
            data: {
                website: 'https://parc-y-llyn-retail-park.wheree.com',
                city: 'Aberystwyth',
                county: 'Ceredigion',
                openingHours: {
                    Monday: '08:00-20:00',
                    Tuesday: '08:00-20:00',
                    Wednesday: '08:00-20:00',
                    Thursday: '08:00-20:00',
                    Friday: '08:00-20:00',
                    Saturday: '08:00-20:00',
                    Sunday: 'Varies'
                },
                anchorTenants: 3, // Morrisons, B&M, Currys
            }
        },
        {
            name: 'Penicuik Shopping Centre',
            data: {
                city: 'Penicuik',
                county: 'Midlothian',
                parkingSpaces: 96,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 3, // B&M, Farmfoods, Greggs
            }
        },
        {
            name: 'Rotherham Retail Park',
            data: {
                city: 'Rotherham',
                county: 'South Yorkshire',
                openingHours: {
                    Monday: '09:00-20:00',
                    Tuesday: '09:00-20:00',
                    Wednesday: '09:00-20:00',
                    Thursday: '09:00-20:00',
                    Friday: '09:00-20:00',
                    Saturday: '09:00-20:00',
                    Sunday: 'Varies'
                },
                anchorTenants: 3, // The Range, Currys, Smyths Toys
                // Note: S60 1RP is "The Foundry" or "Great Eastern", not Parkgate (S62)
            }
        },
        {
            name: 'The Ridgeway, Plympton',
            data: {
                city: 'Plympton',
                county: 'Devon',
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                // Parking: Mudge Way Car Park (Free for 3 hours)
            }
        },
        {
            name: 'The Centre Margate, ',
            data: {
                city: 'Margate',
                county: 'Kent',
                parkingSpaces: 432, // Mill Lane Multi-storey
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                anchorTenants: 3, // Peacocks, Boots, Card Factory
            }
        },
        {
            name: 'The Forge,Retail Park ',
            data: {
                website: 'https://parkme.com/telford-forge',
                city: 'Telford',
                county: 'Shropshire',
                parkingSpaces: 1300,
                openingHours: {
                    Monday: '09:00-20:00',
                    Tuesday: '09:00-20:00',
                    Wednesday: '09:00-20:00',
                    Thursday: '09:00-20:00',
                    Friday: '09:00-20:00',
                    Saturday: '09:00-20:00',
                    Sunday: 'Varies'
                },
                anchorTenants: 3, // Sainsbury's, TK Maxx, The Range
            }
        },
        {
            name: 'The Shires, Trowbridge',
            data: {
                website: 'https://shirescentre.co.uk',
                city: 'Trowbridge',
                county: 'Wiltshire',
                parkingSpaces: 1000,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/TheShiresTrowbridge',
            }
        },
        {
            name: 'The Strand, Bootle',
            data: {
                website: 'https://strandshoppingcentre.com',
                city: 'Bootle',
                county: 'Merseyside',
                parkingSpaces: 500,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:00-16:00'
                },
            }
        },
        {
            name: 'Totton Shopping Centre',
            data: {
                city: 'Totton',
                county: 'Hampshire',
                parkingSpaces: 120, // Westfield Car Park
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
            }
        },
        {
            name: 'Windsor Royal',
            data: {
                website: 'https://windsorroyal.co.uk',
                city: 'Windsor',
                county: 'Berkshire',
                openingHours: {
                    Monday: '09:30-18:00',
                    Tuesday: '09:30-18:00',
                    Wednesday: '09:30-18:00',
                    Thursday: '09:30-18:00',
                    Friday: '09:30-18:00',
                    Saturday: '09:30-18:00',
                    Sunday: '11:00-17:00'
                },
                instagram: 'https://www.instagram.com/windsorroyal',
                // Premium station conversion, high tourist footfall
            }
        }
    ];

    for (const update of updates) {
        try {
            const result = await prisma.location.updateMany({
                where: { name: update.name },
                data: update.data
            });

            if (result.count > 0) {
                console.log(`✅ Updated: ${update.name} (${result.count} record(s))`);
            } else {
                console.log(`⚠️  Not found: ${update.name}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${update.name}:`, error);
        }
    }

    console.log('\n=== REMAINING FLAGS ===\n');
    console.log('⚠️  #48 Ladysmith Newcastle under lyme - Still awaiting client clarification');
    console.log('⚠️  #50 Naunton Fitzwarren Taunton - Still awaiting client clarification');
    console.log('⚠️  #40 Beacon Place (Exeter) - Likely data error (Community Centre, not shopping mall)');

    // Final count
    console.log('\n=== FINAL VERIFICATION ===\n');

    const managed = await prisma.location.count({ where: { isManaged: true } });
    console.log(`Total managed locations: ${managed}`);

    const enriched = await prisma.location.count({
        where: {
            isManaged: true,
            openingHours: { not: null }
        }
    });
    console.log(`Locations with opening hours: ${enriched}`);
}

enrichLocations()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
