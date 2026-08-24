import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { checkCompany } from '@/lib/companies-house'
import { ComplianceStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type MatchConfidence = 'direct_ref' | 'high' | 'medium' | 'low' | 'none'

type RowResult = {
    operatorId: string
    companyName: string
    existingStatus: ComplianceStatus
    existingRef: string | null
    found: boolean
    companyNumber: string | null
    companyNameOnRegister: string | null
    companyStatus: string | null
    matchConfidence: MatchConfidence
    plannedStatus: ComplianceStatus | 'UNCHANGED'
    wouldUpdate: boolean
    applied: boolean
    accountsNextDue: string | null
    confirmationNextDue: string | null
    error?: string
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function normaliseName(name: string) {
    return name
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/\b(t\/a|trading as|ta)\b.*$/gi, '')
        .replace(/\b(limited|ltd|llp|plc|co|company|uk)\b/gi, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function nameLooksRegisteredCompany(name: string) {
    return /\b(ltd|limited|llp|plc)\b/i.test(name)
}

function tokenOverlap(a: string, b: string) {
    const aTokens = new Set(normaliseName(a).split(' ').filter(t => t.length > 2))
    const bTokens = new Set(normaliseName(b).split(' ').filter(t => t.length > 2))
    if (aTokens.size === 0 || bTokens.size === 0) return 0
    const overlap = Array.from(aTokens).filter(t => bTokens.has(t)).length
    return overlap / Math.max(aTokens.size, bTokens.size)
}

function confidence(inputName: string, registerName: string | null, hadRef: boolean): MatchConfidence {
    if (hadRef) return 'direct_ref'
    if (!registerName) return 'none'
    const input = normaliseName(inputName)
    const registered = normaliseName(registerName)
    if (input && registered && input === registered) return 'high'
    const overlap = tokenOverlap(inputName, registerName)
    if (overlap >= 0.75) return 'medium'
    return 'low'
}

function statusFor(companyStatus: string | null): ComplianceStatus {
    if (companyStatus === 'active') return 'PASSED'
    if (companyStatus === 'dissolved') return 'DISSOLVED'
    return 'FAILED'
}

async function requireAdmin(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
        return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 }) }
    }
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!dbUser || dbUser.role !== 'ADMIN') {
        return { ok: false as const, response: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) }
    }
    return { ok: true as const }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await requireAdmin(req)
        if (!admin.ok) return admin.response

        const body = await req.json().catch(() => ({})) as {
            apply?: boolean
            limit?: number
            onlyUnchecked?: boolean
        }
        const apply = body.apply === true
        const limit = Math.max(1, Math.min(Number(body.limit ?? 50), 200))
        const onlyUnchecked = body.onlyUnchecked !== false

        const where = {
            isActive: true,
            ...(onlyUnchecked ? { companiesHouseCheck: 'NOT_CHECKED' as ComplianceStatus } : {}),
        }

        // entityType defaults to LIMITED_COMPANY in old imports, so filter in code
        // to avoid wasting API calls on obvious sole traders/charities without Ltd/LLP/PLC markers.
        const pool = await prisma.operator.findMany({
            where,
            orderBy: { companyName: 'asc' },
            select: {
                id: true,
                companyName: true,
                companiesHouseCheck: true,
                companiesHouseRef: true,
            },
            take: 1500,
        })

        const candidates = pool
            .filter(op => Boolean(op.companiesHouseRef) || nameLooksRegisteredCompany(op.companyName))
            .slice(0, limit)

        const rows: RowResult[] = []
        for (const op of candidates) {
            if (rows.length > 0) await delay(550)
            try {
                const result = await checkCompany(op.companyName, op.companiesHouseRef)
                const registerName = result.company?.companyName ?? null
                const matchConfidence = confidence(op.companyName, registerName, Boolean(op.companiesHouseRef))
                const found = result.found && Boolean(result.company)
                const safeToUpdate = found && (matchConfidence === 'direct_ref' || matchConfidence === 'high' || matchConfidence === 'medium')
                const refLookupFailed = Boolean(op.companiesHouseRef) && !found
                const plannedStatus: ComplianceStatus | 'UNCHANGED' = safeToUpdate
                    ? statusFor(result.company?.companyStatus ?? null)
                    : refLookupFailed
                        ? 'FAILED'
                        : 'UNCHANGED'
                const wouldUpdate = plannedStatus !== 'UNCHANGED'

                if (apply && wouldUpdate) {
                    await prisma.operator.update({
                        where: { id: op.id },
                        data: {
                            companiesHouseCheck: plannedStatus as ComplianceStatus,
                            companiesHouseDate: new Date(),
                            companiesHouseRef: result.company?.companyNumber ?? op.companiesHouseRef,
                            accountsNextDue: result.company?.accountsNextDue ? new Date(result.company.accountsNextDue) : null,
                            confirmationNextDue: result.company?.confirmationNextDue ? new Date(result.company.confirmationNextDue) : null,
                        },
                    })
                }

                rows.push({
                    operatorId: op.id,
                    companyName: op.companyName,
                    existingStatus: op.companiesHouseCheck,
                    existingRef: op.companiesHouseRef,
                    found,
                    companyNumber: result.company?.companyNumber ?? null,
                    companyNameOnRegister: registerName,
                    companyStatus: result.company?.companyStatus ?? null,
                    matchConfidence,
                    plannedStatus,
                    wouldUpdate,
                    applied: apply && wouldUpdate,
                    accountsNextDue: result.company?.accountsNextDue ?? null,
                    confirmationNextDue: result.company?.confirmationNextDue ?? null,
                    error: result.error,
                })
            } catch (err) {
                rows.push({
                    operatorId: op.id,
                    companyName: op.companyName,
                    existingStatus: op.companiesHouseCheck,
                    existingRef: op.companiesHouseRef,
                    found: false,
                    companyNumber: null,
                    companyNameOnRegister: null,
                    companyStatus: null,
                    matchConfidence: 'none',
                    plannedStatus: 'UNCHANGED',
                    wouldUpdate: false,
                    applied: false,
                    accountsNextDue: null,
                    confirmationNextDue: null,
                    error: err instanceof Error ? err.message : 'Unknown error',
                })
            }
        }

        const summary = rows.reduce((acc, row) => {
            acc.total += 1
            acc.found += row.found ? 1 : 0
            acc.wouldUpdate += row.wouldUpdate ? 1 : 0
            acc.applied += row.applied ? 1 : 0
            acc.byConfidence[row.matchConfidence] = (acc.byConfidence[row.matchConfidence] ?? 0) + 1
            acc.byPlannedStatus[row.plannedStatus] = (acc.byPlannedStatus[row.plannedStatus] ?? 0) + 1
            return acc
        }, {
            total: 0,
            found: 0,
            wouldUpdate: 0,
            applied: 0,
            byConfidence: {} as Record<string, number>,
            byPlannedStatus: {} as Record<string, number>,
        })

        return NextResponse.json({
            success: true,
            apply,
            onlyUnchecked,
            limit,
            candidatesAvailable: candidates.length,
            summary,
            rows,
        })
    } catch (err) {
        console.error('[companies-house bulk-check] Error:', err)
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 })
    }
}
