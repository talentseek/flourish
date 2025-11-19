#!/usr/bin/env python3
"""
DEBUG VERSION - Playwright + OpenAI Store Directory Scraper
"""
import asyncio
import json
import sys
import os

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("ERROR: playwright not installed", file=sys.stderr)
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("ERROR: openai not installed", file=sys.stderr)
    sys.exit(1)

async def scrape_stores(url: str, api_key: str):
    """Extract store directory using Playwright + OpenAI"""
    
    print(f"[DEBUG] Starting scrape of: {url}", file=sys.stderr)
    
    if not api_key or api_key == "NONE":
        print("[DEBUG] ERROR: No OpenAI API key", file=sys.stderr)
        return []
    
    print(f"[DEBUG] API key found: {api_key[:20]}...", file=sys.stderr)
    
    try:
        # Use Playwright to render the page
        print("[DEBUG] Launching browser...", file=sys.stderr)
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            print(f"[DEBUG] Navigating to {url}...", file=sys.stderr)
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)
            
            print("[DEBUG] Auto-scrolling...", file=sys.stderr)
            previous_height = 0
            for i in range(20):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(500)
                
                current_height = await page.evaluate("document.body.scrollHeight")
                if current_height == previous_height:
                    break
                previous_height = current_height
            
            print(f"[DEBUG] Scrolled {i+1} times", file=sys.stderr)
            
            # Get content
            html_content = await page.content()
            text_content = await page.inner_text('body')
            
            print(f"[DEBUG] HTML length: {len(html_content)}", file=sys.stderr)
            print(f"[DEBUG] Text length: {len(text_content)}", file=sys.stderr)
            print(f"[DEBUG] First 500 chars of text: {text_content[:500]}", file=sys.stderr)
            
            await browser.close()
        
        # Use OpenAI to extract stores
        print("[DEBUG] Calling OpenAI...", file=sys.stderr)
        client = OpenAI(api_key=api_key)
        
        prompt = f"""Extract ALL stores/shops/brands from this retail location's store directory page.

HTML Content Length: {len(html_content)} chars
Text Content (showing up to 50,000 chars):
{text_content[:50000]}

Return a JSON array of stores with this structure:
[
  {{"name": "Store Name", "category": "Fashion", "url": ""}},
  ...
]

Extract EVERY store you find. Return ONLY the JSON array."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a data extraction assistant. Extract ALL stores from retail pages."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=16000
        )
        
        result_text = response.choices[0].message.content.strip()
        print(f"[DEBUG] OpenAI response length: {len(result_text)}", file=sys.stderr)
        print(f"[DEBUG] OpenAI response: {result_text[:500]}", file=sys.stderr)
        
        # Parse JSON
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        
        stores = json.loads(result_text)
        print(f"[DEBUG] Parsed {len(stores)} stores", file=sys.stderr)
        return stores
        
    except Exception as e:
        print(f"[DEBUG] EXCEPTION: {type(e).__name__}: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 script.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    api_key = os.environ.get("OPENAI_API_KEY", "NONE")
    
    stores = asyncio.run(scrape_stores(url, api_key))
    
    # Output for TypeScript to parse
    print("[STORES_START]")
    print(json.dumps(stores, indent=2))
    print("[STORES_END]")

