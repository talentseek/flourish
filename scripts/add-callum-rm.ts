
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCallumRM() {
    const email = 'callum@thisisflourish.co.uk';
    console.log(`🔍 Adding REGIONAL_MANAGER: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'REGIONAL_MANAGER', name: 'Callum Clifford' },
        create: {
            id: 'callum-rm-' + Date.now(),
            email,
            name: 'Callum Clifford',
            role: 'REGIONAL_MANAGER',
            emailVerified: true
        }
    });

    console.log(`✅ User ready: ${user.name} (${user.email}) - Role: ${user.role}`);
}

addCallumRM()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
