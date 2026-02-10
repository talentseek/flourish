import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, phone, enquiryType, message } = body

        if (!name || !email || !enquiryType || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const submission = await prisma.contactSubmission.create({
            data: {
                name,
                email,
                phone: phone || null,
                enquiryType,
                message,
            },
        })

        return NextResponse.json({ success: true, id: submission.id })
    } catch (error) {
        console.error("Contact form error:", error)
        return NextResponse.json(
            { error: "Failed to submit" },
            { status: 500 }
        )
    }
}
