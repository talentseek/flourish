import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

export const runtime = 'nodejs';

export default async function CrmLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login")
    }

    // For now, only ADMIN can access CRM
    if ((session.user as any).role !== 'ADMIN') {
        redirect("/dashboard")
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userRole="ADMIN" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    {children}
                </div>
            </SidebarInset>
            <Toaster position="bottom-right" richColors />
        </SidebarProvider>
    )
}

