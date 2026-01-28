
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Assigning Callum to priority locations...');

    const targets = [
        'Birchwood Shopping Centre',
        'Carters Square',
        'Chelmsley Wood Shopping Centre',
        'Cockhedge Shopping Park',
        'Ladysmith Shopping Centre',
        'Longton Exchange',
        'Lower Precinct Shopping Centre',
        'Central Square', // Maghull
        'The Mailbox',
        'Middleton Shopping Centre',
        'One Stop Shopping Centre',
        'The Strand Shopping Centre'
    ];

    for (const name of targets) {
        const result = await prisma.location.updateMany({
            where: {
                name: { contains: name, mode: 'insensitive' }
            },
            data: {
                isManaged: true,
                regionalManager: 'Callum'
            }
        });
        console.log(`Updated ${name}: ${result.count} records.`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
