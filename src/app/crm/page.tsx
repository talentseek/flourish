import { getDeals, getAllDeals, getPipelineStats, getNotificationSettings } from "./actions"
import { CrmKanban } from "@/components/crm/crm-kanban"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function CrmPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) redirect("/login")
    if ((session.user as any).role !== "ADMIN") redirect("/dashboard")

    const [deals, allDeals, stats, notifSettings] = await Promise.all([
        getDeals(),
        getAllDeals(),
        getPipelineStats(),
        getNotificationSettings(),
    ])

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <CrmKanban
                initialDeals={JSON.parse(JSON.stringify(deals))}
                allDeals={JSON.parse(JSON.stringify(allDeals))}
                stats={stats}
                userId={session.user.id}
                digestEnabled={notifSettings?.digestEnabled ?? false}
            />
        </div>
    )
}

