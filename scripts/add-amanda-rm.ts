
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAmandaRM() {
    const email = 'amanda@thisisflourish.co.uk';
    console.log(`🔍 Adding REGIONAL_MANAGER: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'REGIONAL_MANAGER', name: 'Amanda Bishop' },
        create: {
            id: 'amanda-rm-' + Date.now(),
            email,
            name: 'Amanda Bishop',
            role: 'REGIONAL_MANAGER',
            emailVerified: true
        }
    });

    console.log(`✅ User ready: ${user.name} (${user.email}) - Role: ${user.role}`);
}

addAmandaRM()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
