require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

async function promoteToAdmin(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });

    // Update Clerk user's public metadata
    try {
      const clerkUser = await clerkClient.users.updateUser(user.id, {
        publicMetadata: { role: 'ADMIN' }
      });
      console.log(`✅ Clerk user metadata updated successfully!`);
    } catch (clerkError) {
      console.error('Error updating Clerk metadata:', clerkError);
      console.log('Note: You may need to set CLERK_SECRET_KEY in your environment');
    }

    console.log(`✅ User ${email} promoted to ADMIN successfully!`);
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Role: ${updatedUser.role}`);
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/promote-to-admin.js <email>');
  console.log('Example: node scripts/promote-to-admin.js michael@costperdemo.com');
  process.exit(1);
}

promoteToAdmin(email);
