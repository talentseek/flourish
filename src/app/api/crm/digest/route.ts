import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

// Called by Vercel Cron daily at 7am UTC
export async function GET(request: Request) {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Find all users with digest enabled
        const settings = await prisma.crmNotificationSettings.findMany({
            where: { digestEnabled: true },
            include: { user: { select: { id: true, name: true, email: true } } },
        })

        if (settings.length === 0) {
            return NextResponse.json({ message: "No users with digest enabled", sent: 0 })
        }

        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        let emailsSent = 0

        for (const setting of settings) {
            const userId = setting.userId
            const user = setting.user

            // Get pipeline stats
            const deals = await prisma.crmDeal.findMany({
                where: { ownerId: userId },
                select: { stage: true, value: true },
            })

            const totalDeals = deals.length
            const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
            const wonValue = deals.filter((d) => d.stage === "WON").reduce((sum, d) => sum + (d.value || 0), 0)
            const activeDeals = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST").length

            // Get overdue follow-ups
            const overdueFollowUps = await prisma.crmFollowUp.findMany({
                where: { userId, completed: false, dueDate: { lt: today } },
                include: { deal: { select: { title: true } } },
                orderBy: { dueDate: "asc" },
            })

            // Get today's follow-ups
            const todayFollowUps = await prisma.crmFollowUp.findMany({
                where: { userId, completed: false, dueDate: { gte: today, lt: tomorrow } },
                include: { deal: { select: { title: true } } },
                orderBy: { dueDate: "asc" },
            })

            // Build email
            const followUpRows = [
                ...overdueFollowUps.map((f) => `
                    <tr>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #ef4444; font-size: 13px;">⚠️ OVERDUE</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #e4e4e7; font-size: 13px;">${f.deal.title}</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px;">${f.description}</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #ef4444; font-size: 13px;">${new Date(f.dueDate).toLocaleDateString()}</td>
                    </tr>
                `),
                ...todayFollowUps.map((f) => `
                    <tr>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #f59e0b; font-size: 13px;">📅 TODAY</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #e4e4e7; font-size: 13px;">${f.deal.title}</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px;">${f.description}</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 13px;">${new Date(f.dueDate).toLocaleDateString()}</td>
                    </tr>
                `),
            ].join("")

            const formatValue = (v: number) => v >= 1_000_000 ? `£${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `£${Math.round(v / 1_000)}k` : `£${v}`

            const html = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; color: #e4e4e7;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Flourish CRM</h1>
                        <p style="color: #71717a; font-size: 13px; margin-top: 4px;">Daily Pipeline Digest</p>
                    </div>

                    <!-- Stats -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px;">
                        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center;">
                            <div style="color: #ffffff; font-size: 24px; font-weight: 700;">${activeDeals}</div>
                            <div style="color: #71717a; font-size: 12px;">Active Deals</div>
                        </div>
                        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center;">
                            <div style="color: #ffffff; font-size: 24px; font-weight: 700;">${formatValue(totalValue)}</div>
                            <div style="color: #71717a; font-size: 12px;">Pipeline Value</div>
                        </div>
                        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center;">
                            <div style="color: #10b981; font-size: 24px; font-weight: 700;">${formatValue(wonValue)}</div>
                            <div style="color: #71717a; font-size: 12px;">Won</div>
                        </div>
                    </div>

                    ${(overdueFollowUps.length + todayFollowUps.length) > 0 ? `
                        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 12px;">
                            Follow-ups (${overdueFollowUps.length} overdue, ${todayFollowUps.length} today)
                        </h2>
                        <table style="width: 100%; border-collapse: collapse; background: #18181b; border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background: #1f1f23;">
                                    <th style="padding: 8px 12px; text-align: left; color: #71717a; font-size: 11px; text-transform: uppercase;">Status</th>
                                    <th style="padding: 8px 12px; text-align: left; color: #71717a; font-size: 11px; text-transform: uppercase;">Deal</th>
                                    <th style="padding: 8px 12px; text-align: left; color: #71717a; font-size: 11px; text-transform: uppercase;">Task</th>
                                    <th style="padding: 8px 12px; text-align: left; color: #71717a; font-size: 11px; text-transform: uppercase;">Due</th>
                                </tr>
                            </thead>
                            <tbody>${followUpRows}</tbody>
                        </table>
                    ` : `
                        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 24px; text-align: center;">
                            <p style="color: #71717a; font-size: 14px; margin: 0;">✅ No follow-ups due today. Nice work!</p>
                        </div>
                    `}

                    <div style="text-align: center; margin-top: 32px;">
                        <a href="https://thisisflourish.co.uk/crm" style="display: inline-block; padding: 12px 32px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            Open CRM
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
                    <p style="color: #52525b; font-size: 12px; text-align: center;">
                        Flourish Intelligence Platform &bull; thisisflourish.co.uk
                    </p>
                </div>
            `

            await resend.emails.send({
                from: "Flourish CRM <no-reply@updates.thisisflourish.co.uk>",
                to: user.email,
                subject: `Pipeline Digest: ${overdueFollowUps.length + todayFollowUps.length} follow-ups · ${formatValue(totalValue)} pipeline`,
                html,
            })

            emailsSent++
            console.log(`[Digest] Sent to ${user.email}`)
        }

        return NextResponse.json({ message: "Digest sent", sent: emailsSent })
    } catch (error) {
        console.error("[Digest] Error:", error)
        return NextResponse.json({ error: "Failed to send digest" }, { status: 500 })
    }
}
