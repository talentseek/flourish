"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { Search, MapPin, Loader2 } from "lucide-react"
import {
    getLocationsForAdmin,
    getRegionalManagers,
    toggleLocationManaged,
    assignRegionalManager
} from "../actions"

type Location = {
    id: string
    name: string
    city: string
    type: string
    isManaged: boolean
    regionalManager: string | null
}

type RegionalManager = {
    id: string
    name: string | null
    email: string
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([])
    const [managers, setManagers] = useState<RegionalManager[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    // Load data
    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const [locationsData, managersData] = await Promise.all([
                getLocationsForAdmin(page, 20, search),
                getRegionalManagers()
            ])
            setLocations(locationsData.locations)
            setTotal(locationsData.total)
            setManagers(managersData)
            setLoading(false)
        }
        loadData()
    }, [page, search])

    // Handle search
    const handleSearch = (value: string) => {
        setSearch(value)
        setPage(1)
    }

    // Toggle managed status
    const handleToggleManaged = async (locationId: string, isManaged: boolean) => {
        startTransition(async () => {
            await toggleLocationManaged(locationId, isManaged)
            // Update local state
            setLocations(prev =>
                prev.map(loc =>
                    loc.id === locationId ? { ...loc, isManaged } : loc
                )
            )
        })
    }

    // Assign regional manager
    const handleAssignManager = async (locationId: string, managerName: string | null) => {
        startTransition(async () => {
            await assignRegionalManager(locationId, managerName === "none" ? null : managerName)
            // Update local state
            setLocations(prev =>
                prev.map(loc =>
                    loc.id === locationId
                        ? { ...loc, regionalManager: managerName === "none" ? null : managerName }
                        : loc
                )
            )
        })
    }

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Location Management</h1>
                    <p className="text-muted-foreground">
                        Manage portfolio locations and assign regional managers
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        All Locations
                    </CardTitle>
                    <CardDescription>
                        {total.toLocaleString()} locations in database
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, city, or postcode..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>City</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Managed</TableHead>
                                            <TableHead>Regional Manager</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locations.map((location) => (
                                            <TableRow key={location.id}>
                                                <TableCell className="font-medium">{location.name}</TableCell>
                                                <TableCell>{location.city}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{location.type.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={location.isManaged}
                                                        onCheckedChange={(checked) => handleToggleManaged(location.id, checked)}
                                                        disabled={isPending}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={location.regionalManager || "none"}
                                                        onValueChange={(value) => handleAssignManager(location.id, value)}
                                                        disabled={isPending || !location.isManaged}
                                                    >
                                                        <SelectTrigger className="w-[200px]">
                                                            <SelectValue placeholder="Assign manager" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">No manager</SelectItem>
                                                            {managers.map((manager) => (
                                                                <SelectItem key={manager.id} value={manager.name || manager.email}>
                                                                    {manager.name || manager.email}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, total)} of {total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
