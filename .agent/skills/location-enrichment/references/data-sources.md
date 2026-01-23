# Data Sources & Tool Mapping

Authoritative sources for each field category with the **Best Tool** to use.

---

## Contact & Basic

| Field | Source | Best Tool | URL Pattern |
|-------|--------|-----------|-------------|
| website | Search | `search_web` | Direct |
| phone | Footer | `read_url_content` | `/contact` |
| openingHours | Visitor Info | `read_url_content` | `/visitor-info` |

---

## Operations

| Field | Source | Best Tool | Notes |
|-------|--------|-----------|-------|
| parkingSpaces | Website | `read_url_content` | Look for "Parking" page |
| carParkPrice | Website | `read_url_content` | Look for Tariff table |
| evCharging | Zap-Map | `search_web` | "Zap Map [location]" |
| numberOfStores | Directory | `read_url_content` | Count list items if simple HTML |
| retailSpace | News | `search_web` | "[location] sq ft" |
| numberOfFloors | Maps | `search_web` | Infer from photos/desc |

---

## Ownership

| Field | Source | Best Tool | Query |
|-------|--------|-----------|-------|
| owner | Company site | `search_web` | "[location] owner" |
| management | Website | `read_url_content` | Check footer/contact |
| openedYear | Wikipedia | `read_url_content` | Read "History" section |

---

## Footfall

| Source Type | Best Tool | Query |
|-------------|-----------|-------|
| Annual reports | `search_web` | "[owner] annual report [location] footfall" |
| Press releases | `search_web` | "[location] visitor numbers" |
| PropertyData | `search_web` | "[location] stats propertydata" |

---

## Social Media

| Platform | Best Tool | Query |
|----------|-----------|-------|
| Instagram | `search_web` | `site:instagram.com "[location]"` |
| Facebook | `search_web` | `site:facebook.com "[location]"` |
| Twitter/X | `search_web` | `site:twitter.com "[location]"` |

---

## Reviews

| Platform | Best Tool | Query |
|----------|-----------|-------|
| Google | `search_web` | "[location] google reviews rating" |
| Facebook | `search_web` | "[location] facebook reviews rating" |

---

## Demographics

| Data | Source | Best Tool |
|------|--------|-----------|
| Population | ONS | `search_web` |
| Age | ONS | `search_web` |
| Income | NOMIS | `search_web` |
