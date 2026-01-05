#!/usr/bin/env python3
"""
🏪 Smart Tenant Extraction (Phase 2)

AI-powered extraction of store/tenant data from shopping centre directories.
Extracts both retail stores AND F&B venues with proper categorization.

Usage:
  python smart_tenant_extraction.py <store_directory_url> [dining_url]
  python smart_tenant_extraction.py https://cwmbrancentre.com/shopping
"""

import asyncio
import json
import sys
import os
from typing import Optional
from pydantic import BaseModel, Field

try:
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
    from crawl4ai.extraction_strategy import LLMExtractionStrategy
except ImportError:
    print(json.dumps({"error": "crawl4ai not installed. Run: pip3 install crawl4ai"}))
    sys.exit(1)


class TenantInfo(BaseModel):
    """Individual tenant/store information"""
    name: str = Field(..., description="Store or restaurant name")
    category: str = Field(..., description="Main category: Fashion, F&B, Electronics, Health & Beauty, Home, Services, Entertainment, Sports, etc.")
    subcategory: Optional[str] = Field(None, description="More specific type, e.g., 'Coffee Shop' for F&B")
    tenant_type: str = Field("retail", description="Type: retail, food_beverage, service, or leisure")
    is_anchor: bool = Field(False, description="True if major anchor tenant")
    url: Optional[str] = Field(None, description="URL to store's page if available")


class TenantDirectory(BaseModel):
    """Complete tenant directory extraction"""
    tenants: list[TenantInfo] = Field(..., description="List of all extracted tenants")
    total_count: int = Field(0, description="Total number of tenants found")
    categories_found: list[str] = Field(default_factory=list, description="List of all categories found")


async def extract_tenants(url: str, api_key: str, is_dining: bool = False) -> list[dict]:
    """Extract all tenants from a directory page using AI"""
    
    page_type = "dining/F&B" if is_dining else "store/retail"
    print(f"\n🔍 Extracting {page_type} tenants from: {url}", file=sys.stderr)
    
    instruction = """
    Extract ALL stores, shops, restaurants, cafes, and tenants from this shopping centre directory page.
    
    For EACH tenant found, provide:
    - name: The official store/restaurant name
    - category: One of: Fashion, F&B (Food & Beverage), Electronics, Health & Beauty, Home & Living, 
                Services, Entertainment, Sports & Outdoors, Jewelry, Kids & Toys, Supermarket, Department Store
    - subcategory: More specific type (e.g., "Coffee Shop", "Shoe Store", "Hair Salon")
    - tenant_type: "retail" for shops, "food_beverage" for restaurants/cafes, "service" for banks/salons, "leisure" for entertainment
    - is_anchor: true if it's a major anchor (Primark, M&S, Next, Costa, McDonald's, Boots, etc.)
    - url: Link to the store's individual page if shown
    
    BE THOROUGH - Extract EVERY tenant you can find on the page, including:
    - All retail stores (fashion, electronics, homeware, etc.)
    - All restaurants and cafes
    - All service providers (banks, salons, opticians)
    - All entertainment venues
    
    Do NOT skip any tenants. Include small independents, not just major brands.
    If you see 100 tenants, extract all 100.
    """
    
    config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        extraction_strategy=LLMExtractionStrategy(
            provider="openai/gpt-4o-mini",
            api_token=api_key,
            schema=TenantDirectory.model_json_schema(),
            extraction_type="schema",
            instruction=instruction,
        ),
        word_count_threshold=10,
        page_timeout=90000,
        wait_until="networkidle",
        verbose=False
    )
    
    try:
        async with AsyncWebCrawler(verbose=False) as crawler:
            result = await crawler.arun(url=url, config=config)
            
            if result.success and result.extracted_content:
                try:
                    data = json.loads(result.extracted_content)
                    
                    # Handle various response formats
                    if isinstance(data, list):
                        tenants = data
                    elif isinstance(data, dict):
                        tenants = data.get("tenants", [])
                    else:
                        tenants = []
                    
                    print(f"   ✅ Extracted {len(tenants)} tenants", file=sys.stderr)
                    
                    # Categorize and summarize
                    if tenants:
                        categories = {}
                        anchors = 0
                        for t in tenants:
                            cat = t.get("category", "Other")
                            categories[cat] = categories.get(cat, 0) + 1
                            if t.get("is_anchor"):
                                anchors += 1
                        
                        print(f"   📊 Categories: {dict(categories)}", file=sys.stderr)
                        if anchors:
                            print(f"   ⭐ Anchor tenants: {anchors}", file=sys.stderr)
                    
                    return tenants
                    
                except Exception as e:
                    print(f"   ⚠️  Parse error: {e}", file=sys.stderr)
                    return []
            else:
                error_msg = result.error_message if hasattr(result, 'error_message') else "Unknown error"
                print(f"   ❌ Extraction failed: {error_msg}", file=sys.stderr)
                return []
                
    except Exception as e:
        print(f"   ❌ Exception: {e}", file=sys.stderr)
        return []


async def extract_from_urls(store_url: str, dining_url: Optional[str], api_key: str) -> dict:
    """Extract tenants from both store and dining URLs"""
    
    all_tenants = []
    
    # Extract from store directory
    if store_url:
        store_tenants = await extract_tenants(store_url, api_key, is_dining=False)
        all_tenants.extend(store_tenants)
    
    # Extract from dining directory (if different URL)
    if dining_url and dining_url != store_url:
        dining_tenants = await extract_tenants(dining_url, api_key, is_dining=True)
        # Merge, avoiding duplicates
        existing_names = {t.get("name", "").lower() for t in all_tenants}
        for t in dining_tenants:
            if t.get("name", "").lower() not in existing_names:
                all_tenants.append(t)
    
    # Categorize summary
    categories = {}
    type_counts = {"retail": 0, "food_beverage": 0, "service": 0, "leisure": 0}
    
    for t in all_tenants:
        cat = t.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1
        t_type = t.get("tenant_type", "retail")
        if t_type in type_counts:
            type_counts[t_type] += 1
        else:
            type_counts["retail"] += 1
    
    return {
        "tenants": all_tenants,
        "total_count": len(all_tenants),
        "categories": categories,
        "type_breakdown": type_counts,
        "sources": {
            "store_url": store_url,
            "dining_url": dining_url
        }
    }


async def main():
    if len(sys.argv) < 2:
        print("Usage: python smart_tenant_extraction.py <store_url> [dining_url]")
        print("Example: python smart_tenant_extraction.py https://cwmbrancentre.com/shopping")
        sys.exit(1)
    
    store_url = sys.argv[1]
    dining_url = sys.argv[2] if len(sys.argv) > 2 else None
    api_key = os.environ.get("OPENAI_API_KEY", "")
    
    if not api_key:
        print(json.dumps({"error": "OPENAI_API_KEY not set"}))
        sys.exit(1)
    
    result = await extract_from_urls(store_url, dining_url, api_key)
    
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
