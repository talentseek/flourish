# Better Auth Implementation Samples

This document contains core implementation patterns and configuration for Better Auth across Next.js 14/15/16 environments.

## API Route (`src/app/api/auth/[...all]/route.ts`)
Standard catch-all handler for Better Auth endpoints.
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Auth Core Configuration (`src/lib/auth.ts`)
Central configuration using Prisma adapter and custom user fields.
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { organization } from "better-auth/plugins";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
  ],
  // Custom User Fields (Important for RBAC)
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
  emailAndPassword: {
    enabled: true,
    // ... email handlers (sendResetPassword, etc.)
  }
});
```

## Client React Hook (`src/lib/auth-client.ts`)
```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    plugins: [
        organizationClient()
    ]
});
```

## Middleware Handling (`src/middleware.ts`)
Session-based route protection.
```typescript
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/sign-up");

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}
```

## Account Fix Utility
Ensures all users have the mandatory `Account` record required by Better Auth.
```typescript
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function fixAccounts() {
  const users = await prisma.user.findMany({ include: { accounts: true } });
  for (const user of users) {
    if (user.accounts.length === 0) {
      await prisma.account.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
    }
  }
}
```
