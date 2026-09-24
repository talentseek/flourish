# Better Auth Migration Guide (from Clerk)

This guide details the strategic transition from Clerk to **Better Auth**.

## 1. Migration Overview
- **Strategy**: Parallel Integration (Clerk and Better Auth coexist during development).
- **Core Goal**: Granular RBAC and data sovereignty in a B2B SaaS environment.
- **Technology**: Better Auth with Prisma Adapter and Organization Plugin.

## 2. Implementation Phases

### Phase 1: Parallel Installation
- Dependencies: `better-auth`, `@better-auth/cli`.
- Environment: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BASE_URL`.
- Auth Instance: `src/lib/auth.ts` initialized.
- Schema: Manual fallback applied to `prisma/schema.prisma`.

### Phase 2: Data Migration
- Sync script: Fetch users from Clerk using the SDK and upsert them into Prisma.
- Password Handling: Migrated users MUST use "Forgot Password" to set their first Better Auth password.

### Phase 3: Custom UI Implementation
- Strategy: Custom Auth UI (pages/components) rather than pre-built components.
- Layout: Re-skin the auth flow to match the brand identity (e.g., Glassmorphism).

### Phase 4: Switchover & Cleanup
- Update Navigation: Point all sign-in/sign-up links to the new routes.
- Component Rewrite: Replace Clerk `UserButton` with a custom implementation using Better Auth hooks (`useSession`).
- Residual Cleanup: Remove `@clerk/nextjs` from `package.json` and delete legacy Clerk route directories.

## 3. Role Hierarchy (Organization Plugin)
Roles are scoped to Organizations:
- **Admin**: Global access.
- **Regional Manager**: Scoped higher-level management.
- **Centre Manager**: Scoped operational management.
- **Member**: Standard access.
