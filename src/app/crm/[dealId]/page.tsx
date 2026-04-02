import { getDeal } from "../actions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { DealDetail } from "@/components/crm/deal-detail"

export default async function DealPage({ params }: { params: Promise<{ dealId: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) redirect("/login")
    if ((session.user as any).role !== "ADMIN") redirect("/dashboard")

    const { dealId } = await params
    const deal = await getDeal(dealId)
    if (!deal) notFound()

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <DealDetail deal={JSON.parse(JSON.stringify(deal))} userId={session.user.id} />
        </div>
    )
}
