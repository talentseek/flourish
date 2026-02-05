import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const runtime = 'nodejs';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Strict ADMIN role check
    if (!session?.user) {
        redirect("/login")
    }

    // Check if user has ADMIN role
    // @ts-expect-error - role exists on user from Prisma schema
    if (session.user.role !== 'ADMIN') {
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
        </SidebarProvider>
    )
}
