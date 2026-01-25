import dynamic from 'next/dynamic'

const EnrichmentMap = dynamic(() => import('@/components/enrichment/EnrichmentMap'), {
    ssr: false,
    loading: () => <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500">Loading Map...</div>
})

export default function EnrichmentMapPage() {
    return (
        <main className="h-screen w-full overflow-hidden">
            <EnrichmentMap />
        </main>
    )
}
