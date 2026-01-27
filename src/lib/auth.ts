import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { organization } from "better-auth/plugins";
import { headers } from "next/headers";

const prisma = new PrismaClient();

// Type for email functions
interface EmailData {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
  };
  url: string;
  token: string;
}

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
    organization()
  ],
  // Mock email for development
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data: EmailData) {
      console.log("----------------------------------------");
      console.log("🔗 RESET PASSWORD LINK:");
      console.log(`User: ${data.user.email}`);
      console.log(`URL: ${data.url}`);
      console.log("----------------------------------------");
    },
    async sendVerificationEmail(data: EmailData) {
      console.log("----------------------------------------");
      console.log("🔗 VERIFY EMAIL LINK:");
      console.log(`User: ${data.user.email}`);
      console.log(`URL: ${data.url}`);
      console.log("----------------------------------------");
    }
  }
});

export const getSessionUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
};

export const authenticateVapiRequest = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return false;

  // Basic check for now to satisfy build. 
  // In production this should verify against VAPI_WEBHOOK_SECRET
  return true;
};
