'use server'

import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function verifyAdmin() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error('Unauthorized')
    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true }
    })
    if (!dbUser || dbUser.role !== 'ADMIN') throw new Error('Unauthorized: Admin access required')
    return dbUser
}

export async function uploadFile(formData: FormData): Promise<string> {
    await verifyAdmin()

    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured')

    // Use Vercel Blob REST API directly — avoids undici/webpack incompatibility
    const response = await fetch(
        `https://blob.vercel-storage.com/${encodeURIComponent(file.name)}`,
        {
            method: 'PUT',
            headers: {
                'authorization': `Bearer ${token}`,
                'x-content-type': file.type || 'application/octet-stream',
                'x-add-random-suffix': '1',
            },
            body: file,
            // @ts-expect-error — duplex is needed for streaming request bodies
            duplex: 'half',
        }
    )

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Upload failed: ${text}`)
    }

    const result = await response.json() as { url: string }
    return result.url
}

export async function deleteFile(url: string): Promise<void> {
    await verifyAdmin()

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token || !url.startsWith('http')) return

    try {
        await fetch('https://blob.vercel-storage.com/delete', {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({ urls: [url] }),
        })
    } catch {
        // File may already be deleted
    }
}
