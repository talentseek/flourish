import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                const session = await auth.api.getSession({
                    headers: request.headers
                })
                if (!session?.user) {
                    throw new Error('Unauthorized: Please log in')
                }
                const dbUser = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { role: true }
                })
                if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER')) {
                    throw new Error('Forbidden: Admin or RM access required')
                }

                return {
                    allowedContentTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/heic',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ],
                    tokenPayload: JSON.stringify({ userId: session.user.id }),
                }
            },
            onUploadCompleted: async () => {},
        })

        return NextResponse.json(jsonResponse)
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        )
    }
}
