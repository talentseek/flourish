# Plan: Create "Better Auth" Skill

## Goal
Create a new agent skill named `better-auth` that provides the agent with deep knowledge and workflows for implementing Better Auth in the Flourish application.

## Context
- **Target Stack**: Next.js + Prisma + TypeScript.
- **Specific Requirement**: Support for robust Role-Based Access Control (RBAC) (Admin, Regional Manager, Centre Manager) using Better Auth's **Organization Plugin**.
- **Migration**: Future goal is to migrate from Clerk to Better Auth.

## Skill Content
The skill will include:
1.  **Installation Guide**: `npm install better-auth @better-auth/cli`, env setup.
2.  **Prisma Adapter Scaffolding**: How to use the CLI to generate the schema.
3.  **Organization Plugin Setup**: Configuring the plugin for multi-role hierarchies.
4.  **Middleware Logic**: Protecting routes based on Better Auth sessions.
5.  **Client/Server Usage**: `authClient` hook usage and `auth.api` server-side calls.

## Execution Steps

### Phase 1: Skill Initialization
1.  Run the `skill-creator` init script:
    ```bash
    python .agent/skills/skill-creator/scripts/init_skill.py better-auth
    ```
2.  Verify directory structure is created in `.agent/skills/better-auth`.

### Phase 2: Knowledge Population
1.  **Update `SKILL.md`**:
    -   Define description, triggers (e.g., "setup better auth", "migrate auth").
    -   Add high-level usage instructions.
2.  **Create Reference Docs** (in `references/`):
    -   `installation.md`: Steps for Next.js + Prisma.
    -   `organization-plugin.md`: Guide on setting up Roles/Permissions.
    -   `migration-guide.md`: Conceptual guide for mapping Clerk users to Better Auth.

### Phase 3: Validation
1.  Run the validation script:
    ```bash
    python .agent/skills/skill-creator/scripts/validate_skill.py .agent/skills/better-auth
    ```

## Verification
-   **Manual**: Check the existence of the `SKILL.md` and reference files.
-   **Automated**: The `validate_skill.py` script output must return "SUCCESS".
