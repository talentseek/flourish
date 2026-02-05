"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Loader2, Shield, MapPin, User } from "lucide-react"
import { getUsersForAdmin, updateUserRole } from "../actions"
import { Role } from "@prisma/client"

type UserData = {
    id: string
    name: string | null
    email: string
    role: Role
    createdAt: Date
}

const roleIcons = {
    ADMIN: Shield,
    REGIONAL_MANAGER: MapPin,
    USER: User
}

const roleBadgeVariants: Record<Role, "default" | "secondary" | "outline"> = {
    ADMIN: "default",
    REGIONAL_MANAGER: "secondary",
    USER: "outline"
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    // Load data
    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const usersData = await getUsersForAdmin()
            setUsers(usersData)
            setLoading(false)
        }
        loadData()
    }, [])

    // Update user role
    const handleRoleChange = async (userId: string, role: Role) => {
        startTransition(async () => {
            try {
                await updateUserRole(userId, role)
                // Update local state
                setUsers(prev =>
                    prev.map(user =>
                        user.id === userId ? { ...user, role } : user
                    )
                )
            } catch (error) {
                console.error("Failed to update role:", error)
                alert(error instanceof Error ? error.message : "Failed to update role")
            }
        })
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage user roles and permissions
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Users
                    </CardTitle>
                    <CardDescription>
                        {users.length} registered users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Current Role</TableHead>
                                        <TableHead>Change Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => {
                                        const RoleIcon = roleIcons[user.role]
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.name || "—"}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={roleBadgeVariants[user.role]} className="flex items-center gap-1 w-fit">
                                                        <RoleIcon className="h-3 w-3" />
                                                        {user.role.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                                                        disabled={isPending}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="USER">User</SelectItem>
                                                            <SelectItem value="REGIONAL_MANAGER">Regional Manager</SelectItem>
                                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
