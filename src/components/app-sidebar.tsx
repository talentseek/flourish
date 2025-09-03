"use client"

import * as React from "react"
import Image from "next/image"
import {
  LayoutDashboardIcon,
  TargetIcon,
  FileTextIcon,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/logo.png"
                  alt="Flourish"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={[
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboardIcon,
          },
          {
            title: "Gap Analysis",
            url: "/gap-analysis",
            icon: TargetIcon,
          },
          {
            title: "Reports",
            url: "/reports",
            icon: FileTextIcon,
          },
        ]} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center p-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopoverCard: "shadow-lg border border-border",
              }
            }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
