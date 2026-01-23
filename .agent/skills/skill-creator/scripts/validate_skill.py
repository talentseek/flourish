#!/usr/bin/env python3
"""
Validate a skill's structure and content.

Usage:
    python validate_skill.py <path-to-skill>
    
Examples:
    python validate_skill.py .agent/skills/my-skill
    python validate_skill.py /absolute/path/to/skill
"""

import argparse
import re
import sys
from pathlib import Path

def validate_frontmatter(content: str) -> list[str]:
    """Validate YAML frontmatter in SKILL.md."""
    errors = []
    
    # Check for frontmatter delimiters
    if not content.startswith("---"):
        errors.append("Missing YAML frontmatter (must start with ---)")
        return errors
    
    # Extract frontmatter
    parts = content.split("---", 2)
    if len(parts) < 3:
        errors.append("Invalid frontmatter format (missing closing ---)")
        return errors
    
    frontmatter = parts[1].strip()
    
    # Check required fields
    if "name:" not in frontmatter:
        errors.append("Missing required 'name:' field in frontmatter")
    
    if "description:" not in frontmatter:
        errors.append("Missing required 'description:' field in frontmatter")
    
    # Check for TODO in description
    if "TODO" in frontmatter:
        errors.append("Frontmatter contains TODO - please complete the description")
    
    # Check name format
    name_match = re.search(r"name:\s*(.+)", frontmatter)
    if name_match:
        name = name_match.group(1).strip()
        if not re.match(r"^[a-z0-9-]+$", name):
            errors.append(f"Skill name '{name}' should be lowercase with dashes only")
    
    return errors

def validate_structure(skill_path: Path) -> list[str]:
    """Validate skill directory structure."""
    errors = []
    
    if not skill_path.is_dir():
        errors.append(f"Path '{skill_path}' is not a directory")
        return errors
    
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        errors.append("Missing required SKILL.md file")
    
    return errors

def validate_content(skill_path: Path) -> list[str]:
    """Validate SKILL.md content quality."""
    warnings = []
    
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return warnings
    
    content = skill_md.read_text()
    lines = content.split("\n")
    
    # Check line count (should be under 500)
    if len(lines) > 500:
        warnings.append(f"SKILL.md has {len(lines)} lines (recommended: under 500)")
    
    # Check for forbidden auxiliary files
    forbidden_files = ["README.md", "CHANGELOG.md", "INSTALLATION_GUIDE.md"]
    for forbidden in forbidden_files:
        if (skill_path / forbidden).exists():
            warnings.append(f"Found {forbidden} - skills should not include auxiliary docs")
    
    # Check body has content
    parts = content.split("---", 2)
    if len(parts) >= 3:
        body = parts[2].strip()
        if len(body) < 50:
            warnings.append("SKILL.md body is very short - consider adding more instructions")
    
    return warnings

def validate_skill(skill_path: Path) -> tuple[list[str], list[str]]:
    """Run all validations and return (errors, warnings)."""
    errors = []
    warnings = []
    
    # Structure validation
    errors.extend(validate_structure(skill_path))
    
    # If SKILL.md exists, validate it
    skill_md = skill_path / "SKILL.md"
    if skill_md.exists():
        content = skill_md.read_text()
        errors.extend(validate_frontmatter(content))
        warnings.extend(validate_content(skill_path))
    
    return errors, warnings

def main():
    parser = argparse.ArgumentParser(
        description="Validate a skill's structure and content"
    )
    parser.add_argument(
        "skill_path",
        help="Path to the skill directory"
    )
    
    args = parser.parse_args()
    skill_path = Path(args.skill_path)
    
    print(f"🔍 Validating skill: {skill_path.name}")
    print()
    
    errors, warnings = validate_skill(skill_path)
    
    # Print results
    if errors:
        print("❌ Errors (must fix):")
        for error in errors:
            print(f"   • {error}")
        print()
    
    if warnings:
        print("⚠️  Warnings (should review):")
        for warning in warnings:
            print(f"   • {warning}")
        print()
    
    if not errors and not warnings:
        print("✅ Skill is valid!")
        print()
    elif not errors:
        print("✅ Skill is valid (with warnings)")
        print()
    else:
        print("❌ Skill has errors that must be fixed")
        print()
    
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
