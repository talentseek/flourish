#!/usr/bin/env python3
"""
Context Bootstrapper — Auto-generate reference files from live codebase.

Usage:
    python .agent/skills/context-bootstrapper/scripts/generate_context.py

Scans the Flourish codebase and regenerates all reference files in
.agent/skills/context-bootstrapper/references/

Safe to re-run: overwrites existing reference files with fresh data.
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

def find_workspace_root() -> Path:
    """Find workspace root by looking for .agent directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".agent").is_dir():
            return current
        current = current.parent
    return Path.cwd()

ROOT = find_workspace_root()
REFS_DIR = ROOT / ".agent" / "skills" / "context-bootstrapper" / "references"


def scan_api_routes() -> list[dict]:
    """Scan src/app/api/ for all route.ts files and extract HTTP methods."""
    api_dir = ROOT / "src" / "app" / "api"
    routes = []
    
    for route_file in sorted(api_dir.rglob("route.ts")):
        rel_path = route_file.relative_to(api_dir)
        # Convert filesystem path to URL path
        url_path = "/api/" + str(rel_path.parent).replace("\\", "/")
        if url_path.endswith("/."):
            url_path = url_path[:-2]
        
        # Read file to find HTTP methods
        content = route_file.read_text(errors="ignore")
        methods = []
        for method in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
            if re.search(rf"export\s+(async\s+)?function\s+{method}", content):
                methods.append(method)
        
        routes.append({
            "path": url_path,
            "methods": methods,
            "file": str(route_file.relative_to(ROOT)),
        })
    
    return routes


def scan_page_routes() -> list[dict]:
    """Scan src/app/ for all page.tsx files."""
    app_dir = ROOT / "src" / "app"
    pages = []
    
    for page_file in sorted(app_dir.rglob("page.tsx")):
        rel_path = page_file.relative_to(app_dir)
        # Convert to URL path
        url_path = "/" + str(rel_path.parent).replace("\\", "/")
        if url_path == "/.":
            url_path = "/"
        
        # Check if client component
        content = page_file.read_text(errors="ignore")
        is_client = '"use client"' in content or "'use client'" in content
        
        pages.append({
            "path": url_path,
            "file": str(page_file.relative_to(ROOT)),
            "client": is_client,
        })
    
    return pages


def scan_components() -> dict:
    """Scan src/components/ for all .tsx files."""
    comp_dir = ROOT / "src" / "components"
    ui_dir = comp_dir / "ui"
    
    ui_components = []
    feature_components = []
    
    for tsx_file in sorted(comp_dir.rglob("*.tsx")):
        rel = tsx_file.relative_to(comp_dir)
        name = tsx_file.stem
        
        if tsx_file.parent == ui_dir:
            ui_components.append(name)
        else:
            subdir = str(rel.parent) if str(rel.parent) != "." else ""
            feature_components.append({
                "name": name,
                "subdir": subdir,
                "file": str(rel),
            })
    
    return {
        "ui": sorted(ui_components),
        "feature": feature_components,
    }


def scan_lib_modules() -> list[dict]:
    """Scan src/lib/ for all .ts files."""
    lib_dir = ROOT / "src" / "lib"
    modules = []
    
    for ts_file in sorted(lib_dir.glob("*.ts")):
        modules.append({
            "name": ts_file.stem,
            "file": str(ts_file.relative_to(ROOT)),
            "size": ts_file.stat().st_size,
        })
    
    return modules


def parse_prisma_schema() -> dict:
    """Parse prisma/schema.prisma for models and enums."""
    schema_file = ROOT / "prisma" / "schema.prisma"
    content = schema_file.read_text()
    
    models = []
    enums = []
    
    # Extract models
    for match in re.finditer(r"model\s+(\w+)\s*\{([^}]+)\}", content):
        model_name = match.group(1)
        body = match.group(2)
        fields = []
        for line in body.strip().split("\n"):
            line = line.strip()
            if line and not line.startswith("//") and not line.startswith("@@"):
                parts = line.split()
                if len(parts) >= 2 and not parts[0].startswith("//"):
                    fields.append(parts[0])
        models.append({"name": model_name, "field_count": len(fields)})
    
    # Extract enums
    for match in re.finditer(r"enum\s+(\w+)\s*\{([^}]+)\}", content):
        enum_name = match.group(1)
        body = match.group(2)
        values = [v.strip() for v in body.strip().split("\n") if v.strip() and not v.strip().startswith("//")]
        enums.append({"name": enum_name, "values": values})
    
    return {"models": models, "enums": enums}


def scan_scripts() -> dict:
    """Count and categorize scripts."""
    scripts_dir = ROOT / "scripts"
    categories = {
        "enrich": 0,
        "audit": 0,
        "check": 0,
        "import": 0,
        "fix": 0,
        "repair": 0,
        "find": 0,
        "other": 0,
    }
    total = 0
    
    for f in scripts_dir.iterdir():
        if f.is_file() and f.suffix in (".ts", ".py", ".sh", ".js"):
            total += 1
            stem = f.stem.split("-")[0].split("_")[0]
            if stem in categories:
                categories[stem] += 1
            else:
                categories["other"] += 1
    
    return {"total": total, "categories": categories}


def read_package_json() -> dict:
    """Read key info from package.json."""
    pkg = json.loads((ROOT / "package.json").read_text())
    return {
        "name": pkg.get("name", "unknown"),
        "node": pkg.get("engines", {}).get("node", "unknown"),
        "scripts": list(pkg.get("scripts", {}).keys()),
        "dependencies": list(pkg.get("dependencies", {}).keys()),
        "devDependencies": list(pkg.get("devDependencies", {}).keys()),
    }


def generate_summary_report():
    """Generate a summary report of the codebase scan."""
    print("🔍 Scanning codebase...")
    
    api_routes = scan_api_routes()
    page_routes = scan_page_routes()
    components = scan_components()
    lib_modules = scan_lib_modules()
    schema = parse_prisma_schema()
    scripts = scan_scripts()
    pkg = read_package_json()
    
    print(f"   📡 API routes: {len(api_routes)}")
    print(f"   📄 Page routes: {len(page_routes)}")
    print(f"   🧩 UI components: {len(components['ui'])}")
    print(f"   🧩 Feature components: {len(components['feature'])}")
    print(f"   📦 Lib modules: {len(lib_modules)}")
    print(f"   🗄️  DB models: {len(schema['models'])}")
    print(f"   📜 Scripts: {scripts['total']}")
    
    # Write a generated metadata file
    meta = {
        "generated_at": datetime.now().isoformat(),
        "api_route_count": len(api_routes),
        "page_route_count": len(page_routes),
        "ui_component_count": len(components["ui"]),
        "feature_component_count": len(components["feature"]),
        "lib_module_count": len(lib_modules),
        "db_model_count": len(schema["models"]),
        "script_count": scripts["total"],
        "package_name": pkg["name"],
        "node_version": pkg["node"],
    }
    
    REFS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Write _generated_stats.json for quick reference
    stats_file = REFS_DIR / "_generated_stats.json"
    stats_file.write_text(json.dumps(meta, indent=2))
    print(f"\n✅ Stats written to {stats_file.relative_to(ROOT)}")
    
    # Generate api-surface.md
    generate_api_surface(api_routes)
    
    # Generate components.md
    generate_components(components)
    
    print(f"\n✅ Reference files regenerated in {REFS_DIR.relative_to(ROOT)}/")
    print("\n📝 Note: architecture.md, data-model.md, conventions.md, and domain-context.md")
    print("   are manually curated. Review and update them if major changes occurred.")


def generate_api_surface(routes: list[dict]):
    """Regenerate api-surface.md from scanned routes."""
    lines = ["# API Surface Reference (Auto-Generated)", ""]
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"Total routes: {len(routes)}")
    lines.append("")
    lines.append("| Methods | Route | File |")
    lines.append("|---------|-------|------|")
    
    for r in routes:
        methods = ", ".join(r["methods"]) if r["methods"] else "?"
        lines.append(f"| `{methods}` | `{r['path']}` | `{r['file']}` |")
    
    # Don't overwrite the curated version — write to a separate file
    out_file = REFS_DIR / "_generated_api_routes.md"
    out_file.write_text("\n".join(lines))
    print(f"   ✅ {out_file.name}")


def generate_components(components: dict):
    """Regenerate components inventory."""
    lines = ["# Component Inventory (Auto-Generated)", ""]
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    
    lines.append(f"## shadcn/ui Primitives ({len(components['ui'])})")
    lines.append("")
    lines.append(" · ".join(f"`{c}`" for c in components["ui"]))
    lines.append("")
    
    lines.append(f"## Feature Components ({len(components['feature'])})")
    lines.append("")
    lines.append("| Component | Directory | File |")
    lines.append("|-----------|-----------|------|")
    for c in components["feature"]:
        lines.append(f"| `{c['name']}` | `{c['subdir']}` | `{c['file']}` |")
    
    out_file = REFS_DIR / "_generated_components.md"
    out_file.write_text("\n".join(lines))
    print(f"   ✅ {out_file.name}")


if __name__ == "__main__":
    generate_summary_report()
