#!/usr/bin/env python3
"""
Validate enrichment data formats.
Usage: python validate_data.py <json-file>
       python validate_data.py --inline '{"phone": "01234"}'
"""

import sys
import json
import re
from typing import Any

# Validation rules
VALIDATORS = {
    "phone": {
        "pattern": r"^(\+44|0)\d{9,10}(\s?\d+)*$",
        "message": "UK phone format: 01234 567890 or +44 1234 567890"
    },
    "website": {
        "pattern": r"^https?://[\w\.-]+\.\w{2,}",
        "message": "Valid URL starting with http:// or https://"
    },
    "instagram": {
        "pattern": r"^https://(www\.)?instagram\.com/",
        "message": "Instagram URL format"
    },
    "facebook": {
        "pattern": r"^https://(www\.)?facebook\.com/",
        "message": "Facebook URL format"
    },
    "twitter": {
        "pattern": r"^https://(www\.)?(twitter|x)\.com/",
        "message": "Twitter/X URL format"
    },
    "googleRating": {
        "range": (1.0, 5.0),
        "message": "Rating between 1.0 and 5.0"
    },
    "facebookRating": {
        "range": (1.0, 5.0),
        "message": "Rating between 1.0 and 5.0"
    },
    "familiesPercent": {
        "range": (0, 100),
        "message": "Percentage between 0 and 100"
    },
    "seniorsPercent": {
        "range": (0, 100),
        "message": "Percentage between 0 and 100"
    },
    "homeownership": {
        "range": (0, 100),
        "message": "Percentage between 0 and 100"
    },
    "carOwnership": {
        "range": (0, 100),
        "message": "Percentage between 0 and 100"
    },
    "parkingSpaces": {
        "type": "positive_int",
        "message": "Positive integer"
    },
    "numberOfStores": {
        "type": "positive_int",
        "message": "Positive integer"
    },
    "footfall": {
        "type": "positive_int",
        "message": "Positive integer (annual footfall)"
    },
    "population": {
        "type": "positive_int",
        "message": "Positive integer"
    },
    "openedYear": {
        "range": (1800, 2030),
        "message": "Year between 1800 and 2030"
    }
}


def validate_field(field: str, value: Any) -> tuple[bool, str]:
    """Validate a single field."""
    if value is None:
        return True, "OK (null)"
    
    if field not in VALIDATORS:
        return True, "OK (no validation rules)"
    
    rules = VALIDATORS[field]
    
    # Pattern matching
    if "pattern" in rules:
        if not isinstance(value, str):
            return False, f"Expected string, got {type(value).__name__}"
        if not re.match(rules["pattern"], value):
            return False, rules["message"]
        return True, "OK"
    
    # Range checking
    if "range" in rules:
        try:
            num = float(value)
            min_val, max_val = rules["range"]
            if num < min_val or num > max_val:
                return False, f"{rules['message']} (got {num})"
            return True, "OK"
        except (TypeError, ValueError):
            return False, f"Expected number, got {type(value).__name__}"
    
    # Type checking
    if "type" in rules:
        if rules["type"] == "positive_int":
            try:
                num = int(value)
                if num < 0:
                    return False, "Must be positive"
                return True, "OK"
            except (TypeError, ValueError):
                return False, f"Expected integer, got {type(value).__name__}"
    
    return True, "OK"


def validate_data(data: dict) -> dict:
    """Validate all fields in data."""
    results = {
        "valid": [],
        "invalid": [],
        "warnings": []
    }
    
    for field, value in data.items():
        is_valid, message = validate_field(field, value)
        
        entry = {"field": field, "value": str(value)[:50], "message": message}
        
        if is_valid:
            results["valid"].append(entry)
        else:
            results["invalid"].append(entry)
    
    # Check for required fields
    required = ["website", "phone"]
    for field in required:
        if field not in data or data[field] is None:
            results["warnings"].append({
                "field": field,
                "message": "Recommended field is missing"
            })
    
    return results


def print_results(results: dict):
    """Print validation results."""
    print("\n" + "="*60)
    print("VALIDATION RESULTS")
    print("="*60 + "\n")
    
    if results["invalid"]:
        print("❌ INVALID FIELDS:")
        for item in results["invalid"]:
            print(f"   {item['field']}: {item['message']}")
            print(f"      Value: {item['value']}")
        print()
    
    if results["warnings"]:
        print("⚠️  WARNINGS:")
        for item in results["warnings"]:
            print(f"   {item['field']}: {item['message']}")
        print()
    
    print(f"✅ Valid fields: {len(results['valid'])}")
    print(f"❌ Invalid fields: {len(results['invalid'])}")
    print(f"⚠️  Warnings: {len(results['warnings'])}")
    
    if not results["invalid"]:
        print("\n✅ All validations passed!")
    else:
        print("\n❌ Please fix invalid fields before enrichment.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_data.py <json-file>")
        print("       python validate_data.py --inline '{\"phone\": \"01234\"}'")
        sys.exit(1)
    
    if sys.argv[1] == "--inline":
        if len(sys.argv) < 3:
            print("Error: --inline requires JSON argument")
            sys.exit(1)
        data = json.loads(sys.argv[2])
    else:
        with open(sys.argv[1]) as f:
            data = json.load(f)
    
    results = validate_data(data)
    print_results(results)
    
    # Exit with error if invalid fields
    if results["invalid"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
