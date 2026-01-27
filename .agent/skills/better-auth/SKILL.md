---
name: better-auth
description: |
  Comprehensive guide for implementing Better Auth in Next.js applications using Prisma.
  Includes installation, Prisma schema generation, Organization plugin setup for RBAC, and migration guidance.
  Triggers: "setup better auth", "install better auth", "migrate to better auth", "add better auth", "better-auth".
---

# Better Auth Implementation Guide

> **Goal:** Implement robust, type-safe authentication with Role-Based Access Control (RBAC) using Better Auth.

## Core Capabilities
1.  **Installation**: Setup in Next.js App Router with Prisma.
2.  **Schema Management**: Using `@better-auth/cli` to auto-generate Prisma schemas.
3.  **Role Management**: Implementing tiered roles (Admin, Regional Manager, Centre Manager) via the Organization Plugin.
4.  **Migration**: Moving from other providers (e.g., Clerk) to Better Auth.

## Quick Start

### 1. Installation
Run the following to install the core package and CLI:
```bash
npm install better-auth
npm install @better-auth/cli --save-dev
```
See [installation.md](references/installation.md) for full setup instructions including environment variables.

### 2. Database Adapter (Prisma)
Better Auth requires a specific Prisma schema. **Do not manually create this.**
Use the CLI to generate it based on your config:
```bash
npx @better-auth/cli generate
```
See [prisma-adapter.md](references/prisma-adapter.md) for details.

### 3. Role Management (Organization Plugin)
For managing Admins, Regional Managers, and Centre Managers, use the **Organization Plugin**.
See [organization-plugin.md](references/organization-plugin.md) for configuration and usage.

### 4. Migration from Clerk
See [migration-guide.md](references/migration-guide.md) for mapping users and strategies.
