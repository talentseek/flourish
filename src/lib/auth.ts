import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { organization } from "better-auth/plugins";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: [
    "http://localhost:3000",
    // Add Vercel preview URLs regex or specific domains if needed
    // Better Auth might need specific configuration for wildcard subdomains
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
  ],

  plugins: [
    organization({
      roles: {
        regional_manager: {
          priority: 2,
        },
        centre_manager: {
          priority: 1,
        }
      }
    })
  ],
  // Mock email for development
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(url) {
      console.log("----------------------------------------");
      console.log("🔗 RESET PASSWORD LINK:");
      console.log(url);
      console.log("----------------------------------------");
    },
    async sendEmailVerification(url) {
      console.log("----------------------------------------");
      console.log("🔗 VERIFY EMAIL LINK:");
      console.log(url);
      console.log("----------------------------------------");
    }
  }
});
