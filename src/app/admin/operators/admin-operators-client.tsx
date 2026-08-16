'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
    createOperator,
    updateOperator,
    deleteOperator,
    addLicense,
    updateLicense,
    removeLicense,
    checkCompaniesHouse,
} from '@/actions/operator-actions'
import { OperatorType, LicenseCategory, ComplianceStatus } from '@prisma/client'
import {
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    RefreshCw,
    Building2,
    Paperclip,
    Download,
    User,
    Upload,
    Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LicenseData {
    id: string
    type: LicenseCategory
    reference: string | null
    coverValue: string | null
    startDate: string
    endDate: string
    isVerified: boolean
    notes: string | null
    documentUrl: string | null
}

interface OperatorData {
    id: string
    companyName: string
    tradingName: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    website: string | null
    types: OperatorType[]
    entityType: string
    companiesHouseCheck: ComplianceStatus
    companiesHouseDate: string | null
    companiesHouseRef: string | null
    accountsNextDue: string | null
    confirmationNextDue: string | null
    creditCheck: ComplianceStatus
    creditCheckDate: string | null
    notes: string | null
    licenses: LicenseData[]
    _count: { bookings: number }
}

const OPERATOR_TYPES: { value: OperatorType; label: string }[] = [
    { value: 'GENERAL', label: 'General' },
    { value: 'CHARITY', label: 'Charity' },
    { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'PROMOTIONAL', label: 'Promotional' },
]

const LICENSE_TYPES: { value: LicenseCategory; label: string }[] = [
    { value: 'PUBLIC_LIABILITY_INSURANCE', label: 'Public Liability Insurance' },
    { value: 'FOOD_HYGIENE', label: 'Food Hygiene Certificate' },
    { value: 'PHOTOGRAPHIC_ID', label: 'Photographic ID' },
    { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address' },
    { value: 'GENERAL_LICENSE', label: 'General License' },
    { value: 'STREET_TRADING', label: 'Street Trading License' },
    { value: 'ALCOHOL_LICENSE', label: 'Alcohol License' },
    { value: 'FIRE_SAFETY', label: 'Fire Safety Certificate' },
    { value: 'OTHER', label: 'Other' },
]

const PHOTO_ID_TYPES = ['Passport', 'Driving Licence', 'National ID Card', 'Other']
const ADDRESS_PROOF_TYPES = ['Utility Bill', 'Bank Statement', 'Council Tax Bill', 'Other']

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ endDate }: { endDate: string }) {
    const days = daysUntil(endDate)
    if (days < 0) return <Badge variant="destructive" className="text-xs">Expired</Badge>
    if (days <= 30) return <Badge className="bg-amber-500 text-xs">Expires in {days}d</Badge>
    return <Badge variant="outline" className="text-xs text-green-600">Valid</Badge>
}

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
    switch (status) {
        case 'PASSED': return <Badge className="bg-green-600 text-xs gap-1"><ShieldCheck className="h-3 w-3" />Passed</Badge>
        case 'FAILED': return <Badge variant="destructive" className="text-xs gap-1"><ShieldAlert className="h-3 w-3" />Failed</Badge>
        case 'EXPIRED': return <Badge className="bg-amber-500 text-xs gap-1"><AlertTriangle className="h-3 w-3" />Expired</Badge>
        case 'DISSOLVED': return <Badge variant="outline" className="text-xs gap-1 text-slate-500 border-slate-400"><AlertTriangle className="h-3 w-3" />Dissolved</Badge>
        default: return <Badge variant="secondary" className="text-xs">Not Checked</Badge>
    }
}

export function AdminOperatorsClient({ operators }: { operators: OperatorData[] }) {
    const router = useRouter()
    const [operatorList, setOperatorList] = useState<OperatorData[]>(operators)

    useEffect(() => {
        setOperatorList(operators)
    }, [operators])

    const [operatorDialogOpen, setOperatorDialogOpen] = useState(false)
    const [licenseDialogOpen, setLicenseDialogOpen] = useState(false)
    const [editingOperator, setEditingOperator] = useState<OperatorData | null>(null)
    const [licenseForOperator, setLicenseForOperator] = useState<string | null>(null)
    const [selectedOperatorName, setSelectedOperatorName] = useState<string>('')
    const [licenseFile, setLicenseFile] = useState<File | null>(null)
    const [uploadingLicenseId, setUploadingLicenseId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [selectedTypes, setSelectedTypes] = useState<OperatorType[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedEntityType, setSelectedEntityType] = useState<string>('LIMITED_COMPANY')
    const [selectedLicenseType, setSelectedLicenseType] = useState<string>('PUBLIC_LIABILITY_INSURANCE')

    const filtered = operatorList.filter(op =>
        op.companyName.toLowerCase().includes(search.toLowerCase()) ||
        (op.tradingName && op.tradingName.toLowerCase().includes(search.toLowerCase()))
    )

    function openCreate() {
        setEditingOperator(null)
        setSelectedTypes([])
        setSelectedEntityType('LIMITED_COMPANY')
        setOperatorDialogOpen(true)
    }

    function openEdit(op: OperatorData) {
        setEditingOperator(op)
        setSelectedTypes(op.types)
        setSelectedEntityType(op.entityType || 'LIMITED_COMPANY')
        setOperatorDialogOpen(true)
    }

    async function handleSaveOperator(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const form = new FormData(e.currentTarget)

        try {
            const data = {
                companyName: form.get('companyName') as string,
                tradingName: (form.get('tradingName') as string) || undefined,
                contactName: (form.get('contactName') as string) || undefined,
                contactEmail: (form.get('contactEmail') as string) || undefined,
                contactPhone: (form.get('contactPhone') as string) || undefined,
                address: (form.get('address') as string) || undefined,
                website: (form.get('website') as string) || undefined,
                companiesHouseRef: selectedEntityType === 'LIMITED_COMPANY' ? ((form.get('companiesHouseRef') as string) || undefined) : undefined,
                notes: (form.get('notes') as string) || undefined,
                types: selectedTypes,
                entityType: selectedEntityType as 'LIMITED_COMPANY' | 'SOLE_TRADER',
            }

            if (editingOperator) {
                await updateOperator(editingOperator.id, data)
            } else {
                await createOperator(data)
            }

            setOperatorDialogOpen(false)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save operator')
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteOperator(id: string) {
        if (!confirm('Deactivate this operator? They will be hidden from lists.')) return
        try {
            await deleteOperator(id)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete')
        }
    }

    async function prepareFileForUpload(file: File): Promise<File> {
        if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
            try {
                return await new Promise<File>((resolve) => {
                    const img = new Image()
                    img.onload = () => {
                        const canvas = document.createElement('canvas')
                        let { width, height } = img
                        const maxDim = 2000
                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = Math.round((height * maxDim) / width)
                                width = maxDim
                            } else {
                                width = Math.round((width * maxDim) / height)
                                height = maxDim
                            }
                        }
                        canvas.width = width
                        canvas.height = height
                        const ctx = canvas.getContext('2d')
                        if (!ctx) return resolve(file)
                        ctx.drawImage(img, 0, 0, width, height)
                        canvas.toBlob((blob) => {
                            if (blob && blob.size < file.size) {
                                resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
                            } else {
                                resolve(file)
                            }
                        }, 'image/jpeg', 0.85)
                    }
                    img.onerror = () => resolve(file)
                    img.src = URL.createObjectURL(file)
                })
            } catch {
                return file
            }
        }
        return file
    }

    async function handleAddLicense(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!licenseForOperator) return
        setLoading(true)
        const form = new FormData(e.currentTarget)
        form.set('action', 'create')
        form.set('operatorId', licenseForOperator)

        try {
            const formFile = form.get('file') as (File | null)
            const chosenFile = (licenseFile && licenseFile.size > 0)
                ? licenseFile
                : (formFile && formFile.size > 0)
                    ? formFile
                    : null

            if (chosenFile) {
                const file = await prepareFileForUpload(chosenFile)
                form.set('file', file)
            }

            const res = await fetch('/api/admin/licenses/upload', {
                method: 'POST',
                body: form,
            })

            if (!res.ok) {
                const errText = await res.text()
                let errorMsg = 'Failed to add license'
                try {
                    const json = JSON.parse(errText)
                    if (json.error) errorMsg = json.error
                } catch {
                    if (errText.includes('Entity Too Large') || res.status === 413) {
                        errorMsg = 'File is too large (exceeds 4.5MB). Please upload a smaller PDF or image.'
                    } else {
                        errorMsg = errText || `Error ${res.status}`
                    }
                }
                throw new Error(errorMsg)
            }

            const data = await res.json()
            if (data.success && data.license) {
                setOperatorList(prev => prev.map(op => {
                    if (op.id !== licenseForOperator) return op
                    return {
                        ...op,
                        licenses: [...op.licenses, data.license]
                    }
                }))
            }

            setLicenseDialogOpen(false)
            setLicenseForOperator(null)
            setLicenseFile(null)
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to add license')
        } finally {
            setLoading(false)
        }
    }

    async function handleUploadLicenseDoc(licenseId: string, operatorId: string, rawFile: File) {
        setUploadingLicenseId(licenseId)
        try {
            const file = await prepareFileForUpload(rawFile)
            const form = new FormData()
            form.set('action', 'attach')
            form.set('licenseId', licenseId)
            form.set('operatorId', operatorId)
            form.set('file', file)

            const res = await fetch('/api/admin/licenses/upload', {
                method: 'POST',
                body: form,
            })

            if (!res.ok) {
                const errText = await res.text()
                let errorMsg = 'Failed to upload document'
                try {
                    const json = JSON.parse(errText)
                    if (json.error) errorMsg = json.error
                } catch {
                    if (errText.includes('Entity Too Large') || res.status === 413) {
                        errorMsg = 'File is too large (exceeds 4.5MB). Please upload a smaller PDF or image.'
                    } else {
                        errorMsg = errText || `Error ${res.status}`
                    }
                }
                throw new Error(errorMsg)
            }

            const data = await res.json()
            if (data.success && data.documentUrl) {
                setOperatorList(prev => prev.map(op => {
                    if (op.id !== operatorId) return op
                    return {
                        ...op,
                        licenses: op.licenses.map(lic => lic.id === licenseId ? { ...lic, documentUrl: data.documentUrl } : lic)
                    }
                }))
            }
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to upload document')
        } finally {
            setUploadingLicenseId(null)
        }
    }

    async function handleRemoveLicense(id: string) {
        if (!confirm('Remove this license?')) return
        try {
            await removeLicense(id)
            setOperatorList(prev => prev.map(op => ({
                ...op,
                licenses: op.licenses.filter(lic => lic.id !== id)
            })))
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove')
        }
    }

    function toggleType(type: OperatorType) {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    async function handleCheckCH(operatorId: string) {
        setLoading(true)
        try {
            const result = await checkCompaniesHouse(operatorId)
            if (result.found) {
                alert(`Companies House: ${result.isActive ? 'ACTIVE' : 'NOT ACTIVE'}\nCompany: ${result.company?.companyName || 'N/A'}\nNumber: ${result.company?.companyNumber || 'N/A'}`)
            } else {
                alert(`Companies House check failed: ${result.error || 'Company not found'}`)
            }
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to check')
        } finally {
            setLoading(false)
        }
    }

    function hasValidPLI(op: OperatorData) {
        return op.licenses.some(
            l => l.type === 'PUBLIC_LIABILITY_INSURANCE' && daysUntil(l.endDate) > 0
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Operator Registry</h1>
                    <p className="text-muted-foreground">
                        Manage operators, licenses, and compliance.
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Operator
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Search operators..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-sm"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{operators.length}</div>
                        <p className="text-xs text-muted-foreground">Active Operators</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">
                            {operators.filter(op => op.licenses.some(l => daysUntil(l.endDate) <= 30 && daysUntil(l.endDate) > 0)).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Licenses Expiring (30d)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">
                            {operators.filter(op => !hasValidPLI(op)).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Missing PLI</p>
                    </CardContent>
                </Card>
            </div>

            {/* Operators Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Operators ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Types</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>PLI</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Credit</TableHead>
                                <TableHead>Bookings</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(op => (
                                <>
                                    <TableRow key={op.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === op.id ? null : op.id)}>
                                        <TableCell className="w-8">
                                            {expandedId === op.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{op.companyName}</div>
                                            {op.tradingName && <div className="text-xs text-muted-foreground">t/a {op.tradingName}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {op.types.map(t => (
                                                    <Badge key={t} variant="outline" className="text-xs">{OPERATOR_TYPES.find(ot => ot.value === t)?.label || t}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{op.contactName || '—'}</div>
                                            <div className="text-xs text-muted-foreground">{op.contactEmail || ''}</div>
                                        </TableCell>
                                        <TableCell>
                                            {hasValidPLI(op) ? (
                                                <Badge className="bg-green-600 text-xs">✓ Valid</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="text-xs">✗ Missing</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {op.entityType === 'SOLE_TRADER' ? (
                                                <Badge variant="outline" className="text-xs gap-1"><User className="h-3 w-3" />Sole Trader</Badge>
                                            ) : (
                                                <ComplianceBadge status={op.companiesHouseCheck} />
                                            )}
                                        </TableCell>
                                        <TableCell><ComplianceBadge status={op.creditCheck} /></TableCell>
                                        <TableCell className="text-center">{op._count.bookings}</TableCell>
                                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(op)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDeleteOperator(op.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded License Panel */}
                                    {expandedId === op.id && (
                                        <TableRow key={`${op.id}-licenses`}>
                                            <TableCell colSpan={9} className="bg-muted/30 p-4">
                                                {/* Companies House Section — LTD only */}
                                                {op.entityType !== 'SOLE_TRADER' && (
                                                <div className="mb-4 rounded-md border p-3 bg-background">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <h4 className="font-medium text-sm">Companies House</h4>
                                                            <ComplianceBadge status={op.companiesHouseCheck} />
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1"
                                                            disabled={loading}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleCheckCH(op.id)
                                                            }}
                                                        >
                                                            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                                            {op.companiesHouseCheck === 'NOT_CHECKED' ? 'Check Now' : 'Re-check'}
                                                        </Button>
                                                    </div>
                                                    {op.companiesHouseRef && (
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground">Company No: </span>
                                                                <span className="font-mono">{op.companiesHouseRef}</span>
                                                            </div>
                                                            {op.accountsNextDue && (
                                                                <div>
                                                                    <span className="text-muted-foreground">Accounts Due: </span>
                                                                    <span>{formatDate(op.accountsNextDue)}</span>
                                                                </div>
                                                            )}
                                                            {op.confirmationNextDue && (
                                                                <div>
                                                                    <span className="text-muted-foreground">Confirmation Due: </span>
                                                                    <span>{formatDate(op.confirmationNextDue)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {op.companiesHouseDate && (
                                                        <p className="text-xs text-muted-foreground mt-1">Last checked: {formatDate(op.companiesHouseDate)}</p>
                                                    )}
                                                </div>
                                                )}

                                                {/* ID Verification Section — Sole Trader only */}
                                                {op.entityType === 'SOLE_TRADER' && (
                                                <div className="mb-4 rounded-md border p-3 bg-background">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <h4 className="font-medium text-sm">Sole Trader — ID Verification</h4>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        {op.licenses.some(l => l.type === 'PHOTOGRAPHIC_ID') ? (
                                                            <Badge className="bg-green-600 text-xs gap-1"><ShieldCheck className="h-3 w-3" />Photographic ID ✓</Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs gap-1"><ShieldAlert className="h-3 w-3" />Photographic ID Missing</Badge>
                                                        )}
                                                        {op.licenses.some(l => l.type === 'PROOF_OF_ADDRESS') ? (
                                                            <Badge className="bg-green-600 text-xs gap-1"><ShieldCheck className="h-3 w-3" />Proof of Address ✓</Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs gap-1"><ShieldAlert className="h-3 w-3" />Proof of Address Missing</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                )}

                                                {/* Licenses Section */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-sm">Licenses & Certificates</h4>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => {
                                                            setLicenseForOperator(op.id)
                                                            setLicenseDialogOpen(true)
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" /> Add License
                                                    </Button>
                                                </div>
                                                {op.licenses.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No licenses on file.</p>
                                                ) : (
                                                    <div className="grid gap-2">
                                                        {op.licenses.map(lic => (
                                                            <div
                                                                key={lic.id}
                                                                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-medium">
                                                                        {LICENSE_TYPES.find(lt => lt.value === lic.type)?.label || lic.type}
                                                                    </span>
                                                                    {lic.reference && <span className="text-muted-foreground">Ref: {lic.reference}</span>}
                                                                    {lic.coverValue && (
                                                                        <span className="text-muted-foreground font-medium">
                                                                            Cover: £{Number(lic.coverValue).toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-muted-foreground">
                                                                        {formatDate(lic.startDate)} — {formatDate(lic.endDate)}
                                                                    </span>
                                                                    <ExpiryBadge endDate={lic.endDate} />
                                                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                                        <input
                                                                            id={`lic-file-input-${lic.id}`}
                                                                            type="file"
                                                                            className="hidden"
                                                                            disabled={uploadingLicenseId === lic.id}
                                                                            onChange={(e) => {
                                                                                const f = e.target.files?.[0]
                                                                                if (f) handleUploadLicenseDoc(lic.id, op.id, f)
                                                                            }}
                                                                        />
                                                                        {lic.documentUrl ? (
                                                                            <>
                                                                                <a
                                                                                    href={lic.documentUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-semibold bg-primary/10 px-2.5 py-1 rounded border border-primary/20"
                                                                                >
                                                                                    <Paperclip className="h-3.5 w-3.5" />
                                                                                    <Download className="h-3.5 w-3.5" />
                                                                                    View Document
                                                                                </a>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                                                                                    disabled={uploadingLicenseId === lic.id}
                                                                                    onClick={() => document.getElementById(`lic-file-input-${lic.id}`)?.click()}
                                                                                >
                                                                                    {uploadingLicenseId === lic.id ? (
                                                                                        <>
                                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                                            Uploading...
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Upload className="h-3 w-3" />
                                                                                            Replace
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                            </>
                                                                        ) : (
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                className="h-7 text-xs px-2.5 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm"
                                                                                disabled={uploadingLicenseId === lic.id}
                                                                                onClick={() => document.getElementById(`lic-file-input-${lic.id}`)?.click()}
                                                                            >
                                                                                {uploadingLicenseId === lic.id ? (
                                                                                    <>
                                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                                        Uploading...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Upload className="h-3.5 w-3.5" />
                                                                                        Attach Document
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-red-500"
                                                                    onClick={() => handleRemoveLicense(lic.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Operator Dialog */}
            <Dialog open={operatorDialogOpen} onOpenChange={setOperatorDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingOperator ? 'Edit Operator' : 'Add New Operator'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveOperator} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name *</Label>
                                <Input id="companyName" name="companyName" defaultValue={editingOperator?.companyName || ''} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tradingName">Trading Name</Label>
                                <Input id="tradingName" name="tradingName" defaultValue={editingOperator?.tradingName || ''} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactName">Contact Name</Label>
                                <Input id="contactName" name="contactName" defaultValue={editingOperator?.contactName || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Email</Label>
                                <Input type="email" id="contactEmail" name="contactEmail" defaultValue={editingOperator?.contactEmail || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Phone</Label>
                                <Input id="contactPhone" name="contactPhone" defaultValue={editingOperator?.contactPhone || ''} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" defaultValue={editingOperator?.address || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" name="website" defaultValue={editingOperator?.website || ''} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Operator Types</Label>
                            <div className="flex flex-wrap gap-2">
                                {OPERATOR_TYPES.map(t => (
                                    <Button
                                        key={t.value}
                                        type="button"
                                        variant={selectedTypes.includes(t.value) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleType(t.value)}
                                    >
                                        {t.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Entity Type</Label>
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                <button
                                    type="button"
                                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedEntityType === 'LIMITED_COMPANY'
                                            ? 'bg-background shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setSelectedEntityType('LIMITED_COMPANY')}
                                >
                                    🏢 Limited Company
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedEntityType === 'SOLE_TRADER'
                                            ? 'bg-background shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setSelectedEntityType('SOLE_TRADER')}
                                >
                                    👤 Sole Trader
                                </button>
                            </div>
                        </div>

                        {selectedEntityType === 'LIMITED_COMPANY' && (
                        <div className="space-y-2">
                            <Label htmlFor="companiesHouseRef">Companies House Number</Label>
                            <Input id="companiesHouseRef" name="companiesHouseRef" defaultValue={editingOperator?.companiesHouseRef || ''} placeholder="e.g. 12345678" />
                        </div>
                        )}

                        {selectedEntityType === 'SOLE_TRADER' && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm text-amber-800">👤 Sole Trader — two forms of ID required (Photographic ID + Proof of Address). Add these via the Licenses section after creating.</p>
                        </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" name="notes" defaultValue={editingOperator?.notes || ''} rows={2} />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : editingOperator ? 'Save Changes' : 'Create Operator'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add License Dialog */}
            <Dialog open={licenseDialogOpen} onOpenChange={(open) => {
                setLicenseDialogOpen(open)
                if (!open) {
                    setLicenseForOperator(null)
                    setLicenseFile(null)
                    setSelectedLicenseType('PUBLIC_LIABILITY_INSURANCE')
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add License / Certificate</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddLicense} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="licType">License Type *</Label>
                            <select
                                id="licType"
                                name="type"
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={selectedLicenseType}
                                onChange={(e) => setSelectedLicenseType(e.target.value)}
                            >
                                {LICENSE_TYPES.map(lt => (
                                    <option key={lt.value} value={lt.value}>{lt.label}</option>
                                ))}
                            </select>
                        </div>

                        {selectedLicenseType === 'PHOTOGRAPHIC_ID' && (
                        <div className="space-y-2">
                            <Label htmlFor="docSubType">Document Type *</Label>
                            <select
                                id="docSubType"
                                name="reference"
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {PHOTO_ID_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        )}

                        {selectedLicenseType === 'PROOF_OF_ADDRESS' && (
                        <div className="space-y-2">
                            <Label htmlFor="docSubType">Document Type *</Label>
                            <select
                                id="docSubType"
                                name="reference"
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {ADDRESS_PROOF_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        )}

                        {selectedLicenseType !== 'PHOTOGRAPHIC_ID' && selectedLicenseType !== 'PROOF_OF_ADDRESS' && (
                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference / Policy Number</Label>
                            <Input id="reference" name="reference" placeholder="e.g. PLI-2024-001" />
                        </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="licStart">Start Date *</Label>
                                <Input type="date" id="licStart" name="startDate" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licEnd">End Date *</Label>
                                <Input type="date" id="licEnd" name="endDate" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverValue">Cover Value (£)</Label>
                            <Input
                                type="number"
                                step="1"
                                id="coverValue"
                                name="coverValue"
                                placeholder="e.g. 5000000 or 10000000"
                            />
                            <p className="text-xs text-muted-foreground">
                                PLI: £5m minimum (non-food) or £10m minimum (food operators)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licNotes">Notes</Label>
                            <Input id="licNotes" name="notes" placeholder="Optional notes" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licFile">Supporting Document</Label>
                            <Input
                                id="licFile"
                                name="file"
                                type="file"
                                className="text-xs"
                                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                            />
                            {licenseFile && (
                                <div className="flex items-center justify-between text-xs bg-muted/60 p-2 rounded border">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <Paperclip className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                        <span className="font-medium text-foreground truncate">{licenseFile.name}</span>
                                        <span className="text-muted-foreground flex-shrink-0">({(licenseFile.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-xs text-red-500 hover:underline flex-shrink-0 ml-2"
                                        onClick={() => {
                                            setLicenseFile(null)
                                            const input = document.getElementById('licFile') as HTMLInputElement
                                            if (input) input.value = ''
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Upload a copy of the certificate or insurance policy (PDF, JPG, PNG).
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading & Adding...
                                    </>
                                ) : (
                                    'Add License'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
