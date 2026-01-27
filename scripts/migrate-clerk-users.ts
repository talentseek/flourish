
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function migrate() {
    console.log('🔄 Starting Clerk -> Better Auth User Migration...');

    try {
        const userList = await clerk.users.getUserList({ limit: 100 });
        console.log(`Found ${userList.data.length} users in Clerk.`);

        for (const clerkUser of userList.data) {
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) {
                console.warn(`⚠️ Skipping user ${clerkUser.id} (no email)`);
                continue;
            }

            const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown';
            const image = clerkUser.imageUrl;

            console.log(`Migrating: ${email} (${clerkUser.id})`);

            // Upsert user to preserve ID if possible or use Clerk ID as ID
            await prisma.user.upsert({
                where: { email },
                update: {
                    name,
                    emailVerified: true, // Clerk emails are usually verified if they are here
                    image,
                    // Keep existing role if it exists, otherwise defaults to USER
                },
                create: {
                    id: clerkUser.id, // Use Clerk ID for consistency if possible, assuming it fits String @id
                    email,
                    name,
                    emailVerified: true,
                    image,
                    role: 'USER', // Default role
                },
            });
        }

        console.log('✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
