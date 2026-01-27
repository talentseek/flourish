# Better Auth Installation (Next.js + Prisma)

## Prerequisites
-   Next.js App Router project
-   Prisma set up with a database connection

## Step 1: Install Dependencies
```bash
npm install better-auth
npm install @better-auth/cli --save-dev
```

## Step 2: Environment Variables
Add these to your `.env` file:
```env
BETTER_AUTH_SECRET=your_generated_secret # Generate with `openssl rand -base64 32`
BETTER_AUTH_URL=http://localhost:3000 # Your base URL
```

## Step 3: Create Auth Instance
Create `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or mysql, sqlite, etc.
    }),
    emailAndPassword: {  
        enabled: true,
    },
    // Add plugins here (see organization-plugin.md)
});
```

## Step 4: API Route
Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth"; // import your auth instance
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Step 5: Client Hook
Create `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL // or hardcode http://localhost:3000
});
```
