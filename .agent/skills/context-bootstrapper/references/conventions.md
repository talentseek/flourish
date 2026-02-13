# Coding Conventions

## File Naming
- **Components:** kebab-case files, PascalCase exports (`location-details.tsx` → `LocationDetails`)
- **Utilities:** kebab-case (`enrichment-metrics.ts`)
- **Scripts:** kebab-case, verb-first (`enrich-batch-1.ts`, `audit-managed-locations.ts`)
- **API routes:** `route.ts` inside directory matching the URL path

## Server vs Client Components
- **Default:** Server Components (no directive needed)
- **Client:** Add `"use client"` at top when using hooks, browser APIs, or event handlers
- **Pattern:** Server component fetches data via Prisma → passes serialised props to client component
- **Common suffix:** Client-side feature components often named `*-client.tsx`

## Data Fetching
- **Server components:** Direct Prisma queries (no API calls)
- **Client components:** `fetch('/api/...')` for dynamic data
- **Prisma singleton:** Import from `@/lib/db` (`import { prisma } from "@/lib/db"`)
- **Decimal→number:** Always convert Prisma `Decimal` to `number` before passing to React

```typescript
// Standard Prisma → React conversion
const locations = (await prisma.location.findMany()).map(loc => ({
  ...loc,
  latitude: Number(loc.latitude),
  longitude: Number(loc.longitude),
  healthIndex: loc.healthIndex ? Number(loc.healthIndex) : null,
}));
```

## Styling
- **Framework:** Tailwind CSS 3.3 classes in JSX
- **Utility:** `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- **Theme:** CSS custom properties in `:root` and `.dark` for dark/light mode
- **Components:** shadcn/ui components from `@/components/ui/*`
- **Animations:** `tailwindcss-animate` plugin

```typescript
import { cn } from "@/lib/utils"
<div className={cn("p-4 rounded-lg", isActive && "bg-primary")} />
```

## Import Aliases
- `@/` maps to `src/` (configured in `tsconfig.json`)
- `@/components/ui/button` — shadcn/ui primitives
- `@/lib/db` — Prisma client
- `@/lib/auth` — BetterAuth server
- `@/lib/auth-client` — BetterAuth client

## Auth Patterns

### Server-side session check
```typescript
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const session = await auth.api.getSession({ headers: headers() })
if (!session) redirect("/login")
```

### Client-side auth
```typescript
import { authClient } from "@/lib/auth-client"

const { data: session } = authClient.useSession()
```

### Role check
```typescript
if (session.user.role !== "ADMIN") redirect("/dashboard")
```

## API Route Patterns

```typescript
// Standard API route structure
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const data = await prisma.location.findMany()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
```

## Scripts
- **Runtime:** TypeScript scripts run with `tsx` (e.g., `pnpm tsx scripts/enrich-batch-1.ts`)
- **Python scripts:** For web scraping (`crawl4ai_scraper.py`, `playwright_openai_scraper.py`)
- **Pattern:** Scripts import `prisma` from relative path and run as standalone processes
- **Idempotent:** Most enrichment scripts use `upsert` or check-before-write patterns

## Error Handling
- API routes: try/catch with `NextResponse.json({ error }, { status })` 
- Server components: `notFound()` or `redirect()` from `next/navigation`
- Toast notifications: `sonner` library for client-side feedback
