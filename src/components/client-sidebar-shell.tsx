"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface ClientSidebarShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export default function ClientSidebarShell({ children, userRole }: ClientSidebarShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" userRole={userRole} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export { ClientSidebarShell }
