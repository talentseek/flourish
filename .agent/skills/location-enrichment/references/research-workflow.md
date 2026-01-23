# Research Workflow

Detailed step-by-step procedures for researching location data using the **Lightweight First** strategy.

---

## Tool Hierarchy
1. `search_web` (Primary)
2. `read_url_content` (Secondary - when URL known)
3. `browser_subagent` (BANNED - unless blocked)

---

## Phase 1: Discovery

### 1.1 Find Official Website
```python
search_web(query="[location name] official website")
# Extract URL from results summary
```

### 1.2 Verify Location Identity
```python
read_url_content(url="official_website_url")
# Confirm address and location type from text content
```

---

## Phase 2: Contact Information

### 2.1 Phone & Hours
```python
# If website content read successfully in 1.2:
# Search text for phone pattern (01XXX / +44)
# Search text for "Opening Hours" or "Trading Hours"

# If not found on home page:
read_url_content(url="official_website_url/contact")
read_url_content(url="official_website_url/opening-hours")
```

---

## Phase 3: Operational Data

### 3.1 Stores & Parking
```python
# Try finding specific pages via simple URL guessing first
read_url_content(url="official_website_url/stores")
read_url_content(url="official_website_url/parking")

# If 404, fallback to search:
search_web(query="[location name] number of parking spaces")
search_web(query="[location name] shop list directory")
```

---

## Phase 4: Ownership & History

### 4.1 Owner & Opening
```python
# Direct fact search is fastest here
search_web(query="who owns [location name]")
search_web(query="when did [location name] open")
search_web(query="[location name] opening date history")
```

---

## Phase 5: Footfall

### 5.1 Annual Footfall
```python
search_web(query="[location name] annual footfall 2024")
search_web(query="[location name] visitor numbers")
# Look for values in millions (e.g. "10 million visitors")
```

---

## Phase 6: Social Media

### 6.1 Discovery
```python
search_web(query="site:instagram.com [location name]")
search_web(query="site:facebook.com [location name]")
search_web(query="site:twitter.com [location name]")
```

### 6.2 Validation
```python
# Do NOT open the social pages. Just verify the URL looks official.
# e.g., facebook.com/TheVikingCentre (Official) vs facebook.com/groups/VikingCentreFans (Community)
```

---

## Phase 7: Reviews

### 7.1 Google Reviews
```python
# Do NOT browse Google Maps.
search_web(query="[location name] google reviews rating")
# Look for rich snippet: "4.2 (1,500 reviews)"
```

### 7.2 Facebook Reviews
```python
# Do NOT browse Facebook.
search_web(query="[location name] facebook reviews rating")
# Look for snippet: "Rating: 4.4 · ‎35 reviews"
```

---

## Phase 8: Demographics

### 8.1 Identify LTLA
```python
search_web(query="what local authority is [location city] in")
```

### 8.2 Extract Census Data
```python
# Don't use ONS explorer (too complex for text reading).
# Use simple search for key stats in that area:
search_web(query="[LTLA name] census 2021 population")
search_web(query="[LTLA name] median age census 2021")
search_web(query="[LTLA name] average household income")
```
