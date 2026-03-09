/**
 * Compliance gate logic for booking confirmation.
 *
 * Rules:
 * 1. All operators must have a valid (non-expired) PLI
 * 2. Non-F&B operators: PLI cover ≥ £5,000,000
 * 3. F&B operators: PLI cover ≥ £10,000,000
 * 4. F&B operators must also have a valid Food Hygiene certificate
 */

export interface LicenseForCheck {
    type: string // LicenseCategory enum value
    endDate: Date | string
    coverValue?: number | string | null
}

export interface OperatorForCheck {
    types: string[] // OperatorType enum values
    licenses: LicenseForCheck[]
}

export interface ComplianceResult {
    canConfirm: boolean
    issues: string[]
}

const PLI_MIN_NON_FOOD = 5_000_000
const PLI_MIN_FOOD = 10_000_000

export function checkBookingCompliance(operator: OperatorForCheck): ComplianceResult {
    const issues: string[] = []
    const now = new Date()

    const isFoodOperator = operator.types.includes('FOOD_AND_BEVERAGE')

    // Find valid (non-expired) PLI
    const validPLI = operator.licenses.find(
        (l) => l.type === 'PUBLIC_LIABILITY_INSURANCE' && new Date(l.endDate) > now
    )

    if (!validPLI) {
        issues.push('No valid Public Liability Insurance on file')
    } else {
        const cover = validPLI.coverValue ? Number(validPLI.coverValue) : 0
        const requiredMin = isFoodOperator ? PLI_MIN_FOOD : PLI_MIN_NON_FOOD
        const label = isFoodOperator ? '£10,000,000' : '£5,000,000'

        if (cover < requiredMin) {
            issues.push(
                cover === 0
                    ? `PLI cover value not recorded — must be at least ${label}`
                    : `PLI cover is £${cover.toLocaleString()} — must be at least ${label}${isFoodOperator ? ' for food operators' : ''}`
            )
        }
    }

    // F&B: check for valid food hygiene
    if (isFoodOperator) {
        const validFoodHygiene = operator.licenses.find(
            (l) => l.type === 'FOOD_HYGIENE' && new Date(l.endDate) > now
        )
        if (!validFoodHygiene) {
            issues.push('Food Hygiene certificate required for Food & Beverage operators')
        }
    }

    return { canConfirm: issues.length === 0, issues }
}
