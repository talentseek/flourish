# Field Schema

Expected data types and formats for all enrichment fields.

---

## Contact & Basic

| Field | Type | Format | Example |
|-------|------|--------|---------|
| phone | String | UK format | `"01234 567890"` |
| website | String | Full URL | `"https://www.example.co.uk"` |
| openingHours | String | Comma-separated | `"Mon-Sat 09:00-18:00, Sun 11:00-17:00"` |
| heroImage | String | Relative path | `"/images/locations/location-name.jpg"` |

---

## Ownership & Management

| Field | Type | Format | Example |
|-------|------|--------|---------|
| owner | String | Company name | `"Landsec PLC"` |
| management | String | Company/team | `"Centre Management Team"` |
| openedYear | Int | YYYY | `2005` |

---

## Operations

| Field | Type | Format | Example |
|-------|------|--------|---------|
| parkingSpaces | Int | Count | `530` |
| numberOfFloors | Int | Count | `3` |
| retailSpace | Int | Sq ft | `475000` |
| carParkPrice | Decimal | GBP | `3.70` |
| evCharging | Boolean | - | `true` |
| evChargingSpaces | Int | Count | `10` |
| anchorTenants | Int | Count | `4` |
| publicTransit | String | Description | `"Bus station on-site"` |
| numberOfStores | Int | Count | `70` |
| retailers | Int | Count | `70` |

---

## Footfall

| Field | Type | Format | Example |
|-------|------|--------|---------|
| footfall | Int | Annual visitors | `9400000` |

---

## Social Media

| Field | Type | Format | Example |
|-------|------|--------|---------|
| instagram | String | Full URL | `"https://www.instagram.com/location/"` |
| facebook | String | Full URL | `"https://www.facebook.com/location/"` |
| twitter | String | Full URL | `"https://twitter.com/location"` |
| youtube | String | Full URL or null | `null` |
| tiktok | String | Full URL or null | `null` |

---

## Reviews

| Field | Type | Format | Example |
|-------|------|--------|---------|
| googleRating | Decimal(2,1) | X.X | `4.3` |
| googleReviews | Int | Count | `3500` |
| googleVotes | Int | Count | `3500` |
| facebookRating | Decimal(2,1) | X.X | `4.4` |
| facebookReviews | Int | Count | `5000` |
| facebookVotes | Int | Count | `5000` |

---

## SEO Data

### seoKeywords (JSON Array)
```typescript
type SeoKeyword = {
  keyword: string;    // Search term
  position: number;   // Ranking position (1-100)
  volume: number;     // Monthly search volume
}
```

### topPages (JSON Array)
```typescript
type TopPage = {
  url: string;        // Relative URL path
  traffic: number;    // Monthly visits
  percentage: number; // Share of total traffic
}
```

---

## Demographics

| Field | Type | Precision | Example |
|-------|------|-----------|---------|
| population | Int | - | `157400` |
| medianAge | Int | - | `41` |
| familiesPercent | Decimal(4,1) | 0.0 | `28.0` |
| seniorsPercent | Decimal(4,1) | 0.0 | `23.5` |
| avgHouseholdIncome | Decimal(8,2) | 0.00 | `34200.00` |
| incomeVsNational | Decimal(6,2) | 0.00 | `8.90` |
| homeownership | Decimal(4,1) | 0.0 | `60.0` |
| homeownershipVsNational | Decimal(4,1) | 0.0 | `-2.5` |
| carOwnership | Decimal(4,1) | 0.0 | `74.0` |
| carOwnershipVsNational | Decimal(4,1) | 0.0 | `-2.7` |

---

## Validation Rules

| Rule | Fields |
|------|--------|
| Phone: UK format | phone |
| URL: Valid https | website, instagram, facebook, twitter, youtube, tiktok |
| Rating: 1.0-5.0 | googleRating, facebookRating |
| Percent: 0-100 | familiesPercent, seniorsPercent, homeownership, carOwnership |
| Positive Int | parkingSpaces, numberOfStores, footfall, population |
