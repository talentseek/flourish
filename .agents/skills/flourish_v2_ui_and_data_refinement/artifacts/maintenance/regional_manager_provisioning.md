# Regional Manager Provisioning Workflow

This guide details the steps required to add a new Regional Manager (RM) to the Flourish platform and ensure they have access to their managed portfolio.

## 1. Directory Update (`src/data/location-managers.json`)

The first step is ensuring the manager is listed in the master location managers directory. This file is used for display purposes on public and dashboard location pages.

- **Check**: Verify if the manager exists. If not, add a new entry or update existing entries with the correct name and email.
- **Fields**:
  - `Regional Manager`: Full Name (e.g., "Amanda Bishop").
  - `RM Email`: Corporate Email (e.g., "amanda@thisisflourish.co.uk").
  - `RM Telephone`: Contact Number.

## 2. Location Portfolio Assignment

Locations are assigned to managers based on the `regionalManager` field in the `Location` model. 

- **Data Sync**: The data in `src/data/location-managers.json` should match the database state. If the database was recently updated from a different source, use a script to reconcile the `regionalManager` names with the names used in the manager's user profile.
- **Match Requirement**: The filtering logic in `src/actions/regional-data.ts` and `src/app/api/chat/route.ts` uses `prisma.location.findMany({ where: { regionalManager: user.name } })`. **The name in the Location record must exactly match the User name.**

## 3. User Account Creation & Role Assignment

Managers must have a user account with the `REGIONAL_MANAGER` role to access the /dashboard/regional route.

### Automatic (Onboarding)
Standard users who sign up via common auth paths are created with the `USER` role. They must be manually promoted.

### Admin Panel (Preferred Method)
The most efficient way to manage users and portfolios is via the **Admin Panel** at `/admin`.

1. **Promote User**: Go to `/admin/users` and change the user's role to `REGIONAL_MANAGER`.
2. **Assign Portfolio**: Go to `/admin/locations`, find the target location, toggle **Managed** to ON, and select the manager from the dropdown.

This method handles database updates and revalidation automatically.

### Manual Provisioning Script (Legacy/Dev)
Use the `scripts/assign-regional-manager.ts` utility (or specific naming patterns like `scripts/add-amanda-rm.ts`, `scripts/add-paula-rm.ts`, or `scripts/add-callum-rm.ts`) if direct script execution is required in development.

**Script Logic (Upsert Pattern):**
```typescript
const email = 'user@thisisflourish.co.uk';
const name = 'Manager Name';

const newUser = await prisma.user.upsert({
    where: { email },
    update: { 
        role: 'REGIONAL_MANAGER',
        name: name // Ensure name matches regionalManager field in Location model
    },
    create: {
        id: 'rm-' + Date.now(),
        email,
        name,
        role: 'REGIONAL_MANAGER',
        emailVerified: true
    }
});
```

> [!TIP]
> **Promoting Existing Users**: If a user already exists with the `USER` role (e.g. they signed up via the public portal), the `upsert` pattern safely promotes them to `REGIONAL_MANAGER` and ensures their `name` is correctly set for portfolio matching.

## 4. Account Claiming

Once the user is created in the database, the manager can "claim" their account using the **Forgot Password** flow on the login page.

1. Go to `/forgot-password`.
2. Enter corporate email.
3. Use the reset link (sent via email in production or logged to terminal in development) to set a password.
4. Log in at `/login`.

## 5. Verification

To verify the provisioning is successful:
1. Log in as the new manager.
2. Navigate to `/dashboard/regional`.
3. Verify that the "Managed Portfolio" list shows the correct locations.
4. Verify that the "Regional Assistant" (AI Chat) can correctly reference the portfolio data.

## 6. Common Issues

- **Empty Dashboard (The "Callum" Case)**: Usually caused by a string mismatch between `Location.regionalManager` and `User.name`. 
    - *Example*: If the database locations use `"Callum"` but the user was created as `"Callum Clifford"`, the dashboard will show 0 locations. 
    - *Fix*: Update the `User.name` in the database to match the exact string found in the `Location` table.
- **403 Forbidden**: Role was not assigned correctly. Check the `User.role` field using `npx prisma studio` or via a script.
- **Login Loop**: Often an environment variable issue with `BETTER_AUTH_URL` or `NEXT_PUBLIC_BASE_URL` in production (see [Troubleshooting](../backend/auth/better_auth_troubleshooting.md)).
