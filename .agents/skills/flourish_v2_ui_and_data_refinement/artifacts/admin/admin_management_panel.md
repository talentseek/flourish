# Flourish Admin Panel: Architecture & Implementation

## Overview
The Flourish Admin Panel replaces hardcoded JSON-based portfolio management with a scalable, database-driven interface. This allows Admins to manage the "Managed Portfolio," assign Regional Managers via RBAC, and oversee user roles directly within the dashboard.

## 1. Authentication & Security (RBAC)

### Route Protection
- **Target**: `/admin` and all sub-routes.
- **Implementation**: Strictly enforced in `src/app/admin/layout.tsx`.
- **Mechanism**: Uses `auth.api.getSession()` (server-side) from Better-Auth to verify the current user's tokens and roles.
- **Authorization**: If a user is not authenticated or lacks the `ADMIN` role, they are redirected to `/dashboard` or `/login`. This provides a reliable server-side guard for all admin sub-pages.

### Server-Side Verification Pattern
```tsx
const session = await auth.api.getSession({
  headers: await headers()
});

if (!session?.user || session.user.role !== 'ADMIN') {
  redirect("/dashboard")
}
```

## 2. Navigation
- **Location**: `src/components/app-sidebar.tsx`.
- **Logic**: Conditionally includes an "Admin" item in the `navItems` array based on the user's role.
- **Pattern**: Follows the [Prop-Passing Sidebar Pattern](../flourish_authentication_and_authorization/artifacts/better_auth_implementation.md#prop-passing-sidebar-pattern-rbac-navigation) to ensure the UI reflects permissions.

## 3. Core Features & Server Actions

All admin operations are implemented via Next.js Server Actions in `src/app/admin/actions.ts`, ensuring immediate database updates and cache revalidation.

### Location Management (`/admin/locations`)
- **Toggle Managed Protocol**: `toggleLocationManaged(locationId, isManaged)` updates the `isManaged` field in Prisma. This determines if a location appears in the "Managed Portfolio".
- **Regional Manager Assignment**: `assignRegionalManager(locationId, managerName)` updates the `regionalManager` string.
- **Advanced Filtering (Feb 2026)**:
    - **Search**: `getLocationsForAdmin` now supports multi-criteria matching across `name`, `city`, and `postcode` using case-insensitive `contains` filters.
    - **RM Filter**: An optional `regionalManagerFilter` parameter allows isolating portfolios by:
        - Specific Manager Name
        - "Managed Portfolio Only" (all `isManaged: true` locations)
        - "Unassigned (Managed)" (locations marked managed but missing an RM)

### User Role Management (`/admin/users`)
- **Role Modification**: `updateUserRole(userId, Role)` allows elevating or demoting users between `USER`, `ADMIN`, and `REGIONAL_MANAGER`.
- **Safety Check**: The `updateUserRole` action prevents demoting the last remaining Admin user to avoid a lockout.
- **Data Fetching**: `getUsersForAdmin()` lists all users ordered by role and creation date.

## 4. Transition Strategy
- **Stage 1 (Completed Feb 2026)**: Scaffold `/admin` route and layout guard.
- **Stage 2 (Completed Feb 2026)**: Implement Admin Actions for CRUD operations.
- **Stage 3 (Completed Feb 2026)**: Build out the Table UIs in `/admin/users` and `/admin/locations` using DataTable components.
- **Stage 4**: Deprecate JSON-based managers and point all dashboard analytics to the data-saturated `Location` model.

## 5. Troubleshooting & Build Lessons

### Build Failure: Missing shadcn Components
When implementing a new admin interface, verify that all shadcn/ui components used (e.g., `Switch`, `Table`, `Select`) are installed. 
- **Symptom**: `Module not found: Can't resolve '@/components/ui/switch'`
- **Fix**: Run `npx shadcn@latest add switch`.

### Redirect Loop: Missing 'role' in Session
- **Problem**: Admin users redirected to `/dashboard` when visiting `/admin`.
- **Cause**: By default, Better Auth sessions do not include custom Prisma fields like `role`. Accessing `session.user.role` returns `undefined`, triggering the redirect.
- **Solution (Preferred)**: Configure the `user.additionalFields` property in `src/lib/auth.ts` to explicitly include the `role` field in the session object.
- **Solution (Backup)**: Alternatively, use the [Explicit Prisma User Lookup Pattern](../flourish_authentication_and_authorization/artifacts/better_auth_implementation.md#explicit-prisma-user-lookup-pattern-rbac) to fetch the role from the database.

### Build Error: Dynamic Server Usage (headers)
- **Problem**: Build fails during static page generation with `Dynamic server usage: Page couldn't be rendered statically because it used headers`.
- **Cause**: The `auth.api.getSession` call requires `headers()` from `next/headers`, which marks the route as dynamic. Next.js attempts to pre-render routes at build time unless explicitly configured otherwise.
- **Resolution**: Use `export const runtime = 'nodejs';` or `export const dynamic = 'force-dynamic';` in the layout or page file to inform the compiler that the route must be rendered on-demand.

## 6. Persistence & Schema
- **Models**: `Location` and `User` models are the primary sources of truth.
- **Schema Readiness**: Utilizes existing `isManaged`, `regionalManager`, and `role` fields.
- **Revalidation**: Actions use `revalidatePath` to ensure live UI updates without manual refreshes.
