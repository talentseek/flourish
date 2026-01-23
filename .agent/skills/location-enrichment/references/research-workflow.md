# Research Workflow

Detailed step-by-step procedures for researching location data.

---

## Phase 1: Discovery

### 1.1 Find Official Website
```
Primary: Search "[location name] official website"
Backup: Search "[location name] shopping centre UK"
Verify: Look for consistent branding, official domain
```

### 1.2 Verify Location Identity
- Confirm address matches database record
- Check location type (shopping centre, retail park, outlet)
- Note any name changes or rebranding

---

## Phase 2: Contact Information

### 2.1 Phone Number
```
Source: Website footer or contact page
Source: Google Maps listing
Format: UK format - 01234 567890 or +44 1234 567890
```

### 2.2 Opening Hours
```
Source: Website visitor info or footer
Source: Google Maps
Format: "Mon-Sat 09:00-18:00, Sun 11:00-17:00"
Note: Include bank holiday variations if prominent
```

---

## Phase 3: Operational Data

### 3.1 Store Count
```
Source: Official store directory page
Method: Count unique store entries
Note: Exclude "Coming Soon" or vacant units
→ numberOfStores field
```

### 3.2 Anchor Tenants
```
Identify: Major department stores, large footprint retailers
Common: M&S, Debenhams, Primark, Next, John Lewis
→ anchorTenants (count as integer)
```

### 3.3 Parking
```
Source: Website parking/getting here page
Extract: Total spaces, EV charging availability
Extract: Tariff (first 2 hours or hourly rate)
→ parkingSpaces, carParkPrice, evCharging, evChargingSpaces
```

### 3.4 Retail Space
```
Source: Press releases, property databases
Search: "[location name] sqft" or "square feet"
Format: Integer (e.g., 475000)
→ retailSpace
```

---

## Phase 4: Ownership & History

### 4.1 Current Owner
```
Search: "[location name] owner"
Search: "[location name] acquired by"
Source: Company websites, property news
→ owner
```

### 4.2 Management
```
Source: Website "About Us" or contact page
Look for: Management company, centre management
→ management
```

### 4.3 Opening Year
```
Search: "[location name] opened" or "history"
Source: Wikipedia, local news archives
→ openedYear
```

---

## Phase 5: Footfall

### 5.1 Annual Footfall
```
Search: "[location name] footfall"
Search: "[location name] visitors annually"
Source: Owner annual reports, press releases
Format: Integer (e.g., 9400000 for 9.4M)
→ footfall
```

---

## Phase 6: Social Media

### 6.1 Discovery Pattern
```
Instagram: "[location name]" site:instagram.com
Facebook: "[location name]" site:facebook.com
Twitter/X: "[location name]" site:twitter.com
TikTok: "[location name]" site:tiktok.com
YouTube: "[location name]" site:youtube.com
```

### 6.2 Verification
- Check for verified badge
- Confirm official branding
- Look for cross-links from official website
- Ignore fan pages or unofficial accounts

---

## Phase 7: Reviews

### 7.1 Google Reviews
```
Source: Google Maps search for location
Extract: Star rating (X.X format)
Extract: Review count
→ googleRating, googleReviews
```

### 7.2 Facebook Reviews
```
Source: Facebook business page
Navigate: Reviews tab
Extract: Star rating, review count
→ facebookRating, facebookReviews
```

---

## Phase 8: Demographics

### 8.1 Identify LTLA
```
1. Get location's city/town
2. Search: "[city] local authority"
3. Identify LTLA (Lower Tier Local Authority) name
```

### 8.2 Extract Census Data
```
Source: ONS Census 2021 area profiles
Source: NOMIS local authority profiles
See: uk-demographics.md for detailed extraction
```
