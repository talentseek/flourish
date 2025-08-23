import { prisma } from "./db";

export async function syncUserToDatabase(userId: string, email: string, role: string = "USER") {
  try {
    // First check if user exists by ID
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: userId },
        data: { email, role: role.toUpperCase() as any },
      });
      console.log(`✅ User updated in database: ${email}`);
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          id: userId,
          email,
          role: role.toUpperCase() as any,
        },
      });
      console.log(`✅ User created in database: ${email}`);
    }
  } catch (error) {
    console.error(`❌ Failed to sync user: ${email}`, error);
    throw error;
  }
}
