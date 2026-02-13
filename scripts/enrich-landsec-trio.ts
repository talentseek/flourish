/**
 * Enrichment script for 3 Landsec locations — V2 (Sitemap-sourced, CACI-aligned)
 * - St David's Dewi Sant (Cardiff) — SHOPPING_CENTRE
 * - Clarks Village (Street, Somerset) — OUTLET_CENTRE
 * - Xscape Milton Keynes — SHOPPING_CENTRE (Leisure Park)
 *
 * Tenant lists extracted from official sitemaps (Feb 2026):
 *   - stdavidscardiff.com/sitemap.xml → /en/shops/, /en/eat/, /en/leisure/
 *   - clarksvillage.co.uk/sitemap.xml → /en/shop-listing/, /en/eat-listing/
 *   - xscapemiltonkeynes.co.uk/sitemap.xml → /en/shop-listing/, /en/eat-listing/, /en/play-listing/
 *
 * Categories standardised to match existing DB taxonomy (CACI-aligned):
 *   Fashion & Clothing, Food & Beverage, Health & Beauty, Services,
 *   Homeware & Lifestyle, Leisure, Jewellery & Accessories, Sports & Outdoors,
 *   Electronics & Technology, Entertainment, Variety, Kids & Toys
 *
 * Run: npx tsx scripts/enrich-landsec-trio.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// Tenant data — sourced from official sitemaps, Feb 2026
// ============================================================

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// -----------------------------------------------------------
// St David's Cardiff — /en/shops/ (120), /en/eat/ (38), /en/leisure/ (2)
// -----------------------------------------------------------
const stDavidsTenants: TenantInput[] = [
    // === SHOPS (from /en/shops/) ===
    // Anchors
    { name: "John Lewis", category: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Fashion & Clothing", subcategory: "Value", isAnchorTenant: true },
    { name: "H&M", category: "Fashion & Clothing", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Zara", category: "Fashion & Clothing", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Fashion & Clothing", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Apple", category: "Electronics & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    // Fashion & Clothing
    { name: "3 Store", category: "Electronics & Technology", subcategory: "Mobile" },
    { name: "Accessorize", category: "Fashion & Clothing", subcategory: "Accessories" },
    { name: "AllSaints", category: "Fashion & Clothing", subcategory: "Contemporary" },
    { name: "Apricot", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "ATRIUM Menswear", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Bershka", category: "Fashion & Clothing", subcategory: "Fast Fashion" },
    { name: "Bon Marché", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "BOSS", category: "Fashion & Clothing", subcategory: "Premium" },
    { name: "Boux Avenue", category: "Fashion & Clothing", subcategory: "Lingerie" },
    { name: "Bravissimo", category: "Fashion & Clothing", subcategory: "Lingerie" },
    { name: "Charles Tyrwhitt", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Claire's", category: "Fashion & Clothing", subcategory: "Accessories" },
    { name: "Clarks", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Clogau", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Crew Clothing", category: "Fashion & Clothing", subcategory: "Premium Casual" },
    { name: "Damaged Society", category: "Fashion & Clothing", subcategory: "Streetwear" },
    { name: "Fat Face", category: "Fashion & Clothing", subcategory: "Casual" },
    { name: "Foot Locker", category: "Fashion & Clothing", subcategory: "Sportswear" },
    { name: "Footasylum", category: "Fashion & Clothing", subcategory: "Streetwear" },
    { name: "Hawes & Curtis", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Hobbs", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Hollister", category: "Fashion & Clothing", subcategory: "Casual" },
    { name: "Hotter", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Jack & Jones", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "JD Sports", category: "Fashion & Clothing", subcategory: "Sportswear" },
    { name: "Kenji", category: "Fashion & Clothing", subcategory: "Streetwear" },
    { name: "Kurt Geiger", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Levi's", category: "Fashion & Clothing", subcategory: "Denim" },
    { name: "Lounge", category: "Fashion & Clothing", subcategory: "Loungewear" },
    { name: "Luke", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "M&S", category: "Fashion & Clothing", subcategory: "Department Store" },
    { name: "Mango", category: "Fashion & Clothing", subcategory: "Contemporary" },
    { name: "Mint Velvet", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Moss", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "New Look", category: "Fashion & Clothing", subcategory: "Fast Fashion" },
    { name: "Office", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Peacocks", category: "Fashion & Clothing", subcategory: "Value" },
    { name: "Phase Eight", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Pull & Bear", category: "Fashion & Clothing", subcategory: "Fast Fashion" },
    { name: "Quiz", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Reiss", category: "Fashion & Clothing", subcategory: "Premium" },
    { name: "River Island", category: "Fashion & Clothing", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Size?", category: "Fashion & Clothing", subcategory: "Trainers" },
    { name: "Skechers", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Slaters", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Sosandar", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Stradivarius", category: "Fashion & Clothing", subcategory: "Fast Fashion" },
    { name: "Superdry", category: "Fashion & Clothing", subcategory: "Contemporary" },
    { name: "The Clothing Culture", category: "Fashion & Clothing", subcategory: "Streetwear" },
    { name: "The North Face", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "Timberland", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Trespass", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "Vans", category: "Fashion & Clothing", subcategory: "Trainers" },
    { name: "Vivienne Westwood", category: "Fashion & Clothing", subcategory: "Designer" },
    { name: "Yours", category: "Fashion & Clothing", subcategory: "Plus Size" },
    // Jewellery & Watches
    { name: "Breitling", category: "Jewellery & Accessories", subcategory: "Luxury Watches" },
    { name: "Crouch SD2 Fraser Hart", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Diamond Heaven", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Laings", category: "Jewellery & Accessories", subcategory: "Luxury Watches" },
    { name: "Lovisa", category: "Jewellery & Accessories", subcategory: "Fashion Jewellery" },
    { name: "Omega", category: "Jewellery & Accessories", subcategory: "Luxury Watches" },
    { name: "Pandora", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Pravins", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Swarovski", category: "Jewellery & Accessories", subcategory: "Crystal Jewellery" },
    { name: "Swatch", category: "Jewellery & Accessories", subcategory: "Watches" },
    { name: "TAG Heuer", category: "Jewellery & Accessories", subcategory: "Luxury Watches" },
    { name: "Thomas Sabo", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Watches of Switzerland", category: "Jewellery & Accessories", subcategory: "Luxury Watches" },
    { name: "Sunglass Hut", category: "Jewellery & Accessories", subcategory: "Eyewear" },
    { name: "The Watch Lab", category: "Jewellery & Accessories", subcategory: "Watch Repair" },
    { name: "In Time", category: "Jewellery & Accessories", subcategory: "Watch Repair" },
    // Health & Beauty
    { name: "Beauty Studio by Superdrug", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots (Second Store)", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Glamour Forever Store", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Jo Malone", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Laser Clinics UK", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "MAC", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Penhaligon's", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "PURESEOUL", category: "Health & Beauty", subcategory: "K-Beauty" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "Sephora", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Sunnamusk London", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Fragrance Shop (Grand Arcade)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop (2)", category: "Health & Beauty", subcategory: "Fragrance" },
    // Technology & Mobile
    { name: "CeX", category: "Electronics & Technology", subcategory: "Second Hand Electronics" },
    { name: "EE", category: "Electronics & Technology", subcategory: "Mobile" },
    { name: "iSmash", category: "Electronics & Technology", subcategory: "Phone Repairs" },
    { name: "Mobile Bitz", category: "Electronics & Technology", subcategory: "Phone Repairs" },
    { name: "O2", category: "Electronics & Technology", subcategory: "Mobile" },
    { name: "Samsung", category: "Electronics & Technology", subcategory: "Consumer Electronics" },
    { name: "Sky", category: "Electronics & Technology", subcategory: "Telecoms" },
    { name: "Vodafone", category: "Electronics & Technology", subcategory: "Mobile" },
    // Homeware & Lifestyle
    { name: "Bo Concept", category: "Homeware & Lifestyle", subcategory: "Furniture" },
    { name: "Card Factory", category: "Homeware & Lifestyle", subcategory: "Cards & Gifts" },
    { name: "Castle Fine Art", category: "Homeware & Lifestyle", subcategory: "Art" },
    { name: "Flying Tiger", category: "Homeware & Lifestyle", subcategory: "Variety Store" },
    { name: "Menkind", category: "Homeware & Lifestyle", subcategory: "Gifts" },
    { name: "Miniso", category: "Homeware & Lifestyle", subcategory: "Variety Store" },
    { name: "Oliver Bonas", category: "Homeware & Lifestyle", subcategory: "Gifts & Homeware" },
    { name: "One Beyond", category: "Homeware & Lifestyle", subcategory: "Variety Store" },
    { name: "Smiggle", category: "Homeware & Lifestyle", subcategory: "Stationery" },
    { name: "Søstrene Grene", category: "Homeware & Lifestyle", subcategory: "Homeware" },
    { name: "Television & Movie Store", category: "Homeware & Lifestyle", subcategory: "Gifts" },
    { name: "The White Company", category: "Homeware & Lifestyle", subcategory: "Home & Lifestyle" },
    // Entertainment
    { name: "Build A Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },
    // Services
    { name: "A.G. Meek", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Barclays", category: "Services", subcategory: "Bank" },
    { name: "Ethical Boutique by The Safe Foundation", category: "Services", subcategory: "Charity Shop" },
    { name: "Eurochange", category: "Services", subcategory: "Currency Exchange" },
    { name: "Eurochange (Second Store)", category: "Services", subcategory: "Currency Exchange" },
    { name: "Hotel Chocolat", category: "Food & Beverage", subcategory: "Chocolate Shop" },
    { name: "Mr Simms Sweet Shop", category: "Food & Beverage", subcategory: "Sweet Shop" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Principality Building Society", category: "Services", subcategory: "Building Society" },
    { name: "Tesco Express", category: "Food & Beverage", subcategory: "Supermarket" },
    { name: "The Carwash Company", category: "Services", subcategory: "Car Wash" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    // === EAT (from /en/eat/) ===
    { name: "Auntie Anne's Pretzels", category: "Food & Beverage", subcategory: "Bakery" },
    { name: "Banana Tree", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Barburrito", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "Bubble CiTea", category: "Food & Beverage", subcategory: "Tea Shop" },
    { name: "Caffè Nero", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Carl's Jr", category: "Food & Beverage", subcategory: "Fast Food" },
    { name: "Chopstix", category: "Food & Beverage", subcategory: "Fast Food" },
    { name: "Ciliegino", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Costa Coffee", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Cosy Club", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Cupp Bubble Tea", category: "Food & Beverage", subcategory: "Tea Shop" },
    { name: "Frankie & Benny's", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Fuel", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Gaucho", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Giggling Squid", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Greggs", category: "Food & Beverage", subcategory: "Bakery" },
    { name: "Kin & Ilk", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Knoops", category: "Food & Beverage", subcategory: "Chocolate Shop" },
    { name: "Krispy Kreme", category: "Food & Beverage", subcategory: "Bakery" },
    { name: "Muffin Break", category: "Food & Beverage", subcategory: "Bakery" },
    { name: "My Cookie Dough", category: "Food & Beverage", subcategory: "Dessert Shop" },
    { name: "Nando's", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Pizza Express", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Pret A Manger", category: "Food & Beverage", subcategory: "Sandwich Shop" },
    { name: "Prezzo", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Shake Shack", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "Slim Chickens", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "Starbucks", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Starbucks (Second Location)", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "TGI Fridays", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "The Bagel Place", category: "Food & Beverage", subcategory: "Bakery" },
    { name: "The Ivy Asia", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "The Ivy Cardiff", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Wahaca", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Which Wich", category: "Food & Beverage", subcategory: "Sandwich Shop" },
    { name: "YO! Sushi", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Zizzi", category: "Food & Beverage", subcategory: "Restaurant" },
    // === LEISURE (from /en/leisure/) ===
    { name: "Cineworld", category: "Leisure", subcategory: "Cinema" },
    { name: "Treetop Adventure Golf", category: "Leisure", subcategory: "Mini Golf" },
];

// -----------------------------------------------------------
// Clarks Village — /en/shop-listing/ (57), /en/eat-listing/ (10)
// -----------------------------------------------------------
const clarksVillageTenants: TenantInput[] = [
    // === SHOPS (from /en/shop-listing/) ===
    { name: "Clarks", category: "Fashion & Clothing", subcategory: "Footwear", isAnchorTenant: true },
    { name: "Next Clearance", category: "Fashion & Clothing", subcategory: "Outlet", isAnchorTenant: true },
    { name: "M&S Outlet", category: "Fashion & Clothing", subcategory: "Outlet", isAnchorTenant: true },
    { name: "ASICS", category: "Sports & Outdoors", subcategory: "Sportswear" },
    { name: "Beauty Outlet", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Bedeck", category: "Homeware & Lifestyle", subcategory: "Bedding" },
    { name: "BOSS", category: "Fashion & Clothing", subcategory: "Premium" },
    { name: "Cadbury Outlet", category: "Food & Beverage", subcategory: "Confectionery" },
    { name: "Calvin Klein", category: "Fashion & Clothing", subcategory: "Premium" },
    { name: "Castore", category: "Sports & Outdoors", subcategory: "Sportswear" },
    { name: "Chapelle", category: "Jewellery & Accessories", subcategory: "Jewellery" },
    { name: "Claire's", category: "Fashion & Clothing", subcategory: "Accessories" },
    { name: "Crew Clothing", category: "Fashion & Clothing", subcategory: "Premium Casual" },
    { name: "Denby", category: "Homeware & Lifestyle", subcategory: "Pottery" },
    { name: "Dune London", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Fat Face", category: "Fashion & Clothing", subcategory: "Casual" },
    { name: "Gift Company", category: "Homeware & Lifestyle", subcategory: "Gifts" },
    { name: "Hackett", category: "Fashion & Clothing", subcategory: "Premium Menswear" },
    { name: "Hallmark", category: "Homeware & Lifestyle", subcategory: "Cards & Gifts" },
    { name: "Haribo", category: "Food & Beverage", subcategory: "Confectionery" },
    { name: "Hatley", category: "Fashion & Clothing", subcategory: "Kidswear" },
    { name: "Hobbs", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Hotel Chocolat", category: "Food & Beverage", subcategory: "Chocolate Shop" },
    { name: "Jack Wills", category: "Fashion & Clothing", subcategory: "Premium Casual" },
    { name: "Jack Wolfskin", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "Joules", category: "Fashion & Clothing", subcategory: "Country" },
    { name: "Lakeland Leather", category: "Fashion & Clothing", subcategory: "Leather Goods" },
    { name: "Le Creuset", category: "Homeware & Lifestyle", subcategory: "Kitchenware" },
    { name: "Levi's", category: "Fashion & Clothing", subcategory: "Denim" },
    { name: "Lindt", category: "Food & Beverage", subcategory: "Chocolate Shop" },
    { name: "Menkind", category: "Homeware & Lifestyle", subcategory: "Gifts" },
    { name: "Mint Velvet", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Moss", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Mountain Warehouse", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "Murmur", category: "Homeware & Lifestyle", subcategory: "Homeware" },
    { name: "Osprey London", category: "Fashion & Clothing", subcategory: "Bags & Accessories" },
    { name: "Phase Eight", category: "Fashion & Clothing", subcategory: "Womenswear" },
    { name: "Pro Direct Sports Outlet", category: "Sports & Outdoors", subcategory: "Sports Retailer" },
    { name: "ProCook", category: "Homeware & Lifestyle", subcategory: "Kitchenware" },
    { name: "Radley", category: "Fashion & Clothing", subcategory: "Bags & Accessories" },
    { name: "Raging Bull", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "Saltrock", category: "Fashion & Clothing", subcategory: "Surf & Outdoor" },
    { name: "Samsonite", category: "Fashion & Clothing", subcategory: "Luggage" },
    { name: "Scamp & Dude", category: "Fashion & Clothing", subcategory: "Casual" },
    { name: "Skechers", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Sports Direct", category: "Sports & Outdoors", subcategory: "Sports Retailer" },
    { name: "Suit Direct", category: "Fashion & Clothing", subcategory: "Menswear" },
    { name: "Sunglass Hut", category: "Jewellery & Accessories", subcategory: "Eyewear" },
    { name: "Superdry", category: "Fashion & Clothing", subcategory: "Contemporary" },
    { name: "Sweaty Betty", category: "Fashion & Clothing", subcategory: "Activewear" },
    { name: "Tefal", category: "Homeware & Lifestyle", subcategory: "Kitchenware" },
    { name: "Tempur", category: "Homeware & Lifestyle", subcategory: "Bedding" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "The Cosmetics Company Store", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "The North Face", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Works", category: "Homeware & Lifestyle", subcategory: "Books & Stationery" },
    { name: "Timberland", category: "Fashion & Clothing", subcategory: "Footwear" },
    { name: "Tog24", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "Tommy Hilfiger", category: "Fashion & Clothing", subcategory: "Premium" },
    { name: "Trespass", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "Vans", category: "Fashion & Clothing", subcategory: "Trainers" },
    { name: "Vodafone", category: "Electronics & Technology", subcategory: "Mobile" },
    { name: "Weird Fish", category: "Fashion & Clothing", subcategory: "Casual" },
    { name: "White Stuff", category: "Fashion & Clothing", subcategory: "Casual" },
    { name: "Yankee Candle", category: "Homeware & Lifestyle", subcategory: "Home Fragrance" },
    // === EAT (from /en/eat-listing/) ===
    { name: "Bill's", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Bubble T", category: "Food & Beverage", subcategory: "Tea Shop" },
    { name: "Caffè Nero", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Costa Coffee", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "PizzaExpress", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Pret A Manger", category: "Food & Beverage", subcategory: "Sandwich Shop" },
    { name: "Prezzo", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Slim Chickens", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "The Cornish Bakery", category: "Food & Beverage", subcategory: "Bakery" },
    { name: "Wagamama", category: "Food & Beverage", subcategory: "Restaurant" },
];

// -----------------------------------------------------------
// Xscape Milton Keynes — /en/shop-listing/ (9), /en/eat-listing/ (18), /en/play-listing/ (10)
// -----------------------------------------------------------
const xscapeMKTenants: TenantInput[] = [
    // === SHOPS (from /en/shop-listing/) ===
    { name: "Amazon Locker", category: "Services", subcategory: "Parcel Collection" },
    { name: "City Car Wash", category: "Services", subcategory: "Car Wash" },
    { name: "Ellis Brigham", category: "Sports & Outdoors", subcategory: "Snow Sports" },
    { name: "Evans Cycles", category: "Sports & Outdoors", subcategory: "Cycling" },
    { name: "Hollywood Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "InPost", category: "Services", subcategory: "Parcel Locker" },
    { name: "Newsagent", category: "Services", subcategory: "Newsagent" },
    { name: "Trespass", category: "Fashion & Clothing", subcategory: "Outdoor" },
    { name: "WHSmith", category: "Homeware & Lifestyle", subcategory: "Books & Stationery" },
    // === EAT (from /en/eat-listing/) ===
    { name: "Creams Cafe", category: "Food & Beverage", subcategory: "Dessert Shop" },
    { name: "Five Guys", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "McDonald's", category: "Food & Beverage", subcategory: "Fast Food" },
    { name: "Nando's", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "PizzaExpress", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Shake A Shake", category: "Food & Beverage", subcategory: "Milkshake Bar" },
    { name: "Slim Chickens", category: "Food & Beverage", subcategory: "Fast Casual" },
    { name: "Starbucks", category: "Food & Beverage", subcategory: "Coffee Shop" },
    { name: "Subway", category: "Food & Beverage", subcategory: "Sandwich Shop" },
    { name: "Sumac Room", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "T4", category: "Food & Beverage", subcategory: "Tea Shop" },
    { name: "Taco Bell", category: "Food & Beverage", subcategory: "Fast Food" },
    { name: "Vita", category: "Food & Beverage", subcategory: "Cafe" },
    { name: "Wagamama", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Wetherspoons - The Moon Under Water", category: "Food & Beverage", subcategory: "Pub" },
    { name: "Wing Kingz", category: "Food & Beverage", subcategory: "Restaurant" },
    { name: "Xpresso Net", category: "Food & Beverage", subcategory: "Coffee Shop" },
    // === PLAY (from /en/play-listing/) ===
    { name: "Cineworld", category: "Leisure", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Escape Hunt", category: "Leisure", subcategory: "Escape Room" },
    { name: "Funstation", category: "Leisure", subcategory: "Arcade" },
    { name: "Gravity", category: "Leisure", subcategory: "Trampoline Park" },
    { name: "Gravity Rocks", category: "Leisure", subcategory: "Climbing" },
    { name: "Hollywood Bowl", category: "Leisure", subcategory: "Bowling" },
    { name: "iFLY Indoor Skydiving", category: "Leisure", subcategory: "Adventure", isAnchorTenant: true },
    { name: "InstaVR Arena", category: "Leisure", subcategory: "Virtual Reality" },
    { name: "MERKUR Casino", category: "Leisure", subcategory: "Casino" },
    { name: "Nuffield Health", category: "Health & Beauty", subcategory: "Gym" },
    { name: "Snozone", category: "Leisure", subcategory: "Indoor Skiing", isAnchorTenant: true },
    { name: "Volcano Falls Adventure Golf", category: "Leisure", subcategory: "Mini Golf" },
];

// ============================================================
// Location enrichment data (unchanged from V1)
// ============================================================

async function enrichLocations() {
    console.log("🔄 Enriching St David's Dewi Sant...");
    await prisma.location.update({
        where: { id: "cmks95l980005fajkx22y1ctx" },
        data: {
            phone: "029 2036 7600",
            owner: "Landsec",
            management: "Landsec",
            openingHours: {
                "Mon-Fri": "09:30-20:00",
                Sat: "09:30-19:00",
                Sun: "11:00-16:00",
            },
            openedYear: 2009,
            footfall: 36000000,
            numberOfStores: 160,
            anchorTenants: 6,
            googleRating: 4.1,
            googleReviews: 25000,
            evCharging: true,
            evChargingSpaces: 8,
            totalFloorArea: 1400000,
            retailSpace: 1000000,
        },
    });

    console.log("🔄 Enriching Clarks Village...");
    await prisma.location.update({
        where: { id: "cmid0jnny00fimtpupmc75o4u" },
        data: {
            openedYear: 1993,
            footfall: 4000000,
            numberOfStores: 79,
            anchorTenants: 3,
            evCharging: true,
            evChargingSpaces: 8,
            totalFloorArea: 203235,
            medianAge: 47,
            avgHouseholdIncome: 30294,
            retailSpace: 203235,
        },
    });

    console.log("🔄 Enriching Xscape Milton Keynes...");
    await prisma.location.update({
        where: { id: "cmksemajw000boqpn46fxb97w" },
        data: {
            owner: "Landsec",
            phone: "01908 357 025",
            openingHours: {
                "Mon-Sun": "08:00-00:00",
            },
            openedYear: 2000,
            footfall: 8000000,
            numberOfStores: 37,
            anchorTenants: 3,
            googleRating: 4.1,
            googleReviews: 15000,
            evCharging: true,
            evChargingSpaces: 4,
            totalFloorArea: 422759,
            population: 287000,
            medianAge: 37,
            avgHouseholdIncome: 32000,
            retailSpace: 422759,
        },
    });
}

// ============================================================
// Tenant upsert — delete old + insert fresh from sitemap
// ============================================================

async function replaceTenants(
    locationId: string,
    locationName: string,
    tenants: TenantInput[]
) {
    // Delete existing tenants for this location first (clean slate from sitemap)
    const deleted = await prisma.tenant.deleteMany({
        where: { locationId },
    });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants for ${locationName}`);

    console.log(`📦 Inserting ${tenants.length} tenants for ${locationName}...`);
    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            await prisma.tenant.create({
                data: {
                    locationId,
                    name: t.name,
                    category: t.category,
                    subcategory: t.subcategory || null,
                    isAnchorTenant: t.isAnchorTenant || false,
                },
            });
            created++;
        } catch (err: any) {
            console.warn(`  ⚠️ Skipped "${t.name}": ${err.message.slice(0, 80)}`);
            skipped++;
        }
    }

    console.log(`  ✅ ${created} inserted, ${skipped} skipped`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Landsec Trio Enrichment V2 — Feb 2026");
    console.log("  Source: Official sitemaps + CACI categories");
    console.log("═══════════════════════════════════════════════\n");

    // Phase 1: Update location fields
    await enrichLocations();

    // Phase 2: Replace tenants (delete old → insert fresh from sitemap)
    await replaceTenants(
        "cmks95l980005fajkx22y1ctx",
        "St David's Dewi Sant",
        stDavidsTenants
    );
    await replaceTenants(
        "cmid0jnny00fimtpupmc75o4u",
        "Clarks Village",
        clarksVillageTenants
    );
    await replaceTenants(
        "cmksemajw000boqpn46fxb97w",
        "Xscape Milton Keynes",
        xscapeMKTenants
    );

    // Phase 3: Verify
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification");
    console.log("═══════════════════════════════════════════════\n");

    const ids = [
        "cmks95l980005fajkx22y1ctx",
        "cmid0jnny00fimtpupmc75o4u",
        "cmksemajw000boqpn46fxb97w",
    ];

    for (const id of ids) {
        const loc = await prisma.location.findUnique({
            where: { id },
            select: {
                name: true,
                owner: true,
                numberOfStores: true,
                anchorTenants: true,
                googleRating: true,
                footfall: true,
                evCharging: true,
                openedYear: true,
                population: true,
                _count: { select: { tenants: true } },
            },
        });
        if (loc) {
            console.log(`📍 ${loc.name}`);
            console.log(
                `   Owner: ${loc.owner} | Stores: ${loc.numberOfStores} | DB Tenants: ${loc._count.tenants}`
            );
            console.log(
                `   Anchors: ${loc.anchorTenants} | Rating: ${loc.googleRating} | Footfall: ${loc.footfall?.toLocaleString()}`
            );
            console.log(
                `   EV: ${loc.evCharging} | Opened: ${loc.openedYear} | Pop: ${loc.population?.toLocaleString()}`
            );

            // Category breakdown
            const catBreakdown = await prisma.tenant.groupBy({
                by: ["category"],
                where: { locationId: id },
                _count: true,
                orderBy: { _count: { category: "desc" } },
            });
            console.log(
                `   Categories: ${catBreakdown.map((c) => `${c.category}(${c._count})`).join(", ")}`
            );
            console.log();
        }
    }

    console.log("✅ Enrichment V2 complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
