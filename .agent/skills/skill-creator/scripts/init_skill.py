#!/usr/bin/env python3
"""
Initialize a new skill in the .agent/skills directory.

Usage:
    python init_skill.py <skill-name> [--path <output-directory>]
    
Examples:
    python init_skill.py my-new-skill
    python init_skill.py marketing-automation --path /custom/path
"""

import argparse
import os
import sys
from pathlib import Path

# Default skills directory (relative to workspace root)
DEFAULT_SKILLS_DIR = ".agent/skills"

SKILL_TEMPLATE = '''---
name: {skill_name}
description: TODO - Describe what this skill does and when to use it. Include trigger keywords.
---

# {skill_title}

> **Purpose:** TODO - Brief description of the skill's purpose.

---

## Overview

TODO - Explain what this skill provides and when to use it.

---

## Usage

TODO - Add usage instructions, examples, and workflows.

---

## Resources

| Resource | Description |
|----------|-------------|
| `scripts/` | TODO - Describe any scripts or remove if not needed |
| `references/` | TODO - Describe any reference docs or remove if not needed |

---
'''

def find_workspace_root() -> Path:
    """Find the workspace root by looking for .agent directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".agent").is_dir():
            return current
        current = current.parent
    return Path.cwd()

def create_skill(skill_name: str, output_path: Path = None) -> bool:
    """Create a new skill directory with template files."""
    
    # Validate skill name
    if not skill_name.replace("-", "").replace("_", "").isalnum():
        print(f"❌ Error: Skill name '{skill_name}' contains invalid characters.")
        print("   Use only letters, numbers, hyphens, and underscores.")
        return False
    
    # Determine output directory
    if output_path:
        skill_dir = Path(output_path) / skill_name
    else:
        workspace_root = find_workspace_root()
        skill_dir = workspace_root / DEFAULT_SKILLS_DIR / skill_name
    
    # Check if already exists
    if skill_dir.exists():
        print(f"❌ Error: Skill '{skill_name}' already exists at {skill_dir}")
        return False
    
    # Create directory structure
    try:
        skill_dir.mkdir(parents=True)
        (skill_dir / "scripts").mkdir()
        (skill_dir / "references").mkdir()
        
        # Create SKILL.md
        skill_title = skill_name.replace("-", " ").replace("_", " ").title()
        skill_md_content = SKILL_TEMPLATE.format(
            skill_name=skill_name,
            skill_title=skill_title
        )
        (skill_dir / "SKILL.md").write_text(skill_md_content)
        
        # Create placeholder files
        (skill_dir / "scripts" / ".gitkeep").touch()
        (skill_dir / "references" / ".gitkeep").touch()
        
        print(f"✅ Created skill '{skill_name}' at:")
        print(f"   {skill_dir}")
        print()
        print("📁 Structure:")
        print(f"   {skill_name}/")
        print("   ├── SKILL.md          ← Edit this file")
        print("   ├── scripts/          ← Add executable scripts")
        print("   └── references/       ← Add reference documentation")
        print()
        print("📝 Next steps:")
        print("   1. Edit SKILL.md - Update frontmatter description")
        print("   2. Add resources - Scripts, references as needed")
        print("   3. Validate - Run validate_skill.py when ready")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating skill: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Initialize a new skill in the .agent framework"
    )
    parser.add_argument(
        "skill_name",
        help="Name of the skill (lowercase with dashes, e.g., 'my-skill')"
    )
    parser.add_argument(
        "--path",
        help="Custom output directory (default: .agent/skills/)",
        default=None
    )
    
    args = parser.parse_args()
    
    # Normalize skill name
    skill_name = args.skill_name.lower().replace(" ", "-")
    output_path = Path(args.path) if args.path else None
    
    success = create_skill(skill_name, output_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
