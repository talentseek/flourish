'use server'

import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'

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

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin'
    const safeName = file.name.replace(/[^a-z0-9_.-]/gi, '_').replace(/\.[^.]+$/, '')
    const uniqueName = `${safeName}_${Date.now()}.${ext}`

    // Save to public/maps directory
    const dir = join(process.cwd(), 'public', 'maps')
    await mkdir(dir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(dir, uniqueName)
    await writeFile(filePath, buffer)

    return `/maps/${uniqueName}`
}

export async function deleteFile(url: string): Promise<void> {
    await verifyAdmin()

    // Only delete local files (starting with /maps/)
    if (url.startsWith('/maps/')) {
        try {
            const filePath = join(process.cwd(), 'public', url)
            await unlink(filePath)
        } catch {
            // File may already be deleted
        }
    }
}
