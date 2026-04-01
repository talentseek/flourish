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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Loader2, Shield, MapPin, User, Plus, Trash2 } from "lucide-react"
import { getUsersForAdmin, updateUserRole, createUser, deleteUser } from "../actions"
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

    // Create user form state
    const [createOpen, setCreateOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newRole, setNewRole] = useState<Role>("USER")
    const [createError, setCreateError] = useState("")

    // Load data
    const loadUsers = async () => {
        setLoading(true)
        const usersData = await getUsersForAdmin()
        setUsers(usersData)
        setLoading(false)
    }

    useEffect(() => {
        loadUsers()
    }, [])

    // Update user role
    const handleRoleChange = async (userId: string, role: Role) => {
        startTransition(async () => {
            try {
                await updateUserRole(userId, role)
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

    // Create user
    const handleCreateUser = async () => {
        setCreateError("")
        startTransition(async () => {
            try {
                await createUser({
                    name: newName,
                    email: newEmail,
                    password: newPassword,
                    role: newRole,
                })
                setCreateOpen(false)
                setNewName("")
                setNewEmail("")
                setNewPassword("")
                setNewRole("USER")
                await loadUsers()
            } catch (error) {
                setCreateError(error instanceof Error ? error.message : "Failed to create user")
            }
        })
    }

    // Delete user
    const handleDeleteUser = async (userId: string) => {
        startTransition(async () => {
            try {
                await deleteUser(userId)
                setUsers(prev => prev.filter(u => u.id !== userId))
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to delete user")
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
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the Flourish platform. They will be able to log in immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Jane Smith"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="e.g. jane@thisisflourish.co.uk"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="REGIONAL_MANAGER">Regional Manager</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {createError && (
                                <p className="text-sm text-red-500">{createError}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateUser} disabled={isPending || !newName || !newEmail || !newPassword}>
                                {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Create User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                        <TableHead className="w-[60px]"></TableHead>
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
                                                <TableCell>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete <strong>{user.name || user.email}</strong>?
                                                                    This will permanently remove their account, sessions, and all associated data.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
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
