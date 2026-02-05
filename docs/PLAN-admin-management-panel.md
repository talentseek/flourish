# PLAN: Flourish Admin Panel & Managed Portfolio Scaling

## Goal
Replace the hardcoded JSON-based regional management with a scalable Database-driven Admin Panel. This will empower Admin users to manage the "Managed Portfolio," assign Regional Managers, and maintain user roles directly through the UI.

## Technical Requirements

### 1. Schema & Data Strategy
*   **Location Model**: Utilize existing `isManaged` (Boolean) and `regionalManager` (String) fields.
*   **User Model**: Ensure `role` (Role Enum: USER, ADMIN, REGIONAL_MANAGER) is correctly enforced.
*   **Transition**: Migrate existing management data from `enrichment_targets.json` or similar into the Prisma database.

### 2. Admin UI (Restricted Access)
*   **Route**: `/admin` (and sub-routes).
*   **Guard**: Use `middleware.ts` and `Better-Auth` session checks to ensure ONLY users with `role: ADMIN` can access.
*   **Navigation**: Add an "Admin" link to the primary sidebar/nav, visible only to authorized users.

### 3. Core Admin Features (Full CRUD)
*   **Managed Portfolio Dashboard**:
    *   List all locations where `isManaged: true`.
    *   Toggle `isManaged` status for any location in the database (Add/Remove from portfolio).
*   **Regional Manager Management**:
    *   View all users with `role: REGIONAL_MANAGER`.
    *   Elevate standard Users to Regional Manager role.
    *   Assign/Reassign a Regional Manager to any 'isManaged' location via a dropdown.
*   **Location Search/Add**:
    *   Ability to search the full database of locations and "import" them into the managed portfolio.

## Technical Stack
*   **Framework**: Next.js 14+ (App Router).
*   **Auth**: Better-Auth.
*   **Database**: Prisma (PostgreSQL).
*   **UI Components**: Shadcn/UI (Table, Dialog, Select, Switch).

## Antigravity Execution Prompt
*See the main chat for the final prompt.*
