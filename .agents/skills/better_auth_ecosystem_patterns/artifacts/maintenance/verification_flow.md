# Verification Flow: Better Auth Implementation

## 1. Login Verification (Migrated Users)
Users migrated from Clerk do not have passwords in the local database. They MUST use the "Forgot Password" flow initially.

**Steps:**
1. Navigate to `/login`.
2. Select **"Forgot password?"**.
3. Enter the email and verify via server logs:
   - **Evidence**: `🔗 RESET PASSWORD LINK` in the server terminal verifies the `emailAndPassword.sendResetPassword` mock is active.
4. **End-to-End Verification**:
   - Navigate to the magic link generated in the logs.
   - Enter a new password and submit.
   - Verify that the system redirects to `/login` upon success, and that the new password allows authentication.

## 2. Admin Access Verification
1. Log in as an admin user.
2. Verify access to specialized routes (e.g., `/admin` or `/dashboard`).
3. If access is denied, run an `assign-role` script or update the database directly to ensure the role is set.

## 3. RBAC & Organization Verification
1. Assign a user to an organization.
2. Log in as that user and verify that organization-specific data is accessible.
3. Verify that the sidebar adapts (e.g., shows/hides links based on the role).

## 4. Middleware Protection
1. Log out.
2. Attempt to navigate directly to a protected route (e.g., `/dashboard`).
3. Verify that the middleware redirects you to `/login`.
4. Log in and attempt to navigate to `/login`.
5. Verify that you are redirected back to the dashboard.

## 5. Build & Deployment Verification
1. Run `grep -r "@clerk" src` to ensure all legacy imports have been removed.
2. Run `rm -rf .next` to clear stale build artifacts and type definitions.
3. Run `npm run build` locally to catch any TypeScript property errors on the `session` object.
4. Verify that `NEXT_PUBLIC_BASE_URL` is correctly configured in the environment.
