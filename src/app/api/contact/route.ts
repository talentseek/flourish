import { NextResponse } from "next/server"
import { Resend } from "resend"
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

        // Send email notification (non-blocking — don't fail the response if email fails)
        try {
            const resend = new Resend(process.env.RESEND_API_KEY)
            await resend.emails.send({
                from: "Flourish Website <notifications@updates.thisisflourish.co.uk>",
                to: "hello@thisisflourish.co.uk",
                subject: `New ${enquiryType} enquiry from ${name}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
                        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">New Website Enquiry</h1>
                        </div>
                        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; width: 120px; vertical-align: top;">Name</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; font-weight: 500;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; vertical-align: top;">Email</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                                </tr>
                                ${phone ? `<tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; vertical-align: top;">Phone</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
                                </tr>` : ""}
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; vertical-align: top;">Type</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px;"><span style="background: #eff6ff; color: #2563eb; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 500;">${enquiryType}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #64748b; font-size: 13px; vertical-align: top;">Message</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-size: 14px; line-height: 1.6;">${message}</td>
                                </tr>
                            </table>
                        </div>
                        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">Sent from the Flourish website contact form</p>
                    </div>
                `,
            })
        } catch (emailError) {
            console.error("Resend email failed (submission still saved):", emailError)
        }

        return NextResponse.json({ success: true, id: submission.id })
    } catch (error) {
        console.error("Contact form error:", error)
        return NextResponse.json(
            { error: "Failed to submit" },
            { status: 500 }
        )
    }
}
