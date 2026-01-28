
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignRole() {
    const email = 'giorgia@thisisflourish.co.uk';
    console.log(`🔍 Assigning REGIONAL_MANAGER role to ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        // If user doesn't exist, we can create a placeholder or just warn
        // Assuming for now she might log in later or we need to upsert.
        // Let's try upsert to ensure she exists.
        const newUser = await prisma.user.upsert({
            where: { email },
            update: { role: 'REGIONAL_MANAGER' },
            create: {
                id: 'giorgia-rm-' + Date.now(),
                email,
                name: 'Giorgia Shepherd',
                role: 'REGIONAL_MANAGER',
                emailVerified: true
            }
        });
        console.log(`✅ Role assigned/User created: ${newUser.name} (${newUser.role})`);
    } else {
        // Update existing
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'REGIONAL_MANAGER' }
        });
        console.log(`✅ User updated: ${updatedUser.name} is now ${updatedUser.role}`);
    }
}

assignRole()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
