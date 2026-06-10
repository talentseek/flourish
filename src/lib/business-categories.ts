/**
 * Business category taxonomy for outreach lead discovery.
 * Each category maps to multiple Google Places text search queries
 * to maximise coverage and relevance.
 */

export interface BusinessCategory {
    key: string
    label: string
    queries: string[]
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
    {
        key: "FLORIST",
        label: "Florist / Flower Shop",
        queries: ["florist", "flower shop", "flower delivery", "wedding flowers"],
    },
    {
        key: "COFFEE_SHOP",
        label: "Coffee Shop / Café",
        queries: ["coffee shop", "cafe", "independent coffee", "specialty coffee"],
    },
    {
        key: "BAKERY",
        label: "Bakery",
        queries: ["bakery", "artisan bakery", "cake shop", "patisserie"],
    },
    {
        key: "RESTAURANT",
        label: "Restaurant",
        queries: ["restaurant", "independent restaurant", "dining"],
    },
    {
        key: "FAST_FOOD",
        label: "Fast Food / Takeaway",
        queries: ["fast food", "takeaway", "quick service restaurant"],
    },
    {
        key: "HAIR_SALON",
        label: "Hair & Beauty Salon",
        queries: ["hair salon", "beauty salon", "barber shop", "hairdresser"],
    },
    {
        key: "NAIL_SALON",
        label: "Nail Bar",
        queries: ["nail salon", "nail bar", "manicure pedicure"],
    },
    {
        key: "GYM_FITNESS",
        label: "Gym / Fitness",
        queries: ["gym", "fitness studio", "personal trainer", "yoga studio"],
    },
    {
        key: "PET_SHOP",
        label: "Pet Shop",
        queries: ["pet shop", "pet store", "pet supplies", "pet grooming"],
    },
    {
        key: "JEWELLER",
        label: "Jeweller",
        queries: ["jeweller", "jewelry shop", "watch shop", "goldsmith"],
    },
    {
        key: "CLOTHING",
        label: "Clothing / Fashion",
        queries: ["clothing store", "fashion boutique", "dress shop"],
    },
    {
        key: "PHONE_REPAIR",
        label: "Phone / Electronics Repair",
        queries: ["phone repair", "electronics repair", "screen repair"],
    },
    {
        key: "VAPE_SHOP",
        label: "Vape / E-Cigarette",
        queries: ["vape shop", "e-cigarette", "vaping store"],
    },
    {
        key: "CHARITY_SHOP",
        label: "Charity Shop",
        queries: ["charity shop", "thrift store", "second hand shop"],
    },
    {
        key: "GIFT_SHOP",
        label: "Gift Shop / Cards",
        queries: ["gift shop", "card shop", "greeting cards", "gifts"],
    },
    {
        key: "HEALTH_FOOD",
        label: "Health Food / Supplements",
        queries: ["health food shop", "supplement store", "organic food"],
    },
    {
        key: "BUTCHER",
        label: "Butcher / Deli",
        queries: ["butcher", "delicatessen", "deli", "meat shop"],
    },
    {
        key: "DRY_CLEANER",
        label: "Dry Cleaner / Laundry",
        queries: ["dry cleaner", "laundry", "alterations"],
    },
    {
        key: "OPTICIAN",
        label: "Optician",
        queries: ["optician", "eye test", "glasses shop", "optical"],
    },
    {
        key: "TRAVEL_AGENT",
        label: "Travel Agent",
        queries: ["travel agent", "travel agency", "holiday shop"],
    },
]

/** Lookup a category by key */
export function getCategoryByKey(key: string): BusinessCategory | undefined {
    return BUSINESS_CATEGORIES.find((c) => c.key === key)
}

/** Get all category options for dropdowns */
export function getCategoryOptions(): { value: string; label: string }[] {
    return BUSINESS_CATEGORIES.map((c) => ({
        value: c.key,
        label: c.label,
    }))
}
