# LDC 3-Tier Category Taxonomy

> **MANDATORY:** All tenant `category` and `subcategory` values MUST come from this list.
> Do NOT invent new categories. If unsure, use the closest match or flag for review.

---

## Tier 1 → Tier 2 → Tier 3

### Retail

| T2 Category | T3 Subcategories |
|---|---|
| **Clothing & Footwear** | Womenswear, Menswear, Childrenswear, Fast Fashion, Designer, Premium, Contemporary, Casual, Streetwear, Sportswear, Activewear, Outdoor, Lingerie, Loungewear, Footwear, Trainers, Occasion Wear, Plus Size, Denim, Accessories, Bags & Accessories, Outlet, Value, Surf & Outdoor, Snow Sports, Concept Store, Country, Mid-Range, Leather Goods, Luggage, Cycling, Premium Menswear |
| **Health & Beauty** | Pharmacy, Cosmetics, Premium Cosmetics, Fragrance, Skincare, Optician, Eyewear, Beauty Salon, Hair Salon, Nail Salon, Barber, Spa, Health Food Store, Bath & Body, Body Care, Hair Care, Aesthetics, Wellness, Dental, K-Beauty |
| **Food & Grocery** | Supermarket, Convenience Store, Butcher, Deli, Farm Shop, Confectionery, Chocolate Shop, Chocolatier, Sweet Shop, Bubble Tea |
| **General Retail** | Discount Store, Variety Store, Vape Shop, Specialist |
| **Department Stores** | Department Store |
| **Gifts & Stationery** | Cards & Gifts, Books & Stationery, Books, Stationery, Souvenirs, Music Merchandise, Gifts, Gifts & Homeware, Gadgets & Gifts, Art, Art Gallery, Art & Jewellery, Pottery |
| **Jewellery & Watches** | Jewellery, Fashion Jewellery, Crystal Jewellery, Watches, Luxury Watches, Watch Repair |
| **Electrical & Technology** | Consumer Electronics, Mobile Network, Mobile Repair, Mobile Accessories, Mobile, Telecoms, Phone Repairs, Entertainment Retail, Second Hand Electronics, Home Appliances |
| **Home & Garden** | Homeware, Kitchenware, Kitchen & Home, Furniture, Bedding, Home Fragrance, Home & Lifestyle, Lifestyle |
| **Kids & Toys** | Toy Store, Toys, Kidswear |

### Food & Beverage

| T2 Category | T3 Subcategories |
|---|---|
| **Cafes & Restaurants** | Coffee Shop, Cafe, Tea Shop, Restaurant, Fast Food, Fast Casual, Premium Casual, Casual, Bakery, Sandwich Shop, Dessert, Dessert Shop, Milkshake Bar, Food Hall, Takeaway, Pub, Bar, Restaurant Bar |

### Leisure

| T2 Category | T3 Subcategories |
|---|---|
| **Leisure & Entertainment** | Cinema, Gym, Bowling, Mini Golf, Escape Room, Trampoline Park, Indoor Skiing, Climbing, Virtual Reality, Arcade, Amusements, Casino, Social Gaming, Adventure, Collectibles, Sport Merchandise, Sports Retailer |

### Service

| T2 Category | T3 Subcategories |
|---|---|
| **Services** | Travel Agency, Post Office, Photo Printing, Shoe Repair, Dry Cleaning, Launderette, Alterations, Newsagent, Betting, Parcel Collection, Parcel Locker, Trade Supplies, Car Wash, Employment Services, Education, Community, Community Hub |
| **Financial Services** | Bank, Building Society, Currency Exchange, Pawnbroker |
| **Charity & Second Hand** | Charity Shop, Charity |

### Vacant

| T2 Category | T3 Subcategories |
|---|---|
| **Vacant** | Vacant Unit, Under Refurbishment, Coming Soon |

---

## Quick Reference: T2 Categories (16 total)

Use these as the `category` field value:

```
Clothing & Footwear    Health & Beauty        Food & Grocery
General Retail         Department Stores      Gifts & Stationery
Jewellery & Watches    Electrical & Technology Home & Garden
Kids & Toys            Cafes & Restaurants    Leisure & Entertainment
Services               Financial Services     Charity & Second Hand
Vacant
```

---

## Common Mapping Mistakes

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `Fashion & Clothing` | `Clothing & Footwear` |
| `Food & Beverage` | `Cafes & Restaurants` |
| `Electronics` | `Electrical & Technology` |
| `Restaurant` (as category) | `Cafes & Restaurants` with subcategory `Restaurant` |
| `Opticians` | `Health & Beauty` with subcategory `Optician` |
| `Other` | Find the closest T2 match, or use `General Retail` |
