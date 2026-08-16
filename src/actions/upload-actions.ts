'use server'

import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put, del } from '@vercel/blob'

async function verifyAdminOrRM() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error('Unauthorized')
    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true }
    })
    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER')) {
        throw new Error('Unauthorized: Admin or RM access required')
    }
    return dbUser
}

export async function uploadFile(formData: FormData): Promise<string> {
    await verifyAdminOrRM()

    const file = formData.get('file') as (File | Blob | null)
    if (!file || typeof file === 'string' || !('size' in file) || file.size === 0) {
        throw new Error('No valid file provided')
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured')

    const fileName = ('name' in file && typeof file.name === 'string' && file.name) ? file.name : 'upload'
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const buffer = Buffer.from(await file.arrayBuffer())

    const blob = await put(safeName, buffer, {
        access: 'public',
        token,
        contentType: ('type' in file && typeof file.type === 'string' && file.type) ? file.type : 'application/octet-stream',
        addRandomSuffix: true,
    })

    return blob.url
}

/**
 * Upload a compliance document (PAT cert or PLI policy).
 * FormData must include: file, type ('pat'|'pli'), entityId
 */
export async function uploadComplianceDoc(formData: FormData): Promise<string> {
    await verifyAdminOrRM()

    const file = formData.get('file') as (File | Blob | null)
    const type = formData.get('type') as string
    const entityId = formData.get('entityId') as string

    if (!file || typeof file === 'string' || !('size' in file) || file.size === 0) {
        throw new Error('No valid file provided')
    }
    if (!type || !entityId) throw new Error('Missing type or entityId')

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured')

    const fileName = ('name' in file && typeof file.name === 'string' && file.name) ? file.name : 'document.pdf'
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const timestamp = Date.now()
    const path = `compliance/${type}/${entityId}/${timestamp}-${safeName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const blob = await put(path, buffer, {
        access: 'public',
        token,
        contentType: ('type' in file && typeof file.type === 'string' && file.type) ? file.type : 'application/octet-stream',
        addRandomSuffix: true,
    })

    return blob.url
}

export async function deleteFile(url: string): Promise<void> {
    await verifyAdminOrRM()

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token || !url.startsWith('http')) return

    try {
        await del(url, { token })
    } catch {
        // File may already be deleted
    }
}


