# Better Auth Production Readiness Checklist

To transition from the current development setup to a production-ready environment, the following changes and verifications are required.

## 1. Environment Variables
Ensure the following variables are set in your production environment (e.g., Vercel, Railway, or VPS):

- `BETTER_AUTH_URL`: Must be the full production URL (e.g., `https://flourish.ai`).
- `BETTER_AUTH_SECRET`: Generate a strong random string (e.g., using `openssl rand -base64 32`).
- `NEXT_PUBLIC_BASE_URL`: Same as `BETTER_AUTH_URL`.
- `DATABASE_URL`: Ensure the PostgreSQL connection string is correct and accessible.
- `VERCEL_URL`: Automatically provided by Vercel; used for preview URL logic.

> **Vercel Tip**: For Vercel Preview deployments, you must configure `trustedOrigins` in `src/lib/auth.ts` to allow `*.vercel.app` and use the `VERCEL_URL` environment variable.

## 2. Email Configuration (SMTP/API)
The current implementation in `src/lib/auth.ts` uses console logging as a mock for development.

**Current (Dev):**
```typescript
async sendResetPassword(url) {
  console.log("🔗 RESET PASSWORD LINK:", url);
}
```

**Production Action:**
Integrate an email provider (Resend, SendGrid, Mailgun).

**Example (using Resend):**
1. Install client: `pnpm add resend`
2. Update `src/lib/auth.ts`:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// In betterAuth config:
sendResetPassword: async ({ user, url }) => {
  await resend.emails.send({
    from: 'The Hive <auth@thehive.ai>',
    to: user.email,
    subject: 'Reset your password',
    html: `<a href="${url}">Click here to reset your password</a>`,
  });
},
```

## 3. Database Migrations
Verify that the Prisma schema for Better Auth is applied to the production database.
- Run `npx prisma migrate deploy` during your deployment pipeline.
- Double-check that tables for `Account`, `Session`, `User`, `Verification`, and `Organization` (if using plugins) exist.

## 4. HTTPS and Cookies
- Better Auth defaults to secure cookies in production. Ensure your site is served over HTTPS.
- **Cloudflare SSL**: If using Cloudflare, set SSL/TLS mode to **Full (strict)**. "Flexible" mode will cause `ERR_TOO_MANY_REDIRECTS`.

## 5. Cleaning Up Legacy Auth (Clerk)
- Ensure all `@clerk/*` environment variables are removed from the production dashboard.
- Confirm the `ClerkProvider` is removed from `layout.tsx`.

## 6. Route Verification
Confirm that the catch-all route `src/app/api/auth/[...all]/route.ts` is the only handler for `/api/auth`.
- Ensure no lingering directories like `api/auth/sign-out` exist in your production branch.

## 7. Build Verification
Before deploying, run a full production build locally (`npm run build`).
- **Common Fix**: Ensure JSX strings use entities like `&apos;` to satisfy the `react/no-unescaped-entities` rule.
