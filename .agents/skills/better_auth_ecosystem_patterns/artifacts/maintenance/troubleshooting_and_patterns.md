# Better Auth Troubleshooting & Patterns

## Build-Breaking JSX Errors
- **Symptom**: `Unexpected token. Did you mean '{'>'}' or '&gt;'?`
- **Cause**: Unescaped `>>` or `>>>` characters in JSX (e.g., in a terminal component).
- **Fix**: Wrap in expressions: `{'>'}{'>'}`.

## illegal Cross-Boundary Component Imports
- **Symptom**: Async Server Components performing Prisma calls crash when imported into a `"use client"` page.
- **Cause**: Next.js Server Components cannot be imported into Client Components directly.
- **Fix**: convert to a Client Component using `useEffect` fetching from an internal API route (e.g., `/api/data`).

## Production Deployment (Vercel)
- **Problem**: 401 Unauthorized after login or redirect loops.
- **Cause**: Missing `BETTER_AUTH_URL` or `NEXT_PUBLIC_BASE_URL` in Vercel.
- **Fix**: Ensure both variables point to the production domain. Note that `NEXT_PUBLIC_` variables require a redeploy to take effect.
- **Cookie Conflict**: Clear browser cookies if switching from Clerk to Better Auth.

## RBAC / Custom Fields
- **Problem**: `session.user.role` is undefined.
- **Cause**: Better Auth doesn't include custom fields in the session by default.
- **Fix**: Define `additionalFields` in `src/lib/auth.ts`:
```typescript
user: {
  additionalFields: {
    role: { type: "string", defaultValue: "USER" }
  }
}
```

## Prisma Sync Issues
- **Problem**: `prisma migrate` wants to reset the database.
- **Fix**: Use `npx prisma db push` for non-destructive schema updates, especially when adding Better Auth tables to an existing database.

## Method Not Allowed (405) on Sign-out
- **Cause**: Directory collision. If `src/app/api/auth/sign-out/` exists, it intercepts the call meant for the `[...all]` route.
- **Fix**: Delete the specific subdirectory; let the catch-all route handle it.
