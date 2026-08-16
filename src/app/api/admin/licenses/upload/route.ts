import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'
import { LicenseCategory } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        })

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER')) {
            return NextResponse.json({ error: 'Forbidden: Admin or RM access required' }, { status: 403 })
        }

        const formData = await req.formData()
        const action = (formData.get('action') as string) || 'create'
        const token = process.env.BLOB_READ_WRITE_TOKEN

        if (action === 'attach') {
            const licenseId = formData.get('licenseId') as string
            const operatorId = formData.get('operatorId') as string
            const file = formData.get('file') as (File | Blob | null)

            if (!licenseId) {
                return NextResponse.json({ error: 'Missing licenseId' }, { status: 400 })
            }

            if (!file || typeof file === 'string' || !('size' in file) || file.size === 0) {
                return NextResponse.json({ error: 'Please select a valid document file' }, { status: 400 })
            }

            if (!token) {
                return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured' }, { status: 500 })
            }

            const fileName = ('name' in file && typeof file.name === 'string' && file.name) ? file.name : 'document.pdf'
            const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
            const timestamp = Date.now()
            const path = `compliance/pli/${operatorId || 'general'}/${timestamp}-${safeName}`
            const buffer = Buffer.from(await file.arrayBuffer())

            const blob = await put(path, buffer, {
                access: 'public',
                token,
                contentType: ('type' in file && typeof file.type === 'string' && file.type) ? file.type : 'application/octet-stream',
                addRandomSuffix: true,
            })

            const updated = await prisma.operatorLicense.update({
                where: { id: licenseId },
                data: { documentUrl: blob.url }
            })

            revalidatePath('/admin/operators')

            return NextResponse.json({
                success: true,
                documentUrl: blob.url,
                license: {
                    ...updated,
                    coverValue: updated.coverValue ? updated.coverValue.toString() : null,
                    startDate: updated.startDate.toISOString(),
                    endDate: updated.endDate.toISOString(),
                    createdAt: updated.createdAt.toISOString(),
                    updatedAt: updated.updatedAt.toISOString(),
                }
            })
        }

        // action === 'create'
        const operatorId = formData.get('operatorId') as string
        const type = (formData.get('type') as LicenseCategory) || 'PUBLIC_LIABILITY_INSURANCE'
        const reference = (formData.get('reference') as string) || null
        const startDateStr = formData.get('startDate') as string
        const endDateStr = formData.get('endDate') as string
        const coverValueStr = formData.get('coverValue') as string
        const notes = (formData.get('notes') as string) || null
        const file = formData.get('file') as (File | Blob | null)

        if (!operatorId || !startDateStr || !endDateStr) {
            return NextResponse.json({ error: 'Missing required license fields (operatorId, startDate, endDate)' }, { status: 400 })
        }

        let documentUrl: string | null = null

        if (file && typeof file !== 'string' && 'size' in file && file.size > 0 && token) {
            const fileName = ('name' in file && typeof file.name === 'string' && file.name) ? file.name : 'document.pdf'
            const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
            const timestamp = Date.now()
            const path = `compliance/pli/${operatorId}/${timestamp}-${safeName}`
            const buffer = Buffer.from(await file.arrayBuffer())

            const blob = await put(path, buffer, {
                access: 'public',
                token,
                contentType: ('type' in file && typeof file.type === 'string' && file.type) ? file.type : 'application/octet-stream',
                addRandomSuffix: true,
            })
            documentUrl = blob.url
        }

        const license = await prisma.operatorLicense.create({
            data: {
                operatorId,
                type,
                reference: reference || null,
                startDate: new Date(startDateStr),
                endDate: new Date(endDateStr),
                coverValue: coverValueStr ? parseFloat(coverValueStr) : null,
                notes: notes || null,
                documentUrl,
                isVerified: false,
            }
        })

        revalidatePath('/admin/operators')

        return NextResponse.json({
            success: true,
            documentUrl: license.documentUrl,
            license: {
                ...license,
                coverValue: license.coverValue ? license.coverValue.toString() : null,
                startDate: license.startDate.toISOString(),
                endDate: license.endDate.toISOString(),
                createdAt: license.createdAt.toISOString(),
                updatedAt: license.updatedAt.toISOString(),
            }
        })
    } catch (err) {
        console.error('[API /api/admin/licenses/upload] Error:', err)
        return NextResponse.json({
            error: err instanceof Error ? err.message : 'Internal Server Error'
        }, { status: 500 })
    }
}
