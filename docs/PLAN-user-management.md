# User Management & Audit Plan

## Goal
Understand the current User Management architecture, identify existing users and roles, and prepare for potential enhancements (e.g., Admin Dashboard, User Audits).

## Context
- **Auth Provider**: Clerk (`@clerk/clerk-sdk-node` used in scripts).
- **Database**: PostgreSQL (Prisma).
- **User Model**: defined in `schema.prisma`.
  - Fields: `id`, `email`, `role`, `createdAt`, `updatedAt`.
  - Roles: `USER`, `ADMIN`.

## Current Findings

### Existing Users (Database Audit)
1.  **Michael** (`michael@costperdemo.com`)
    -   **Role**: `ADMIN`
    -   **Source**: Confirmed in Database + `scripts/fix-user.js`.
    -   **ID**: `user_31gU2BN0HpD8VIE4aglbJ1KgmR9`.
2.  **M Beckett** (`mjcbeckett@gmail.com`)
    -   **Role**: `USER`
    -   **Source**: Confirmed in Database.
    -   **ID**: `user_31gZtcppIStWn7DvHwQndYVMsF1`.

### Missing Users
-   **Paul Clifford**: Identified in `src/components/v2-team-section.tsx` but **NOT found** in the current database.


### Scripts
-   `scripts/fix-user.js`: **WARNING**. Deletes ALL users and recreates Michael. Useful for dev reset, dangerous for prod.
-   `scripts/promote-to-admin.js`: Promotes a user to ADMIN by email. Updates both Prisma DB and Clerk metadata.

## Proposed Tasks

### Phase 1: Verification & Data Integrity
- [x] Audit Codebase for User definitions.
- [x] **Verify Paul's Account**: checked database, confirmed he is **missing**.
- [ ] **Action**: Create account for Paul (need email address).
- [ ] **Role Audit**: Consider promoting `mjcbeckett@gmail.com` to ADMIN if needed.

### Phase 2: User Management Features (To Be Discussed)
- [ ] **Admin Dashboard**: Create a UI for listing users and changing roles (instead of using CLI scripts).
- [ ] **Sync Script**: Create a script to sync Clerk users to Prisma if they are missing (e.g., if a user signs up on Clerk but the webhook fails).

## Open Questions
-   What is Paul's email address for the system?
-   Do we want to hardcode other team members in a `seed.ts` file to ensure they always have access in Dev/Staging?
