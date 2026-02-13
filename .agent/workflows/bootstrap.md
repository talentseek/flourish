---
description: Bootstrap a new agent session with full codebase context. Run at session start to eliminate cold-start overhead.
---

# /bootstrap - Context Bootstrapper

## Purpose

Load curated codebase context into a new agent session so it can work immediately without re-discovering the project.

---

## Steps

// turbo-all

1. Read the context-bootstrapper skill for the inline project snapshot:
```
Read file: .agent/skills/context-bootstrapper/SKILL.md
```

2. Read the architecture reference for full directory map and tech stack:
```
Read file: .agent/skills/context-bootstrapper/references/architecture.md
```

3. Read the data model reference for Prisma schema understanding:
```
Read file: .agent/skills/context-bootstrapper/references/data-model.md
```

4. **(Task-specific)** Read additional references as needed:
   - API work → `.agent/skills/context-bootstrapper/references/api-surface.md`
   - UI work → `.agent/skills/context-bootstrapper/references/components.md`
   - Coding standards → `.agent/skills/context-bootstrapper/references/conventions.md`
   - Business context → `.agent/skills/context-bootstrapper/references/domain-context.md`

5. Confirm context loaded:
```
Tell the user: "Context bootstrapped. I understand the Flourish codebase — ready to work."
```

---

## Regenerating References

If the codebase has changed significantly, regenerate the auto-generated reference files:

```bash
python .agent/skills/context-bootstrapper/scripts/generate_context.py
```

This produces `_generated_*.md` files alongside the curated references for comparison.

---

## Usage

```
/bootstrap
```

No arguments needed. The agent reads all core references automatically.
