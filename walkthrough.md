# Walkthrough: Better Auth Migration

## Overview
We have successfully migrated from Clerk to a self-hosted **Better Auth** solution. This provides:
1.  **Custom Premium UI**: Fully branded Login/Signup pages using our Glassmorphism design system.
2.  **Granular RBAC**: Native support for `Regional Manager` and `Centre Manager` roles via the Organization plugin.
3.  **Data Sovereignty**: All user data now lives in your Postgres database.

## Changes Made
-   **Backend**: 
    -   Installed `better-auth`. 
    -   Updated Prisma Schema with `Session`, `Account`, `Organization` tables.
    -   Migrated `User` table to match new schema.
-   **Frontend**:
    -   Created `/login`, `/sign-up`, `/forgot-password` pages.
    -   Updated Navbar and Middleware.
-   **Data**:
    -   Migrated 3 users from Clerk.
    -   Created `scripts/assign-role.ts` helper.

## Verification Steps

### 1. Test Login (Migrated User)
Since passwords are not migrated:
1.  Go to `/login`.
2.  Click **"Forgot password?"**.
3.  Enter `mjcbeckett@gmail.com`.
4.  Check console (or email if configured) for magic link/reset token.
5.  Set new password and login.

### 2. Test Admin Access
1.  Login as `michael@costperdemo.com`.
2.  Navigate to `/dashboard`.
3.  (Optional) Run `npx tsx scripts/assign-role.ts michael@costperdemo.com ADMIN` to ensure global admin role if needed (though existing role was preserved).

### 3. Test RBAC (New Feature)
To assign a Centre Manager:
```bash
# First create an organization (manually or via UI later)
# Then:
npx tsx scripts/assign-role.ts newuser@example.com centre_manager "westwood-cross"
```

## Next Steps
-   Configure an email provider (Resend/SendGrid) in `src/lib/auth.ts` for real emails (currently using console/mock for dev).
-   Build the "Organization Switcher" UI for Regional Managers.
