#!/usr/bin/env python3
"""
Crawl4AI Store Directory Scraper
Uses AI-powered extraction to intelligently extract store listings
"""
import asyncio
import json
import sys
import os

try:
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
    from crawl4ai.extraction_strategy import LLMExtractionStrategy
    from pydantic import BaseModel, Field
except ImportError:
    print(json.dumps({"error": "crawl4ai not installed. Run: pip3 install crawl4ai"}))
    sys.exit(1)

class StoreInfo(BaseModel):
    name: str = Field(..., description="Store or brand name")
    category: str | None = Field(None, description="Category (Fashion, Food, Electronics, etc)")
    url: str | None = Field(None, description="Store detail page URL if available")

class StoreDirectory(BaseModel):
    stores: list[StoreInfo] = Field(..., description="List of all stores/shops/brands found on this page")

async def crawl_stores(url: str, api_key: str):
    """Extract store directory using LLM-based extraction"""
    
    if not api_key or api_key == "NONE":
        print(json.dumps({"error": "OPENAI_API_KEY environment variable not set"}))
        return []
    
    config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        extraction_strategy=LLMExtractionStrategy(
            provider="openai/gpt-4o-mini",
            api_token=api_key,
            schema=StoreDirectory.model_json_schema(),
            extraction_type="schema",
            instruction="""
            Extract ALL stores, shops, brands, and retailers from this page.
            
            Look for:
            - Store names in any format (links, cards, lists, grids, tables)
            - Category/type information if shown
            - URLs to individual store pages
            
            Be VERY thorough - if you see 100 stores, extract all 100.
            Include major brands like H&M, Zara, Apple, Costa, etc.
            Don't miss any stores!
            """,
        ),
        word_count_threshold=10,
        page_timeout=60000,
        wait_until="networkidle",
        verbose=False
    )
    
    try:
        async with AsyncWebCrawler(verbose=False) as crawler:
            result = await crawler.arun(url=url, config=config)
            
            if result.success and result.extracted_content:
                try:
                    data = json.loads(result.extracted_content)
                    stores = data.get("stores", [])
                    return stores
                except Exception as e:
                    print(json.dumps({"error": f"Parse error: {str(e)}"}), file=sys.stderr)
                    return []
            else:
                error_msg = result.error_message if hasattr(result, 'error_message') else "Unknown error"
                print(json.dumps({"error": f"Crawl failed: {error_msg}"}), file=sys.stderr)
                return []
    except Exception as e:
        print(json.dumps({"error": f"Exception: {str(e)}"}), file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 crawl4ai_scraper.py <url>"}))
        sys.exit(1)
    
    url = sys.argv[1]
    api_key = os.environ.get("OPENAI_API_KEY", "NONE")
    
    stores = asyncio.run(crawl_stores(url, api_key))
    print(json.dumps(stores, indent=2))

