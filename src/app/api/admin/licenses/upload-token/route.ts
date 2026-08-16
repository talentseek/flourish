import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

        const token = process.env.BLOB_READ_WRITE_TOKEN
        if (!token) {
            return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 })
        }

        const body = await req.json().catch(() => ({}))
        const fileName = (body.fileName as string) || 'document.pdf'
        const operatorId = (body.operatorId as string) || 'general'
        const type = (body.type as string) || 'pli'

        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const timestamp = Date.now()
        const path = `compliance/${type}/${operatorId}/${timestamp}-${safeName}`

        return NextResponse.json({
            token,
            path,
            uploadUrl: `https://blob.vercel-storage.com/${encodeURIComponent(path)}`,
        })
    } catch (err) {
        console.error('[upload-token] Error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to authorize upload' },
            { status: 500 }
        )
    }
}
