# Production Readiness Plan: Better Auth on Vercel

## Context
Migration from Clerk to Better Auth is complete locally. The goal is to deploy this to production (Vercel) using the existing database.

## User Constraints
- **Email:** Skip transactional email provider for now (keep mock/console logging or disable verification).
- **Platform:** Vercel (Push to GitHub).
- **Database:** Existing Postgres instance.

## 🔴 Critical Steps (Manual)
*These must be performed in the Vercel Dashboard project settings.*

1. **Generate Secret:** Run `openssl rand -base64 32` locally and save the output.
2. **Set Environment Variables:**
   - `BETTER_AUTH_SECRET`: [The generated secret]
   - `BETTER_AUTH_URL`: The production URL (e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_BASE_URL`: Same as `BETTER_AUTH_URL`

## Proposed Changes

### 1. Auth Configuration (`src/lib/auth.ts`)
- **Action:** Update `trustedOrigins` to support Vercel Preview URLs automatically.
- **Action:** Ensure Email Verification is explicitly disabled or handled gracefully since we are skipping the email provider.
- **Detail:** Better Auth requires `trustedOrigins` for cross-origin requests if Vercel Preview URLs are used.

### 2. Build Configuration (`package.json`)
- **Action:** Ensure `postinstall` includes `prisma generate` to prevent "Prisma Client not found" errors on Vercel. (Likely already there, but verified).

### 3. Cleanup
- **Action:** Double check for any hardcoded `localhost:3000` references in the code (besides dev config).

## Verification Plan

### Automated
1. **Lint Check:** Run `npm run lint` to ensure no build-blocking errors.
2. **Type Check:** Run `npm run type-check` (or `tsc --noEmit`).

### Manual (Post-Deployment)
1. **Prod Login:** Login with an existing user.
2. **Session Persistence:** Refresh page to ensure cookies stick on the production domain.
3. **Sign Out:** Verify sign-out redirects correctly on prod.

## Task Breakdown

### Phase 1: Configuration Support
- [ ] Update `src/lib/auth.ts` with Vercel-friendly `trustedOrigins`.
- [ ] Verify `package.json` build scripts.

### Phase 2: Pre-Flight Checks
- [ ] Scan codebase for hardcoded `localhost` URLs.
- [ ] Run Lint/Type checks locally.

### Phase 3: Deployment (User Action)
- [ ] User pushes to GitHub.
- [ ] User sets Env Vars in Vercel.
