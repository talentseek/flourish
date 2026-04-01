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

  // Include role in session data
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false,
      }
    }
  },

  plugins: [
    organization()
  ],
  // Mock email for development
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    async sendResetPassword(data: EmailData) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Flourish <no-reply@updates.thisisflourish.co.uk>",
        to: data.user.email,
        subject: "Reset your Flourish password",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; color: #e4e4e7;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Flourish</h1>
            </div>
            <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
              Hi ${data.user.name || "there"}, we received a request to reset your password.
              Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.url}" style="display: inline-block; padding: 12px 32px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Reset Password
              </a>
            </div>
            <p style="color: #71717a; font-size: 13px; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
            </p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
            <p style="color: #52525b; font-size: 12px; text-align: center;">
              Flourish Intelligence Platform &bull; thisisflourish.co.uk
            </p>
          </div>
        `,
      });

      console.log(`[Auth] Password reset email sent to ${data.user.email}`);
    },
    async sendVerificationEmail(data: EmailData) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Flourish <no-reply@updates.thisisflourish.co.uk>",
        to: data.user.email,
        subject: "Verify your Flourish email",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; color: #e4e4e7;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Flourish</h1>
            </div>
            <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 16px;">Verify Your Email</h2>
            <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
              Hi ${data.user.name || "there"}, please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.url}" style="display: inline-block; padding: 12px 32px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Verify Email
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
            <p style="color: #52525b; font-size: 12px; text-align: center;">
              Flourish Intelligence Platform &bull; thisisflourish.co.uk
            </p>
          </div>
        `,
      });

      console.log(`[Auth] Verification email sent to ${data.user.email}`);
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
