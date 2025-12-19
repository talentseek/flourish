import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const location = await prisma.location.findFirst({ where: { name: 'Royals' } });
    if (!location) {
        console.log('Location not found');
        return;
    }

    const fields = Object.entries(location);
    const empty = fields.filter(([k, v]) => v === null || v === undefined || v === '');
    const filled = fields.filter(([k, v]) => v !== null && v !== undefined && v !== '');

    console.log('=== ROYALS - EMPTY FIELDS (need enrichment) ===\n');
    empty.forEach(([k]) => console.log('- ' + k));
    console.log('\n=== ROYALS - FILLED FIELDS ===\n');
    filled.forEach(([k, v]) => console.log(k + ': ' + JSON.stringify(v)));
}

main().then(() => prisma.$disconnect());
