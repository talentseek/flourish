require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUser() {
  try {
    // Delete any existing users to clean up
    await prisma.user.deleteMany();
    console.log('✅ Cleared all users');

    // Create the current user as admin
    const user = await prisma.user.create({
      data: {
        id: 'user_31gU2BN0HpD8VIE4aglbJ1KgmR9',
        email: 'michael@costperdemo.com',
        role: 'ADMIN'
      }
    });

    console.log('✅ Created user:', user);
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('Error fixing user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();
