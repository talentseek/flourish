/**
 * Companies House API Service
 *
 * Searches for UK companies by number or name and retrieves
 * company status, accounts due date, and confirmation statement due date.
 *
 * API: https://developer.company-information.service.gov.uk/
 * Rate limit: 600 requests per 5 minutes
 * Cost: FREE
 */

const CH_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || ''
const CH_BASE_URL = 'https://api.company-information.service.gov.uk'

export interface CompanyProfile {
    companyNumber: string
    companyName: string
    companyStatus: string
    companyType: string
    registeredAddress: string
    accountsNextDue: string | null
    confirmationNextDue: string | null
    sicCodes: string[]
}

export interface CompanyCheckResult {
    found: boolean
    isActive: boolean
    company: CompanyProfile | null
    error?: string
}

async function chFetch(path: string): Promise<any> {
    if (!CH_API_KEY) {
        throw new Error('COMPANIES_HOUSE_API_KEY not configured')
    }

    const response = await fetch(`${CH_BASE_URL}${path}`, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${CH_API_KEY}:`).toString('base64')}`,
        },
        signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
        if (response.status === 429) {
            await new Promise(r => setTimeout(r, 5000))
            return chFetch(path)
        }
        throw new Error(`Companies House API ${response.status}: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Get a company profile directly by company number.
 */
export async function getCompanyProfile(companyNumber: string): Promise<CompanyCheckResult> {
    try {
        const data = await chFetch(`/company/${companyNumber}`)

        const address = data.registered_office_address
            ? [
                data.registered_office_address.address_line_1,
                data.registered_office_address.locality,
                data.registered_office_address.postal_code,
            ].filter(Boolean).join(', ')
            : ''

        const company: CompanyProfile = {
            companyNumber: data.company_number,
            companyName: data.company_name,
            companyStatus: data.company_status,
            companyType: data.type || '',
            registeredAddress: address,
            accountsNextDue: data.accounts?.next_due || null,
            confirmationNextDue: data.confirmation_statement?.next_due || null,
            sicCodes: data.sic_codes || [],
        }

        return {
            found: true,
            isActive: data.company_status === 'active',
            company,
        }
    } catch (err: any) {
        return { found: false, isActive: false, company: null, error: err.message }
    }
}

/**
 * Search for companies by name, return the best active match.
 */
export async function searchCompanyByName(businessName: string): Promise<CompanyCheckResult> {
    try {
        const cleanName = businessName
            .replace(/\b(Ltd|Limited|PLC|LLP|Inc)\b/gi, '')
            .replace(/[^\w\s]/g, '')
            .trim()

        const query = encodeURIComponent(cleanName)
        const data = await chFetch(`/search/companies?q=${query}&items_per_page=5`)

        if (!data.items || data.items.length === 0) {
            return { found: false, isActive: false, company: null, error: 'No companies found' }
        }

        // Sort by match quality — prefer exact/contains match + active status
        const scored = data.items
            .filter((item: any) => item.company_status === 'active')
            .map((item: any) => ({
                item,
                score: calculateMatchScore(businessName, item.title),
            }))
            .sort((a: any, b: any) => b.score - a.score)

        if (scored.length === 0 || scored[0].score < 40) {
            return { found: false, isActive: false, company: null, error: 'No good match found' }
        }

        // Get full profile for the best match
        const bestMatch = scored[0].item
        return getCompanyProfile(bestMatch.company_number)
    } catch (err: any) {
        return { found: false, isActive: false, company: null, error: err.message }
    }
}

/**
 * Main entry point: check by number first, fall back to name search.
 */
export async function checkCompany(
    companyName: string,
    companyNumber?: string | null,
): Promise<CompanyCheckResult> {
    if (!CH_API_KEY) {
        return { found: false, isActive: false, company: null, error: 'COMPANIES_HOUSE_API_KEY not configured' }
    }

    if (companyNumber) {
        const result = await getCompanyProfile(companyNumber)
        if (result.found) return result
        // Fall through to name search if number lookup fails
    }

    return searchCompanyByName(companyName)
}

function calculateMatchScore(businessName: string, companyName: string): number {
    let score = 0

    const bizLower = businessName.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const coLower = companyName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\b(ltd|limited|plc|llp)\b/g, '').trim()

    if (bizLower === coLower) {
        score += 60
    } else if (coLower.includes(bizLower) || bizLower.includes(coLower)) {
        score += 40
    } else {
        const bizWords = new Set(bizLower.split(/\s+/))
        const coWords = new Set(coLower.split(/\s+/))
        const overlap = Array.from(bizWords).filter(w => coWords.has(w) && w.length > 2).length
        score += Math.min(30, overlap * 10)
    }

    return Math.min(100, score)
}
