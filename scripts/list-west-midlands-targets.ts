
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WEST_MIDLANDS_TERMS = [
    // Counties
    "West Midlands", "Staffordshire", "Warwickshire", "Shropshire", "Worcestershire", "Herefordshire",
    // Cities/Towns
    "Birmingham", "Coventry", "Wolverhampton", "Solihull", "Sutton Coldfield", "Dudley",
    "West Bromwich", "Walsall", "Stoke-on-Trent", "Stoke", "Stafford", "Lichfield", "Tamworth",
    "Cannock", "Burton upon Trent", "Nuneaton", "Rugby", "Leamington Spa", "Warwick",
    "Stratford-upon-Avon", "Shrewsbury", "Telford", "Worcester", "Redditch", "Kidderminster",
    "Hereford", "Bromsgrove", "Stourbridge", "Halesowen"
];

async function main() {
    console.log("🔍 Listing West Midlands Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...WEST_MIDLANDS_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...WEST_MIDLANDS_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
