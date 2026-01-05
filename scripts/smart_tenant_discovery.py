#!/usr/bin/env python3
"""
🔍 Smart Tenant Discovery (Phase 1)

AI-driven URL discovery for shopping centre store directories.
Uses sitemap analysis and link classification to find the best URLs
for store/retail and F&B/dining pages.

Usage:
  python smart_tenant_discovery.py <website_url>
  python smart_tenant_discovery.py https://cwmbrancentre.com
"""

import asyncio
import json
import sys
import os
import re
from dataclasses import dataclass

try:
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
    from crawl4ai.extraction_strategy import LLMExtractionStrategy
except ImportError:
    print(json.dumps({"error": "crawl4ai not installed. Run: pip3 install crawl4ai"}))
    sys.exit(1)

@dataclass
class DiscoveredUrls:
    website: str
    store_directory_url: str | None
    dining_directory_url: str | None
    all_relevant_urls: list[str]
    confidence: str
    method: str  # "sitemap", "link_analysis", "fallback"


async def fetch_sitemap(crawler, website: str) -> list[str]:
    """Attempt to fetch and parse sitemap.xml"""
    sitemap_urls = [
        f"{website}/sitemap.xml",
        f"{website}/sitemap_index.xml",
        f"{website}/sitemap-index.xml",
    ]
    
    for sitemap_url in sitemap_urls:
        try:
            result = await crawler.arun(
                url=sitemap_url,
                config=CrawlerRunConfig(
                    cache_mode=CacheMode.BYPASS,
                    page_timeout=10000,
                )
            )
            
            if result.success and result.html:
                # Extract URLs from sitemap XML
                urls = re.findall(r'<loc>([^<]+)</loc>', result.html)
                if urls:
                    print(f"   ✅ Found sitemap with {len(urls)} URLs", file=sys.stderr)
                    return urls
        except Exception:
            continue
    
    return []


async def get_internal_links(crawler, website: str) -> list[str]:
    """Crawl homepage and extract internal links"""
    try:
        result = await crawler.arun(
            url=website,
            config=CrawlerRunConfig(
                cache_mode=CacheMode.BYPASS,
                page_timeout=30000,
                wait_until="networkidle",
            )
        )
        
        if result.success:
            raw_links = result.links.get("internal", [])
            # Links can be strings or dicts with 'href' key
            internal_links = []
            for link in raw_links:
                if isinstance(link, str):
                    internal_links.append(link)
                elif isinstance(link, dict) and 'href' in link:
                    internal_links.append(link['href'])
            print(f"   ✅ Found {len(internal_links)} internal links", file=sys.stderr)
            return internal_links
    except Exception as e:
        print(f"   ⚠️  Error getting links: {e}", file=sys.stderr)
    
    return []


async def classify_urls_with_ai(urls: list[str], website: str, api_key: str) -> dict:
    """Use AI to classify URLs and find store/dining directories"""
    
    if not urls:
        return {"store_directory_url": None, "dining_directory_url": None, "confidence": "none"}
    
    # Filter to potentially relevant URLs
    keywords = ['store', 'shop', 'retail', 'brand', 'directory', 'dining', 
                'restaurant', 'food', 'eat', 'cafe', 'leisure', 'tenant']
    
    relevant_urls = [
        url for url in urls 
        if any(kw in url.lower() for kw in keywords)
    ]
    
    # If no keyword matches, take first 50 URLs for analysis
    urls_to_analyze = relevant_urls[:30] if relevant_urls else urls[:50]
    
    if not urls_to_analyze:
        return {"store_directory_url": None, "dining_directory_url": None, "confidence": "none"}
    
    print(f"   🤖 Analyzing {len(urls_to_analyze)} URLs with AI...", file=sys.stderr)
    
    config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        extraction_strategy=LLMExtractionStrategy(
            provider="openai/gpt-4o-mini",
            api_token=api_key,
            instruction=f"""
            You are analyzing URLs from a shopping centre website: {website}
            
            Your task: Identify the URLs that lead to:
            1. STORE DIRECTORY - A page listing ALL retail stores/shops in the centre
               (look for: /stores, /shopping, /shops, /directory, /our-stores, /retailers, /brands)
            2. DINING DIRECTORY - A page listing ALL restaurants, cafes, food outlets
               (look for: /dining, /eat, /food, /restaurants, /food-drink, /cafes)
            
            Analyze these URLs:
            {chr(10).join(urls_to_analyze)}
            
            Return JSON:
            {{
              "store_directory_url": "full URL to store directory or null",
              "dining_directory_url": "full URL to dining directory or null", 
              "alternative_urls": ["other relevant URLs if main not found"],
              "confidence": "high/medium/low",
              "reasoning": "brief explanation"
            }}
            
            IMPORTANT: Return the FULL URL, not just the path.
            If a URL contains both stores AND dining together, use it for store_directory_url.
            """,
        ),
        page_timeout=60000,
    )
    
    try:
        async with AsyncWebCrawler(verbose=False) as crawler:
            # Create a simple text page with the URLs for analysis
            result = await crawler.arun(
                url=website,  # Just need any page to trigger extraction
                config=config
            )
            
            if result.success and result.extracted_content:
                try:
                    data = json.loads(result.extracted_content)
                    if isinstance(data, list) and len(data) > 0:
                        data = data[0]
                    return data
                except:
                    pass
    except Exception as e:
        print(f"   ⚠️  AI classification error: {e}", file=sys.stderr)
    
    return {"store_directory_url": None, "dining_directory_url": None, "confidence": "none"}


async def discover_urls(website: str, api_key: str) -> DiscoveredUrls:
    """Main discovery function - uses multiple strategies"""
    
    website = website.rstrip('/')
    print(f"\n🔍 Discovering store/dining URLs for: {website}", file=sys.stderr)
    
    all_urls = []
    method = "unknown"
    
    async with AsyncWebCrawler(verbose=False) as crawler:
        # Strategy 1: Check sitemap
        print("   📍 Checking sitemap...", file=sys.stderr)
        sitemap_urls = await fetch_sitemap(crawler, website)
        
        if sitemap_urls:
            all_urls.extend(sitemap_urls)
            method = "sitemap"
        
        # Strategy 2: Get internal links from homepage
        print("   📍 Analyzing homepage links...", file=sys.stderr)
        internal_links = await get_internal_links(crawler, website)
        
        if internal_links:
            all_urls.extend(internal_links)
            if not sitemap_urls:
                method = "link_analysis"
    
    # Deduplicate
    all_urls = list(set(all_urls))
    
    if not all_urls:
        print("   ❌ No URLs found to analyze", file=sys.stderr)
        return DiscoveredUrls(
            website=website,
            store_directory_url=None,
            dining_directory_url=None,
            all_relevant_urls=[],
            confidence="none",
            method="failed"
        )
    
    # Strategy 3: AI classification
    classification = await classify_urls_with_ai(all_urls, website, api_key)
    
    # Build result
    store_url = classification.get("store_directory_url")
    dining_url = classification.get("dining_directory_url")
    alternatives = classification.get("alternative_urls", [])
    confidence = classification.get("confidence", "low")
    
    # Fallback: try common patterns if AI didn't find anything
    if not store_url:
        common_patterns = ['/shopping', '/stores', '/shops', '/store-directory', '/retailers']
        for pattern in common_patterns:
            test_url = f"{website}{pattern}"
            if test_url in all_urls:
                store_url = test_url
                method = "fallback"
                confidence = "medium"
                break
    
    print(f"\n   ✅ Discovery complete:", file=sys.stderr)
    print(f"      Store Directory: {store_url or 'Not found'}", file=sys.stderr)
    print(f"      Dining Directory: {dining_url or 'Not found'}", file=sys.stderr)
    print(f"      Confidence: {confidence}", file=sys.stderr)
    
    return DiscoveredUrls(
        website=website,
        store_directory_url=store_url,
        dining_directory_url=dining_url,
        all_relevant_urls=alternatives[:10],
        confidence=confidence,
        method=method
    )


async def main():
    if len(sys.argv) < 2:
        print("Usage: python smart_tenant_discovery.py <website_url>")
        print("Example: python smart_tenant_discovery.py https://cwmbrancentre.com")
        sys.exit(1)
    
    website = sys.argv[1]
    api_key = os.environ.get("OPENAI_API_KEY", "")
    
    if not api_key:
        print(json.dumps({"error": "OPENAI_API_KEY not set"}))
        sys.exit(1)
    
    result = await discover_urls(website, api_key)
    
    # Output as JSON for easy parsing by TypeScript
    output = {
        "website": result.website,
        "store_directory_url": result.store_directory_url,
        "dining_directory_url": result.dining_directory_url,
        "all_relevant_urls": result.all_relevant_urls,
        "confidence": result.confidence,
        "method": result.method
    }
    
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
