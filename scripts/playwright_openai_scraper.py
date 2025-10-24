#!/usr/bin/env python3
"""
Playwright + OpenAI Store Directory Scraper
Uses Playwright for rendering and OpenAI for extraction
"""
import asyncio
import json
import sys
import os

try:
    from playwright.async_api import async_playwright
except ImportError:
    print(json.dumps({"error": "playwright not installed. Run: pip3 install playwright"}))
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print(json.dumps({"error": "openai not installed. Run: pip3 install openai"}))
    sys.exit(1)

async def scrape_stores(url: str, api_key: str):
    """Extract store directory using Playwright + OpenAI"""
    
    if not api_key or api_key == "NONE":
        print(json.dumps({"error": "OPENAI_API_KEY environment variable not set"}))
        return []
    
    try:
        # Use Playwright to render the page
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Navigate and wait for content
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)  # Extra wait for any dynamic content
            
            # AUTO-SCROLL to trigger lazy loading (crucial for large directories!)
            previous_height = 0
            for i in range(20):  # Scroll up to 20 times
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(500)  # Wait for content to load
                
                current_height = await page.evaluate("document.body.scrollHeight")
                if current_height == previous_height:
                    break  # No more content loading
                previous_height = current_height
            
            # Get the page content AFTER scrolling
            html_content = await page.content()
            text_content = await page.inner_text('body')
            
            await browser.close()
        
        # Use OpenAI to extract stores from the content
        client = OpenAI(api_key=api_key)
        
        prompt = f"""Extract ALL stores/shops/brands from this retail location's store directory page.

HTML Content Length: {len(html_content)} chars
Text Content (showing up to 50,000 chars):
{text_content[:50000]}

Return a JSON array of stores with this structure:
[
  {{"name": "Store Name", "category": "Fashion/Food/Electronics/etc", "url": "store-page-url-if-available"}},
  ...
]

Be thorough - extract EVERY store you can find. If you see 200+ stores, extract ALL of them.
Major brands to look for: H&M, Zara, Apple, Nike, Costa, Starbucks, JD Sports, Primark, etc.
Return ONLY the JSON array, no explanation."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a data extraction assistant. Extract ALL stores from retail directory pages. Be exhaustive - don't miss any stores!"},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=16000  # Increased for large store lists
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Parse JSON (remove markdown code blocks if present)
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        
        stores = json.loads(result_text)
        return stores
        
    except Exception as e:
        print(json.dumps({"error": f"Exception: {str(e)}"}), file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 playwright_openai_scraper.py <url>"}))
        sys.exit(1)
    
    url = sys.argv[1]
    api_key = os.environ.get("OPENAI_API_KEY", "NONE")
    
    stores = asyncio.run(scrape_stores(url, api_key))
    print(json.dumps(stores, indent=2))

