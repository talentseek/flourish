"use client"

import { V2Navigation } from "@/components/v2-navigation"
import { V2Footer } from "@/components/v2-footer"
import { Location } from "@/types/location"
import { LocationDiscoveryStage } from "@/components/dashboard2/location-discovery-stage"
import { AssistantWidget } from "@/components/dashboard2/assistant-widget"
import { RegionalManagerWidget } from "@/components/regional-manager-widget"
import { useRouter } from "next/navigation"

interface PublicLocationPageProps {
    location: Location
    regionalManager?: {
        name: string
        phone?: string
        email?: string
        imageSrc: string
    }
}

export function PublicLocationPage({ location, regionalManager }: PublicLocationPageProps) {
    const router = useRouter()

    const handleCompareClick = () => {
        // Navigate to dashboard2 with location selected and stage 3
        router.push(`/dashboard2?location=${location.id}&stage=3`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <V2Navigation forceSolid={true} useAbsoluteLinks={true} />

            <main className="flex-1 pt-20"> {/* pt-20 to account for fixed navigation */}
                <div className="container mx-auto px-4 py-8">
                    <LocationDiscoveryStage
                        location={location}
                        onCompareClick={handleCompareClick}
                    />
                </div>
            </main>

            <V2Footer />

            {/* Floating Assistant or RM Widget */}
            {regionalManager ? (
                <RegionalManagerWidget {...regionalManager} />
            ) : (
                <AssistantWidget />
            )}
        </div>
    )
}
