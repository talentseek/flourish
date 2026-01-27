
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function fixAccounts() {
    console.log('🔧 Checking for users without accounts...');

    const users = await prisma.user.findMany({
        include: { accounts: true }
    });

    for (const user of users) {
        if (user.accounts.length === 0) {
            console.log(`Fixing user: ${user.email} (${user.id})`);

            // Create a placeholder 'credential' account
            // Better Auth 'email' provider typically uses providerId='credential' (check docs if 'email' is different)
            // Usually it is "credential" for email/password.

            await prisma.account.create({
                data: {
                    id: uuidv4(),
                    userId: user.id,
                    accountId: user.id, // usually specific to provider
                    providerId: "credential", // Critical for email/password auth
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });
            console.log(`✅ Created account for ${user.email}`);
        } else {
            console.log(`👌 User ${user.email} has ${user.accounts.length} accounts.`);
        }
    }
}

fixAccounts()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
