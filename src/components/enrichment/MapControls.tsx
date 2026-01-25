import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface MapControlsProps {
    types: string[]
    setTypes: (types: string[]) => void
    isManagedOnly: boolean
    setIsManagedOnly: (v: boolean) => void
    highlightGaps: boolean
    setHighlightGaps: (v: boolean) => void
    stats: {
        total: number
        visible: number
        avgScore: number
    }
}

const ALL_TYPES = ['SHOPPING_CENTRE', 'RETAIL_PARK', 'OUTLET_CENTRE', 'HIGH_STREET']

export function MapControls({
    types,
    setTypes,
    isManagedOnly,
    setIsManagedOnly,
    highlightGaps,
    setHighlightGaps,
    stats
}: MapControlsProps) {

    const toggleType = (t: string) => {
        if (types.includes(t)) {
            setTypes(types.filter(x => x !== t))
        } else {
            setTypes([...types, t])
        }
    }

    return (
        <Card className="absolute top-4 right-4 z-[1000] p-4 w-72 bg-white/90 backdrop-blur-sm shadow-xl border-slate-200">
            <div className="space-y-4">
                <div>
                    <h3 className="font-bold text-sm mb-1 text-slate-900">Enrichment Map</h3>
                    <div className="flex gap-2 text-xs text-slate-700 font-medium">
                        <span>{stats.visible} / {stats.total} Locations</span>
                        <span>Avg: {stats.avgScore}%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filters</Label>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="managed"
                            checked={isManagedOnly}
                            onCheckedChange={(c) => setIsManagedOnly(!!c)}
                        />
                        <Label htmlFor="managed" className="text-sm font-medium cursor-pointer text-slate-800">
                            Managed Only (Flourish)
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="gaps"
                            checked={highlightGaps}
                            onCheckedChange={(c) => setHighlightGaps(!!c)}
                        />
                        <Label htmlFor="gaps" className="text-sm font-medium cursor-pointer flex items-center gap-2 text-slate-800">
                            Highlight Data Gaps
                            <Badge variant="destructive" className="h-4 px-1 text-[10px]">!</Badge>
                        </Label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Location Types</Label>
                    {ALL_TYPES.map(t => (
                        <div key={t} className="flex items-center space-x-2">
                            <Checkbox
                                id={`type-${t}`}
                                checked={types.includes(t)}
                                onCheckedChange={() => toggleType(t)}
                            />
                            <Label htmlFor={`type-${t}`} className="text-sm cursor-pointer capitalize text-slate-800">
                                {t.replace('_', ' ').toLowerCase()}
                            </Label>
                        </div>
                    ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Enrichment Score</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500 border border-black/10" />
                            <span>76-100% (Exc)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black/10" />
                            <span>51-75% (Good)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-orange-400 border border-black/10" />
                            <span>26-50% (Fair)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500 border border-black/10" />
                            <span>0-25% (Poor)</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
