
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NE_NI_TERMS = [
    // North East
    "Newcastle", "Sunderland", "Durham", "Middlesbrough", "Gateshead", "Darlington",
    "Hartlepool", "Stockton", "Northumberland", "Tyne and Wear", "Redcar", "Cleveland",
    "South Shields", "Washington", "Peterlee", "Bishop Auckland", "Consett", "Newton Aycliffe",

    // Northern Ireland
    "Belfast", "Derry", "Londonderry", "Lisburn", "Newry", "Armagh", "Bangor",
    "Antrim", "Down", "Fermanagh", "Tyrone", "Omagh", "Craigavon", "Ballymena",
    "Newtownards", "Carrickfergus", "Coleraine", "Larne", "Enniskillen", "Strabane"
];

async function main() {
    console.log("🔍 Listing North East & NI Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...NE_NI_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...NE_NI_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } })),
                ...NE_NI_TERMS.map(t => ({ address: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations associated with North East & NI.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
