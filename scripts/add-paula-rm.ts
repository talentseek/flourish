
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPaulaRM() {
    const email = 'paula@thisisflourish.co.uk';
    console.log(`🔍 Assigning REGIONAL_MANAGER role to: ${email}...`);

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'REGIONAL_MANAGER' }
    });

    console.log(`✅ User updated: ${user.name} (${user.email}) - Role: ${user.role}`);
}

addPaulaRM()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
