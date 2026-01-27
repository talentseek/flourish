# Organization Plugin (Role Management)

## Purpose
Enables multi-tenancy and hierarchical roles (e.g., `Regional Manager`, `Centre Manager`).
Allows users to belong to multiple "Organizations" (which can model Regions or Centres) with specific roles in each.

## Setup

Update `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
    // ... adapter config
    plugins: [
        organization({
            // Optional: Define strict roles if needed, otherwise defaults are Owner, Admin, Member
            roles: {
                regional_manager: {
                    priority: 2, // Higher priority than member
                },
                centre_manager: {
                    priority: 1,
                }
            }
        }) 
    ]
});
```

*Remember to run `npx @better-auth/cli generate` after adding this plugin to update your schema!*

## Usage

### Client Side (`auth-client.ts`)
```typescript
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
     plugins: [
        organizationClient()
    ]
});

// Using the hook
const { 
    data: organizations, 
    listOrganizations, 
    setActiveOrganization 
} = authClient.useOrganization();
```

### Server Side (Protection)
```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function checkAccess() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    //Check active organization permissions
}
```
