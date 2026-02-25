/**
 * Bluewater — Full Enrichment
 *
 * One of the UK's largest shopping centres, in Greenhithe, Kent.
 * 300+ stores, 60+ restaurants, leisure attractions.
 * Opened 1999, majority-owned by Landsec (66.25%).
 *
 * Sources:
 *   - bluewater.co.uk/sitemap.xml (shop-listing, eat-listing, play-listing)
 *   - Wikipedia, Landsec, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-bluewater.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kq3f01jemtpu3o9ttf3g";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from bluewater.co.uk sitemap
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // === SHOP LISTING ===

    // --- Department Stores / Anchors ---
    { name: "John Lewis", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "M&S", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },

    // --- Clothing & Footwear ---
    { name: "Abercrombie & Fitch", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Apricot", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Boss Menswear", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Calvin Klein", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Charles Tyrwhitt", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Diesel", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Dune London", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Gant", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Hawes & Curtis", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Jones Bootmaker", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "L.K.Bennett", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Lacoste", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Lindex", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Massimo Dutti", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Michael Kors", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Era", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Newbie", category: "Clothing & Footwear", subcategory: "Childrenswear" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Peter Alexander", category: "Clothing & Footwear", subcategory: "Loungewear" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Pink Vanilla", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Polo Ralph Lauren", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Pull&Bear", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Ribble", category: "Clothing & Footwear", subcategory: "Cycling" },
    { name: "Rigby & Peller", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Rodd & Gunn", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Runners Need", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Russell & Bromley", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Santoro Milan Menswear", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Snow+Rock", category: "Clothing & Footwear", subcategory: "Snow Sports" },
    { name: "Sole Trader", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Suit Direct", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Superdry", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Sweaty Betty", category: "Clothing & Footwear", subcategory: "Activewear" },
    { name: "Tessuti", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Uniqlo", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Vans", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Victoria's Secret", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "VIP Fashion Boutique", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Whistles", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "White Stuff", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "Just In Case", category: "Clothing & Footwear", subcategory: "Luggage" },

    // --- Jewellery & Watches ---
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Bremont", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Chisholm Hunter", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Fraser Hart", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Jewells", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Mappin & Webb", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Omega", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Rolex at Mappin & Webb", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Tag Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Tudor", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "The Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Watchfinder", category: "Jewellery & Watches", subcategory: "Watches" },

    // --- Health & Beauty ---
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Aesop", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Arabian Oud", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Bath & Body Works", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Boots Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Dermalogica", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Gorj", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Herbal Inn", category: "Health & Beauty", subcategory: "Wellness" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "Jo Malone", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Kiko Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Laser Clinics UK", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "M&S Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Penhaligon's", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Slava Nails", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Sunnamusk London", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Nail Spa", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Therapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Trinny London", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "David Clulow", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Toni&Guy", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Smile Tech Dental", category: "Health & Beauty", subcategory: "Dental" },
    { name: "Delmora", category: "Health & Beauty", subcategory: "Skincare" },

    // --- Food & Grocery ---
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Lindt", category: "Food & Grocery", subcategory: "Chocolatier" },
    { name: "Haribo", category: "Food & Grocery", subcategory: "Confectionery" },
    { name: "Nespresso", category: "Food & Grocery", subcategory: "Deli" },
    { name: "Whittard", category: "Food & Grocery", subcategory: "Deli" },
    { name: "Mr Simms Olde Sweet Shoppe", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Waitrose Foodhall at John Lewis", category: "Food & Grocery", subcategory: "Supermarket" },
    { name: "Cocoba", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Bird & Blend Tea Co", category: "Food & Grocery", subcategory: "Deli" },

    // --- Electrical & Technology ---
    { name: "Dyson", category: "Electrical & Technology", subcategory: "Home Appliances" },
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Tesla", category: "Electrical & Technology", subcategory: "Consumer Electronics" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Miele", category: "Electrical & Technology", subcategory: "Home Appliances" },
    { name: "Ego Italiano", category: "Electrical & Technology", subcategory: "Home Appliances" },

    // --- Home & Garden ---
    { name: "Inside Story", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Lakeland", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Oliver Bonas", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Residence", category: "Home & Garden", subcategory: "Furniture" },
    { name: "Tempur", category: "Home & Garden", subcategory: "Bedding" },
    { name: "The White Company", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Vanilla", category: "Home & Garden", subcategory: "Home Fragrance" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // --- Gifts & Stationery ---
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Castle Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Clarendon Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Clintons", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Ryman Design", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },

    // --- General Retail ---
    { name: "Custom & Co", category: "General Retail", subcategory: "Specialist" },
    { name: "Daisy's Dog Empawrium", category: "General Retail", subcategory: "Specialist" },
    { name: "DRM LND", category: "General Retail", subcategory: "Specialist" },
    { name: "Flying Tiger", category: "General Retail", subcategory: "Variety Store" },
    { name: "Menkind", category: "General Retail", subcategory: "Specialist" },
    { name: "Miniso", category: "General Retail", subcategory: "Variety Store" },
    { name: "Saboteur", category: "General Retail", subcategory: "Specialist" },

    // --- Kids & Toys ---
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Learning Shop", category: "Kids & Toys", subcategory: "Toys" },

    // --- Services ---
    { name: "Ability Plus", category: "Services", subcategory: "Specialist" },
    { name: "Bespoke Tailoring & Alterations", category: "Services", subcategory: "Alterations" },
    { name: "Hays Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Kuoni", category: "Services", subcategory: "Travel Agency" },
    { name: "The Carwash Company", category: "Services", subcategory: "Car Wash" },
    { name: "The Newsagent (Winter Garden)", category: "Services", subcategory: "Newsagent" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "TUI", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },

    // --- Financial Services ---
    { name: "eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Halifax", category: "Financial Services", subcategory: "Bank" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },

    // === EAT LISTING ===

    // --- Cafes & Restaurants ---
    { name: "ASK Italian", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bagel Factory", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bella Italia", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Big Easy", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bill's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Black Sheep Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Boost", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "Browns", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Bubbleology", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Buenasado", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Carluccio's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Côte Brasserie", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "GBK", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Joe & The Juice", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Leon", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Lola's Cupcakes", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Mr Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Ori Caffé", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Pho", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "PizzaExpress", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Rosa's Thai", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Sblended", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Shawa", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Sides", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Sizzled", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Stacked", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Starbucks (Guildhall)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks (Rose Gallery)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Tapas Revolution", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "TGI Friday's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Tortilla", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wasabi", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Yangtze", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "YO! Sushi", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // === PLAY LISTING ===

    // --- Leisure & Entertainment ---
    { name: "Showcase Cinema de Lux", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },
    { name: "Gravity", category: "Leisure & Entertainment", subcategory: "Trampoline Park" },
    { name: "Gravity Rocks", category: "Leisure & Entertainment", subcategory: "Climbing" },
    { name: "Gravity Arcade", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Ballerz", category: "Leisure & Entertainment", subcategory: "Social Gaming" },
    { name: "Dinotropolis", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Hangloose Adventure", category: "Leisure & Entertainment", subcategory: "Adventure" },
    { name: "Young Driver", category: "Leisure & Entertainment", subcategory: "Adventure" },

    // --- TG Jones (Dry Cleaning) found in shop-listing ---
    { name: "TG Jones", category: "Services", subcategory: "Dry Cleaning" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Bluewater metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://www.bluewater.co.uk",
            phone: "01322 427 000",
            openingHours: { "Mon-Fri": "10:00-21:00", Sat: "10:00-21:00", Sun: "11:00-17:00" },
            parkingSpaces: 13000,
            retailSpace: 1600000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 3,
            anchorTenants: 9,
            publicTransit:
                "Bluewater bus station with Fastrack and local routes. Greenhithe station (Southeastern) 10-min walk. M25 Junction 2.",
            owner: "Landsec (66.25%)",
            management: "Landsec",
            openedYear: 1999,
            footfall: 27000000,
            heroImage:
                "https://images.trvl-media.com/place/6143545/f68df836-73ef-48ed-82f9-4cf5c98b10da.jpg",
            evCharging: true,
            evChargingSpaces: 100,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/bluewaterkent/",
            facebook: "https://www.facebook.com/bluewatershoppingcentre/",
            twitter: "https://twitter.com/bluabordewater",
            tiktok: "https://www.tiktok.com/@bluewater",
            googleRating: 4.4,
            googleReviews: 62000,
        },
    });
    console.log("  ✅ Location metadata updated");
}

// ============================================================
// Tenant upsert — clean + re-insert
// ============================================================

async function insertTenants() {
    const deleted = await prisma.tenant.deleteMany({ where: { locationId: LOCATION_ID } });
    console.log(`\n🗑️  Deleted ${deleted.count} old tenants`);
    console.log(`📦 Inserting ${tenants.length} tenants...`);

    let created = 0;
    let skipped = 0;

    for (const t of tenants) {
        try {
            await prisma.tenant.create({
                data: {
                    locationId: LOCATION_ID,
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
// Update largest category fields
// ============================================================

async function updateLargestCategory() {
    const cats = await prisma.tenant.groupBy({
        by: ["category"],
        where: { locationId: LOCATION_ID },
        _count: true,
        orderBy: { _count: { category: "desc" } },
    });
    const total = cats.reduce((sum, c) => sum + c._count, 0);
    if (cats.length > 0 && total > 0) {
        await prisma.location.update({
            where: { id: LOCATION_ID },
            data: {
                largestCategory: cats[0].category,
                largestCategoryPercent: Number((cats[0]._count / total).toFixed(3)),
            },
        });
        console.log(
            `\n📊 Largest category: ${cats[0].category} (${((cats[0]._count / total) * 100).toFixed(1)}%)`
        );
    }
}

// ============================================================
// Verification
// ============================================================

async function verify() {
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification");
    console.log("═══════════════════════════════════════════════\n");

    const loc = await prisma.location.findUnique({
        where: { id: LOCATION_ID },
        select: {
            name: true,
            numberOfStores: true,
            owner: true,
            openedYear: true,
            parkingSpaces: true,
            footfall: true,
            retailSpace: true,
            heroImage: true,
            largestCategory: true,
            largestCategoryPercent: true,
            _count: { select: { tenants: true } },
        },
    });

    if (loc) {
        console.log(`📍 ${loc.name}`);
        console.log(`   Owner: ${loc.owner}`);
        console.log(`   Opened: ${loc.openedYear}`);
        console.log(`   Parking: ${loc.parkingSpaces}`);
        console.log(`   Footfall: ${loc.footfall}`);
        console.log(`   Retail Space: ${loc.retailSpace}`);
        console.log(`   Hero Image: ${loc.heroImage ? "✅ Set" : "❌ Missing"}`);
        console.log(`   DB Tenants: ${loc._count.tenants}`);
        console.log(
            `   Largest: ${loc.largestCategory} (${((Number(loc.largestCategoryPercent) || 0) * 100).toFixed(1)}%)`
        );

        const cats = await prisma.tenant.groupBy({
            by: ["category"],
            where: { locationId: LOCATION_ID },
            _count: true,
            orderBy: { _count: { category: "desc" } },
        });
        console.log(
            `   Categories: ${cats.map((c) => `${c.category}(${c._count})`).join(", ")}`
        );
    }
}

// ============================================================
// Main
// ============================================================

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  Bluewater — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Bluewater enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
