"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, User } from "lucide-react"

interface UserButtonClientProps {
  afterSignOutUrl?: string
  appearance?: any // Keeping prop for compatibility, though unused
}

export function UserButtonClient({ afterSignOutUrl = "/" }: UserButtonClientProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full" />
  }

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(afterSignOutUrl)
        },
      },
    })
  }

  const userInitials = session.user.name
    ? session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : session.user.email?.slice(0, 2).toUpperCase() || "??"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          {session.user.image && (
            <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
          )}
          <AvatarFallback className="bg-purple-600 text-white text-xs font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          className="focus:bg-zinc-900 focus:text-white cursor-pointer"
          onClick={() => router.push("/dashboard2")}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          className="text-red-400 focus:text-red-300 focus:bg-red-950/20 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
