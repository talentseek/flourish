# Better Auth Ecosystem Patterns Overview

This Knowledge Item consolidates everything learned about implementing **Better Auth** across the B2BEE ecosystem (The Hive, Flourish, BuzzBook, BeeSocial).

## Navigation

### Implementation & Setup
- [Samples & Configurations](./implementation/samples_and_configurations.md): Core files, middleware, and helper functions.
- [Prisma Schema Requirements](./data/prisma_schema_requirements.md): Manual model declarations for User, Session, Account, etc.
- [The Hive (Standard Setup)](./implementation/the_hive_standard_setup.md): Non-multi-tenant setup details and specific B2BEE UI pattern fixes.

### Maintenance & Operations
- [Troubleshooting & Patterns](./maintenance/troubleshooting_and_patterns.md): Fixes for Vercel, SSL, custom fields, and build errors.
- [Clerk Migration Guide](./maintenance/clerk_migration_guide.md): Strategy for transitioning from legacy Clerk auth.
- [Production Readiness](./maintenance/production_readiness_checklist.md): Pre-deployment verification steps.

## Key Principles
1. **Prisma as Source of Truth**: Always use the Prisma adapter.
2. **Server-Side Verification**: Prefer `auth.api.getSession` in Server Components for security.
3. **Custom Field Sovereignty**: Use `additionalFields` to keep roles and attributes accessible in the session object.
4. **Hard Redirects**: Use `window.location.href` after sign-in to ensure cookie propagation.
