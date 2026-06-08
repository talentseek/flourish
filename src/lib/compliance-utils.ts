/**
 * Compliance gate logic for booking confirmation.
 *
 * Operator-level rules (all operators):
 * 1. Valid (non-expired) PLI required
 * 2. Non-F&B operators: PLI cover ≥ £5,000,000
 * 3. F&B operators: PLI cover ≥ £10,000,000
 * 4. F&B operators must also have a valid Food Hygiene certificate
 *
 * Sole Trader additional rules:
 * 5. At least one PHOTOGRAPHIC_ID license on file
 * 6. At least one PROOF_OF_ADDRESS license on file
 *
 * Booking-level rules:
 * 7. All bookings must have a PAT certificate number
 * 8. PAT certificate must not be expired
 */

export interface LicenseForCheck {
    type: string // LicenseCategory enum value
    endDate: Date | string
    coverValue?: number | string | null
}

export interface OperatorForCheck {
    types: string[] // OperatorType enum values
    entityType?: string // EntityType enum value
    licenses: LicenseForCheck[]
}

export interface BookingForCheck {
    patCertNumber?: string | null
    patExpiryDate?: Date | string | null
    equipmentList?: string | null
}

export interface ComplianceResult {
    canConfirm: boolean
    issues: string[]
}

const PLI_MIN_NON_FOOD = 5_000_000
const PLI_MIN_FOOD = 10_000_000

export function checkBookingCompliance(
    operator: OperatorForCheck,
    booking?: BookingForCheck | null,
): ComplianceResult {
    const issues: string[] = []
    const now = new Date()

    const isFoodOperator = operator.types.includes('FOOD_AND_BEVERAGE')
    const isSoleTrader = operator.entityType === 'SOLE_TRADER'

    // --- Operator-level checks ---

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

    // Sole Trader: check for two forms of ID
    if (isSoleTrader) {
        const hasPhotoId = operator.licenses.some(
            (l) => l.type === 'PHOTOGRAPHIC_ID'
        )
        const hasProofOfAddress = operator.licenses.some(
            (l) => l.type === 'PROOF_OF_ADDRESS'
        )

        if (!hasPhotoId) {
            issues.push('Photographic ID required for sole trader (e.g. Passport, Driving Licence)')
        }
        if (!hasProofOfAddress) {
            issues.push('Proof of address required for sole trader (e.g. Utility Bill, Bank Statement)')
        }
    }

    // --- Booking-level checks ---

    if (!booking?.patCertNumber) {
        issues.push('PAT certificate number is required')
    }

    if (!booking?.patExpiryDate) {
        issues.push('PAT certificate expiry date is required')
    } else if (new Date(booking.patExpiryDate) <= now) {
        issues.push('PAT certificate has expired')
    }

    return { canConfirm: issues.length === 0, issues }
}
