# Migration from Clerk to Better Auth

## Strategy
Migrating authentication is delicate. The strategy is "Parallel Integration" followed by "Switchover".

## Phase 1: Parallel Setup
1.  **Install Better Auth**: Set up the DB adapter and schema (as per `installation.md`).
2.  **Generate Migration Script**:
    -   You need a script to pull users from Clerk (via their API) and insert them into your local Prisma `User` table.
    -   *Constraint*: You **cannot** migrate passwords. Users will need to reset passwords via "Forgot Password" or use a magic link for their first login.

## Phase 2: Schema Mapping
Clerk User -> Prisma User

| Clerk Field | Prisma (Better Auth) Field |
|-------------|----------------------------|
| `id`        | `id` (Keep same ID if possible to preserve relations) |
| `emailAddresses[0].emailAddress` | `email` |
| `firstName` + `lastName` | `name` |
| `publicMetadata.role` | `role` (or map to Organization membership) |

## Phase 3: Switchover
1.  **Stop Signups**: Briefly pause signups on the live site.
2.  **Run Sync**: Execute your migration script (e.g., `scripts/sync-clerk-to-db.ts`).
3.  **Update Auth Logic**: Swap out `<ClerkProvider>` for your custom Auth Context provider.
4.  **Deploy**: Push the changes.
5.  **User Communication**: Tell users "We've upgraded our system. Please check your email to log in."

## Roles Migration
If using the **Organization Plugin**:
-   Map Clerk Organizations -> Better Auth Organizations.
-   Map Clerk Memberships -> Better Auth Members/Roles.
