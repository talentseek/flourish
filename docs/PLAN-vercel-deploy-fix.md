# PLAN: Vercel Deployment Fix - Better Auth Migration Cleanup

## Problem Statement

The Flourish application is failing to build on Vercel after migrating from Clerk to Better Auth. Multiple iterative fixes have been pushed but each build reveals new type errors. A comprehensive fix is needed.

## Root Cause Analysis

### Issue 1: `auth.ts` - Incorrect Function Signatures
**File:** `src/lib/auth.ts`
**Error:** `sendResetPassword` and `sendEmailVerification` have wrong parameter types.

Better Auth expects:
```typescript
async sendResetPassword(data: { user: {...}; url: string; token: string; }) => Promise<void>
```

Current incorrect code:
```typescript
async sendResetPassword(url: string) { ... }
```

**Fix:** Update function signatures to accept `data` object and extract `url` from it.

### Issue 2: Stale `.next` Cache
**Error:** `Cannot find module '.../sign-out/route.js'`
**Cause:** Stale TypeScript types in `.next/types` referencing deleted files.
**Fix:** Add `rm -rf .next` to build script to ensure clean builds.

---

## Implementation Plan

### Task 1: Fix `auth.ts` Email Function Signatures
- [ ] Update `sendResetPassword` to accept `{ user, url, token }` object
- [ ] Update `sendEmailVerification` to accept `{ user, url, token }` object
- [ ] Extract `url` from data object in function body

### Task 2: Clean Build Script
- [ ] Update `package.json` build script to clear `.next` cache before building

### Task 3: Verification
- [ ] Run `npx tsc --noEmit` locally to verify zero type errors
- [ ] Run `npm run build` locally to verify successful production build
- [ ] Push to GitHub and verify Vercel build succeeds

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/auth.ts` | Fix email function signatures |
| `package.json` | Add cache clear to build script |

---

## Verification Checklist

- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npm run build` completes successfully
- [ ] Vercel deployment succeeds
- [ ] Login flow works on production
- [ ] Sign-out flow works on production

---

## Estimated Time
15 minutes for implementation + verification
