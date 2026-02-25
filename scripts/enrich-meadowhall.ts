/**
 * Meadowhall Centre — Full Enrichment
 *
 * One of the UK's largest out-of-town shopping centres, in Sheffield.
 * 290+ stores across 2 levels, plus The Lanes dining quarter.
 * Opened 1990, owned by British Land.
 *
 * Sources:
 *   - meadowhall.co.uk/eatdrinkshop-sitemap.xml (tenants)
 *   - Wikipedia, British Land, press releases (metadata)
 *
 * Run: npx tsx scripts/enrich-meadowhall.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATION_ID = "cmid0kwm801q0mtpuj3na7ywb";

interface TenantInput {
    name: string;
    category: string;
    subcategory?: string;
    isAnchorTenant?: boolean;
}

// ============================================================
// Tenants extracted from meadowhall.co.uk/eatdrinkshop-sitemap.xml
// Categories use canonical LDC 3-Tier Taxonomy
// ============================================================

const tenants: TenantInput[] = [
    // === ANCHORS / DEPARTMENT STORES ===
    { name: "Marks & Spencer", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "Primark", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Next", category: "Clothing & Footwear", subcategory: "Mid-Range", isAnchorTenant: true },
    { name: "Zara", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "H&M", category: "Clothing & Footwear", subcategory: "Fast Fashion", isAnchorTenant: true },
    { name: "Apple", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "JD Sports", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Flannels", category: "Clothing & Footwear", subcategory: "Designer", isAnchorTenant: true },
    { name: "Frasers", category: "Department Stores", subcategory: "Department Store", isAnchorTenant: true },
    { name: "TK Maxx", category: "Clothing & Footwear", subcategory: "Off-Price", isAnchorTenant: true },
    { name: "Sports Direct", category: "Clothing & Footwear", subcategory: "Sportswear", isAnchorTenant: true },
    { name: "Currys", category: "Electrical & Technology", subcategory: "Consumer Electronics", isAnchorTenant: true },
    { name: "Vue Cinema", category: "Leisure & Entertainment", subcategory: "Cinema", isAnchorTenant: true },

    // === CLOTHING & FOOTWEAR ===
    { name: "Accessorize", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "AllSaints", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Ann Summers", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Apricot", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Bershka", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Boss", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Boux Avenue", category: "Clothing & Footwear", subcategory: "Lingerie" },
    { name: "Carvela", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Castore", category: "Clothing & Footwear", subcategory: "Sportswear" },
    { name: "Clarks", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Dr. Martens", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Dune London", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Fat Face", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Foot Locker", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Footasylum", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "French Connection", category: "Clothing & Footwear", subcategory: "Contemporary" },
    { name: "Gucci", category: "Clothing & Footwear", subcategory: "Luxury", isAnchorTenant: true },
    { name: "Hawes & Curtis", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Hobbs", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Hollister", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Jack & Jones", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Joe Browns", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Kurt Geiger", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Lacoste", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Levi's", category: "Clothing & Footwear", subcategory: "Denim" },
    { name: "Mango", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Michael Kors", category: "Clothing & Footwear", subcategory: "Designer" },
    { name: "Moda in Pelle", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Moss", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "New Era", category: "Clothing & Footwear", subcategory: "Accessories" },
    { name: "New Look", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Office", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Phase Eight", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Quiz", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Reiss", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Rieker", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "River Island", category: "Clothing & Footwear", subcategory: "Fast Fashion" },
    { name: "Schuh", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Schuh Kids", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Seasalt", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "Size?", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Skechers", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Skopes", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Suit Direct", category: "Clothing & Footwear", subcategory: "Menswear" },
    { name: "Sweaty Betty", category: "Clothing & Footwear", subcategory: "Activewear" },
    { name: "The North Face", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Timberland", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Tommy Hilfiger", category: "Clothing & Footwear", subcategory: "Premium" },
    { name: "Urban Outfitters", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Vans", category: "Clothing & Footwear", subcategory: "Trainers" },
    { name: "Weird Fish", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "White Stuff", category: "Clothing & Footwear", subcategory: "Casual" },
    { name: "Yours Clothing", category: "Clothing & Footwear", subcategory: "Plus Size" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Shoe Zone", category: "Clothing & Footwear", subcategory: "Footwear" },
    { name: "Go Outdoors", category: "Clothing & Footwear", subcategory: "Outdoor" },
    { name: "Milano Couture", category: "Clothing & Footwear", subcategory: "Womenswear" },
    { name: "USA Sports", category: "Clothing & Footwear", subcategory: "Sportswear" },

    // === JEWELLERY & WATCHES ===
    { name: "Beaverbrooks", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Breitling", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Ernest Jones", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "F. Hinds", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Fraser Hart", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Goldsmiths", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "H. Samuel", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Lovisa", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Nomination", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Omega Boutique", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Pandora", category: "Jewellery & Watches", subcategory: "Fashion Jewellery" },
    { name: "Rolex Boutique", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Swarovski", category: "Jewellery & Watches", subcategory: "Crystal Jewellery" },
    { name: "Swatch", category: "Jewellery & Watches", subcategory: "Watches" },
    { name: "Tag Heuer", category: "Jewellery & Watches", subcategory: "Luxury Watches" },
    { name: "Thomas Sabo", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Warren James", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Watch Lab", category: "Jewellery & Watches", subcategory: "Watch Repair" },
    { name: "Austen & Blake", category: "Jewellery & Watches", subcategory: "Jewellery" },
    { name: "Weld & Wore", category: "Jewellery & Watches", subcategory: "Jewellery" },

    // === HEALTH & BEAUTY ===
    { name: "Bath & Body Works", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Beauty Boutique", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "Boots", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "Brows", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "City Specs Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Cleopatra", category: "Health & Beauty", subcategory: "Beauty Salon" },
    { name: "DXB Perfume", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Holland & Barrett", category: "Health & Beauty", subcategory: "Health Food Store" },
    { name: "iTreatSkin", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Kiko Milano", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "L'Occitane", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Lush", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "M&S Opticians", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Mii Korean Skincare", category: "Health & Beauty", subcategory: "Skincare" },
    { name: "Mint Nail & Brow Bar", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Molton Brown", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "Optical Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Pop Specs", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Ray-Ban", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Rituals", category: "Health & Beauty", subcategory: "Body Care" },
    { name: "Sephora", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Space NK", category: "Health & Beauty", subcategory: "Premium Cosmetics" },
    { name: "Sunglass Hut", category: "Health & Beauty", subcategory: "Eyewear" },
    { name: "Sunnamusk", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Supercuts", category: "Health & Beauty", subcategory: "Hair Salon" },
    { name: "Superdrug", category: "Health & Beauty", subcategory: "Pharmacy" },
    { name: "The Body Shop", category: "Health & Beauty", subcategory: "Bath & Body" },
    { name: "The Fragrance Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "The Perfume Shop (Gallery)", category: "Health & Beauty", subcategory: "Fragrance" },
    { name: "Thérapie Clinic", category: "Health & Beauty", subcategory: "Aesthetics" },
    { name: "Townhouse", category: "Health & Beauty", subcategory: "Nail Salon" },
    { name: "Trinny London", category: "Health & Beauty", subcategory: "Cosmetics" },
    { name: "Vision Express", category: "Health & Beauty", subcategory: "Optician" },
    { name: "Candles & Oud", category: "Health & Beauty", subcategory: "Fragrance" },

    // === ELECTRICAL & TECHNOLOGY ===
    { name: "EE", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "HMV", category: "Electrical & Technology", subcategory: "Entertainment Retail" },
    { name: "iSmash", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "Jessops", category: "Electrical & Technology", subcategory: "Photography" },
    { name: "Mobile Bitz", category: "Electrical & Technology", subcategory: "Mobile Repair" },
    { name: "O2", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Polestar", category: "Electrical & Technology", subcategory: "Automotive" },
    { name: "Sky", category: "Electrical & Technology", subcategory: "Telecoms" },
    { name: "Three", category: "Electrical & Technology", subcategory: "Mobile Network" },
    { name: "Vodafone", category: "Electrical & Technology", subcategory: "Mobile Network" },

    // === HOME & GARDEN ===
    { name: "Lakeland", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Oliver Bonas", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "ProCook", category: "Home & Garden", subcategory: "Kitchenware" },
    { name: "Sharps Bedrooms", category: "Home & Garden", subcategory: "Bedding" },
    { name: "The White Company", category: "Home & Garden", subcategory: "Home & Lifestyle" },
    { name: "Vanilla", category: "Home & Garden", subcategory: "Home Fragrance" },
    { name: "Yankee Candle", category: "Home & Garden", subcategory: "Home Fragrance" },

    // === GIFTS & STATIONERY ===
    { name: "Card Factory", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Cardzone", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Castle Fine Art", category: "Gifts & Stationery", subcategory: "Art Gallery" },
    { name: "Claire's", category: "Gifts & Stationery", subcategory: "Gifts" },
    { name: "Clinton Cards", category: "Gifts & Stationery", subcategory: "Cards & Gifts" },
    { name: "Flying Tiger Copenhagen", category: "Gifts & Stationery", subcategory: "Variety Store" },
    { name: "Menkind", category: "Gifts & Stationery", subcategory: "Specialist" },
    { name: "Miniso", category: "Gifts & Stationery", subcategory: "Variety Store" },
    { name: "Smiggle", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "The Works", category: "Gifts & Stationery", subcategory: "Books & Stationery" },
    { name: "Typo", category: "Gifts & Stationery", subcategory: "Stationery" },
    { name: "Waterstones", category: "Gifts & Stationery", subcategory: "Books" },
    { name: "Zen Gifts", category: "Gifts & Stationery", subcategory: "Gifts" },

    // === FOOD & GROCERY ===
    { name: "Hotel Chocolat", category: "Food & Grocery", subcategory: "Chocolate Shop" },
    { name: "Krispy Kreme", category: "Food & Grocery", subcategory: "Bakery" },
    { name: "Lindt", category: "Food & Grocery", subcategory: "Chocolatier" },
    { name: "Sweet Tradition", category: "Food & Grocery", subcategory: "Sweet Shop" },
    { name: "Whittard of Chelsea", category: "Food & Grocery", subcategory: "Deli" },

    // === KIDS & TOYS ===
    { name: "Build-A-Bear Workshop", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "It's So Fluffy", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Kids Around", category: "Kids & Toys", subcategory: "Childrenswear" },
    { name: "LEGO Store", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "The Entertainer", category: "Kids & Toys", subcategory: "Toy Store" },
    { name: "Oliver's Childrenswear", category: "Kids & Toys", subcategory: "Childrenswear" },
    { name: "Fan Cave", category: "Kids & Toys", subcategory: "Character Merchandise" },

    // === CAFES & RESTAURANTS ===
    { name: "Alexander Brown", category: "Cafes & Restaurants", subcategory: "Bar & Restaurant" },
    { name: "Bagel Factory", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Barburrito", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Batch'd", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Batch'd (The Lanes)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Bean Coffee Roasters", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Boost (Arcade)", category: "Cafes & Restaurants", subcategory: "Juice Bar" },
    { name: "Boost (Upper Gallery)", category: "Cafes & Restaurants", subcategory: "Juice Bar" },
    { name: "Boost (Lanes)", category: "Cafes & Restaurants", subcategory: "Juice Bar" },
    { name: "Bubble CiTea", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Bubble CiTea (Lower High Street)", category: "Cafes & Restaurants", subcategory: "Bubble Tea" },
    { name: "Burger King", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Caffè Massarella", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffè Nero", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Caffè Rizzoli", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Carluccio's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Cawa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Chopstix", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Clubhouse", category: "Cafes & Restaurants", subcategory: "Bar & Restaurant" },
    { name: "Costa Coffee", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Costa Coffee (Next)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Five Guys", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Frankie & Benny's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "German Doner Kebab", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Greggs (Lower Gallery)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Greggs (High Street)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Harriet's", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "HiiGrind (inside Flannels)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Iced", category: "Cafes & Restaurants", subcategory: "Dessert" },
    { name: "KFC", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Krispy Kreme (Kiosk)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Las Iguanas", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Let's Sushi", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Maki Ramen", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "McDonald's", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Millie's Cookies", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Millie's Cookies (Lanes)", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Mr Pretzels", category: "Cafes & Restaurants", subcategory: "Bakery" },
    { name: "Nando's", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Pizza Express", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Pizza Hut Express", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Popeyes Chicken", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Pret A Manger", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Rolled", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Shake Lab", category: "Cafes & Restaurants", subcategory: "Milkshake Bar" },
    { name: "Slim Chickens", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Snowflake Gelato", category: "Cafes & Restaurants", subcategory: "Ice Cream" },
    { name: "Starbucks (Lower Gallery)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Starbucks (Arcade)", category: "Cafes & Restaurants", subcategory: "Coffee Shop" },
    { name: "Steel Foundry (Wetherspoon)", category: "Cafes & Restaurants", subcategory: "Pub" },
    { name: "Subway", category: "Cafes & Restaurants", subcategory: "Sandwich Shop" },
    { name: "Taco Bell", category: "Cafes & Restaurants", subcategory: "Fast Food" },
    { name: "Taste the Best", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Tasty Plaice", category: "Cafes & Restaurants", subcategory: "Fish & Chips" },
    { name: "TGI Friday's", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Thaikhun", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "The Cream Store", category: "Cafes & Restaurants", subcategory: "Ice Cream" },
    { name: "The Real Greek", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wagamama", category: "Cafes & Restaurants", subcategory: "Restaurant" },
    { name: "Wingstop", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "YO! Sushi", category: "Cafes & Restaurants", subcategory: "Fast Casual" },
    { name: "Yogoo", category: "Cafes & Restaurants", subcategory: "Ice Cream" },
    { name: "Zizzi", category: "Cafes & Restaurants", subcategory: "Restaurant" },

    // === LEISURE & ENTERTAINMENT ===
    { name: "Air Haus", category: "Leisure & Entertainment", subcategory: "Trampoline Park" },
    { name: "Funstation", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Jump Inc", category: "Leisure & Entertainment", subcategory: "Trampoline Park" },
    { name: "Lanes", category: "Leisure & Entertainment", subcategory: "Bowling" },
    { name: "Music Box", category: "Leisure & Entertainment", subcategory: "Arcade" },
    { name: "Riverside Playground", category: "Leisure & Entertainment", subcategory: "Play Area" },
    { name: "Rock", category: "Leisure & Entertainment", subcategory: "Climbing" },

    // === SERVICES ===
    { name: "Argos", category: "General Retail", subcategory: "Catalogue Store" },
    { name: "Car Wash Company", category: "Services", subcategory: "Car Wash" },
    { name: "ColeyCoJo", category: "Services", subcategory: "Specialist" },
    { name: "Customer Hub", category: "Services", subcategory: "Information" },
    { name: "Daily News", category: "Services", subcategory: "Newsagent" },
    { name: "GT News", category: "Services", subcategory: "Newsagent" },
    { name: "Hays Travel", category: "Services", subcategory: "Travel Agency" },
    { name: "Kuoni", category: "Services", subcategory: "Travel Agency" },
    { name: "Max Spielmann", category: "Services", subcategory: "Photography" },
    { name: "Poundland", category: "General Retail", subcategory: "Variety Store" },
    { name: "Shop Under the Stairs", category: "General Retail", subcategory: "Specialist" },
    { name: "TG Jones", category: "Services", subcategory: "Dry Cleaning" },
    { name: "Timpson", category: "Services", subcategory: "Shoe Repair" },
    { name: "Tool Shed", category: "General Retail", subcategory: "Hardware" },
    { name: "TUI Holiday Store", category: "Services", subcategory: "Travel Agency" },
    { name: "Virgin Holidays", category: "Services", subcategory: "Travel Agency" },
    { name: "Kenji", category: "General Retail", subcategory: "Variety Store" },
    { name: "Allsorts", category: "General Retail", subcategory: "Sweet Shop" },
    { name: "Extravagance", category: "General Retail", subcategory: "Specialist" },

    // === FINANCIAL SERVICES ===
    { name: "Eurochange", category: "Financial Services", subcategory: "Currency Exchange" },
    { name: "Halifax", category: "Financial Services", subcategory: "Bank" },
    { name: "HSBC", category: "Financial Services", subcategory: "Bank" },
    { name: "Nationwide Building Society", category: "Financial Services", subcategory: "Building Society" },
    { name: "TSB", category: "Financial Services", subcategory: "Bank" },
];

// ============================================================
// Location metadata
// ============================================================

async function enrichLocation() {
    console.log("🔄 Enriching Meadowhall metadata...");
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: {
            website: "https://meadowhall.co.uk",
            phone: "0114 256 8800",
            openingHours: { "Mon-Fri": "10:00-21:00", Sat: "09:00-20:00", Sun: "11:00-17:00" },
            parkingSpaces: 12000,
            retailSpace: 1500000,
            numberOfStores: tenants.length,
            retailers: tenants.length,
            numberOfFloors: 2,
            anchorTenants: 14,
            publicTransit:
                "Meadowhall Interchange (tram, bus, train). Sheffield Supertram. Northern Rail/CrossCountry services. M1 Junction 34.",
            owner: "British Land",
            management: "British Land",
            openedYear: 1990,
            footfall: 23000000,
            heroImage:
                "https://d53bpfpeyyyn7.cloudfront.net/Pictures/780xany/5/5/7/3114557_meadowhall.jpg",
            evCharging: true,
            evChargingSpaces: 60,
            carParkPrice: 0,
            instagram: "https://www.instagram.com/meadowhallcentre/",
            facebook: "https://www.facebook.com/Meadowhall/",
            twitter: "https://twitter.com/Abormeadowhall",
            tiktok: "https://www.tiktok.com/@meadowhallcentre",
            googleRating: 4.4,
            googleReviews: 42000,
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
    console.log("  Meadowhall Centre — Full Enrichment");
    console.log("═══════════════════════════════════════════════\n");

    await enrichLocation();
    await insertTenants();
    await updateLargestCategory();
    await verify();

    console.log("\n✅ Meadowhall enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
