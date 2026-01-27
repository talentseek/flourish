# Plan: Migrate Authentication (Clerk → Better Auth)

## Goal
Replace Clerk with a self-hosted **Better Auth** solution to gain granular control over roles (`Admin`, `Regional Manager`, `Centre Manager`) and data sovereignty, using the new `better-auth` skill.

## Context
-   **Current State**: Clerk handles auth. Prisma `User` table has basic `USER` | `ADMIN` roles.
-   **Target State**: Better Auth handles auth. Prisma schema expanded for Sessions/Accounts. Organization Plugin handles hierarchical roles.
-   **User Data**: ~2 active users to migrate (`michael`, `mjcbeckett`).

## Architecture Changes

### 1. Database Schema (Prisma)
-   **Add Tables**: `Session`, `Account`, `Verification`, `Organization`, `Member`, `Invitation`.
-   **Update User**: Align fields with Better Auth (e.g., `emailVerified`, `image`).
-   **Method**: Use `npx @better-auth/cli generate` (as per skill).

### 2. Role Strategy (Organization Plugin)
We will use the **Organization Plugin** to model the hierarchy:
-   **Global Admin**: Handled via `admin` plugin or root-level `role` field.
-   **Organizations**: Represent "Regions" or "Centres" (or a single "Flourish" org if multi-tenancy isn't strictly needed yet, but the plugin gives us the roles for free).
-   **Roles**:
    -   `Owner` (System Admin)
    -   `Regional Manager` (Custom Priority Role)
    -   `Centre Manager` (Custom Priority Role)
    -   `Member` (Standard User)

### 3. Auth Implementation
-   **Config**: `src/lib/auth.ts` with `prismaAdapter` + `organization` plugin.
-   **API**: `src/app/api/auth/[...all]/route.ts`.
-   **Client**: `src/lib/auth-client.ts` hook.

## Execution Phase

### Phase 1: Parallel Installation
- [ ] **Install**: `npm install better-auth` (See `installation.md`).
- [ ] **Env Vars**: Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- [ ] **Configure Config**: Create `src/lib/auth.ts` with Organization plugin.
- [ ] **Update Database**: Run `npx @better-auth/cli generate` & `prisma migrate dev`.

### Phase 2: Implementation
- [ ] **API Route**: Create the API handler.
- [ ] **Client Hook**: Create the React client.
- [ ] **Middleware**: Update `middleware.ts` to support Better Auth (initially alongside Clerk).
- [ ] **Login/Signup UI**: access default better-auth UI or build custom form.

### Phase 3: Data Migration (The "Lift")
- [ ] **Migration Script**: Create `scripts/migrate-clerk-users.ts`.
    -   Fetch Clerk users.
    -   Upsert into Prisma `User` table with correct IDs.
    -   **Note**: Passwords cannot be migrated. Users must reset or use magic link.
- [ ] **Assign Roles**: Manually assign `Regional Manager` roles to specific users in the DB.

### Phase 4: Switchover
- [ ] **Frontend**: Replace `<ClerkProvider>` with Better Auth provider.
- [ ] **Cleanup**: Remove Clerk dependencies and environment variables.

## Verification
-   **Manual Test**:
    1.  Run migration script.
    2.  Attempt login as `michael@costperdemo.com` (trigger password reset/magic link).
    3.  Verify Admin access.
    4.  Create a "Centre Manager" user and verify they *cannot* access Admin routes.
