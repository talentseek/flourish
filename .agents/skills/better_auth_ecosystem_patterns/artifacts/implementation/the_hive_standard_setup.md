# Standard Better Auth Setup (The Hive)

"The Hive" uses a simplified Better Auth setup without the Organization plugin, optimized for a single admin managing a fleet of agents.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Adapter**: Prisma
- **Provider**: Email + Google OAuth (Ready)

## Environment Requirements
```env
BETTER_AUTH_SECRET="your-generated-secret"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Resolved Implementation Challenges
### 1. The Symbiosis Data Pattern
A common pattern in B2BEE projects is the "Symbiosis" grid showing case studies.
- **Initial Error**: Site used an `async` Server Component (`Symbiosis.tsx`) imported into the client-side `page.tsx`.
- **Solution**: 
  1. Refactor `Symbiosis.tsx` as a Client Component (`"use client"`).
  2. Implement `useState` and `useEffect` for data fetching.
  3. Create `/api/case-studies/route.ts` to execute the Prisma query and return JSON.

### 2. Terminal JSX Security
Components like `BossModeTerminal.tsx` using `>>>` prompts must escape the `>` characters to avoid JSX parse errors:
```tsx
<span className="text-hive-yellow">{'>'}{'>'}{'>'}</span>
```

### 3. Tailwind v4 Integration
The Hive uses Tailwind v4 with the `@tailwindcss/postcss` plugin. 
- **Pattern**: Use `@import "tailwindcss";` and `@config "../../tailwind.config.ts"` in `globals.css`.
- **Note**: IDE warnings for these directives are false positives.
