---
name: skill-creator
description: Guide for creating new skills within the .agent framework. Use when users want to create, update, or extend skills that add specialized knowledge, workflows, or tool integrations. Triggers on "create skill", "new skill", "add skill", "skill for X", or requests to extend agent capabilities.
---

# Skill Creator

> **Purpose:** Create effective, modular skills that extend agent capabilities.

---

## What is a Skill?

Skills are modular packages providing:
- **Specialized workflows** - Multi-step procedures for specific domains
- **Domain expertise** - Business-specific knowledge, schemas, logic
- **Bundled resources** - Scripts, references, and assets

---

## Skill Anatomy

```
skill-name/
├── SKILL.md              # Required - Frontmatter + instructions
├── scripts/              # Optional - Executable Python/Bash
├── references/           # Optional - Documentation loaded as needed
└── assets/               # Optional - Templates, icons, fonts
```

### SKILL.md Structure

```yaml
---
name: skill-name
description: What the skill does. When to use it. Trigger keywords.
---

# Skill Title

[Instructions and guidance - loaded only when skill triggers]
```

---

## Core Principles

| Principle | Meaning |
|-----------|---------|
| **Concise is Key** | Context window is shared; only add what the agent doesn't already know |
| **Progressive Disclosure** | Metadata → SKILL.md → References (loaded as needed) |
| **Appropriate Freedom** | High (text) for flexible tasks, Low (scripts) for fragile operations |

---

## Creation Process

### Step 1: Understand the Use Cases

Before creating, clarify:
- 🎯 **Purpose:** What problem does this skill solve?
- 👥 **Triggers:** What would a user say to activate this skill?
- 📦 **Scope:** What functionality should it support?

### Step 2: Plan Resources

Analyze each use case:

| Resource Type | When to Include | Example |
|---------------|-----------------|---------|
| `scripts/` | Repetitive code, deterministic tasks | `rotate_pdf.py` |
| `references/` | Documentation Claude should reference | `schema.md`, `api_docs.md` |
| `assets/` | Files used in output (not loaded into context) | `template.html`, `logo.png` |

### Step 3: Initialize Skill

Run the initialization script:

```bash
python .agent/skills/skill-creator/scripts/init_skill.py <skill-name>
```

This creates the directory structure with a template SKILL.md.

### Step 4: Implement the Skill

1. **Write frontmatter** with clear `name` and `description`
2. **Add instructions** - imperative form, concise
3. **Create resources** - scripts, references, assets as needed
4. **Test scripts** - ensure they run without errors

### Step 5: Validate

Run validation:

```bash
python .agent/skills/skill-creator/scripts/validate_skill.py .agent/skills/<skill-name>
```

---

## Writing Guidelines

### Frontmatter (Critical for Triggering)

```yaml
---
name: lowercase-with-dashes
description: |
  What the skill does + when to use it.
  Include trigger keywords and contexts.
  This is the ONLY content read before skill loads.
---
```

### Body Best Practices

| Do | Don't |
|----|-------|
| Use imperative form ("Create", "Run") | Use passive voice |
| Include concise examples | Write verbose explanations |
| Reference files (`See reference.md`) | Duplicate content |
| Keep under 500 lines | Create auxiliary docs (README, CHANGELOG) |

---

## Progressive Disclosure Patterns

### Pattern 1: High-level with References

```markdown
## Quick Start
[Essential code example]

## Advanced
- **Feature A**: See [feature-a.md](references/feature-a.md)
- **Feature B**: See [feature-b.md](references/feature-b.md)
```

### Pattern 2: Domain Organization

```
my-skill/
├── SKILL.md
└── references/
    ├── domain-a.md
    ├── domain-b.md
    └── domain-c.md
```

Agent loads only the relevant domain file.

---

## Do NOT Include

- ❌ README.md
- ❌ INSTALLATION_GUIDE.md
- ❌ CHANGELOG.md
- ❌ User-facing documentation
- ❌ Setup/testing procedures

Skills are for AI agents, not human documentation.

---

## Quick Reference

| Task | Command |
|------|---------|
| Create new skill | `python .agent/skills/skill-creator/scripts/init_skill.py <name>` |
| Validate skill | `python .agent/skills/skill-creator/scripts/validate_skill.py <path>` |
| List all skills | `ls .agent/skills/` |

---
