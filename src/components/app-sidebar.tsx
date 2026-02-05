"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  TargetIcon,
  FileTextIcon,
  MapPinIcon,
  ShieldIcon,
} from "lucide-react"
import { UserButtonClient } from "@/components/user-button-client"
import { FlourishLogo } from "@/components/flourish-logo"
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: string
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard2",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Regional",
      url: "/dashboard/regional",
      icon: MapPinIcon,
    },
    {
      title: "Outreach",
      url: "/outreach",
      icon: TargetIcon,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileTextIcon,
    },
  ];

  // Add Admin link for ADMIN users
  if (userRole === 'ADMIN') {
    navItems.push({
      title: "Admin",
      url: "/admin",
      icon: ShieldIcon,
    })
  }

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
                <FlourishLogo priority />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center p-4">
          <UserButtonClient
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

