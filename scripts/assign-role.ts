
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function assignRole() {
    const [email, role, orgSlug] = process.argv.slice(2);

    if (!email || !role) {
        console.error('Usage: npx tsx scripts/assign-role.ts <email> <role> [orgSlug]');
        console.error('Roles: regional_manager, centre_manager, member, owner');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error(`User not found: ${email}`);
            process.exit(1);
        }

        if (orgSlug) {
            // Assign Organization Role
            const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
            if (!org) {
                console.error(`Organization not found: ${orgSlug}`);
                process.exit(1);
            }

            await prisma.member.create({
                data: {
                    id: uuidv4(),
                    organizationId: org.id,
                    userId: user.id,
                    role: role,
                    createdAt: new Date(),
                },
            });
            console.log(`Assigned ${role} to ${email} in ${orgSlug}`);

        } else {
            // Assign Global Role (if using admin plugin or just user.role)
            // Note: My schema has `role` on User for global roles.
            // But Better Auth core might use `admin` plugin for global admins.
            // Here I just update the User.role field if it matches the enum, 
            // OR I assume role is for Better Auth's internal role system if I had one.
            // Since `User.role` is an enum USER/ADMIN, I can map it.

            if (role.toUpperCase() === 'ADMIN') {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'ADMIN' }
                });
                console.log(`Global ADMIN assigned to ${email}`);
            } else {
                console.log("Global role assignment only supports ADMIN currently. Use orgSlug for org roles.");
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

assignRole();
