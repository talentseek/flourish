
"use client"

import { useEffect, useRef, useState, ReactElement } from "react"
import { Wrapper, Status } from "@googlemaps/react-wrapper"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/slug-utils"

interface Location {
    id: string
    name: string
    latitude: number
    longitude: number
    type: string
    city: string
    county: string
}

interface MapProps {
    locations: Location[]
    center?: google.maps.LatLngLiteral
    zoom?: number
}

const render = (status: Status): ReactElement => {
    if (status === Status.FAILURE) return <div className="p-4 text-red-500">Error loading map</div>
    return <div className="p-4">Loading map...</div>
}

function MapComponent({ locations, center, zoom }: MapProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<google.maps.Map>()
    const router = useRouter()

    useEffect(() => {
        if (ref.current && !map) {
            setMap(new window.google.maps.Map(ref.current, {
                center: center || { lat: 54.5, lng: -2.5 }, // UK Center
                zoom: zoom || 6,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                    },
                ],
            }))
        }
    }, [ref, map, center, zoom])

    useEffect(() => {
        if (map && locations.length > 0) {
            // SVG for Building2 icon with color #4D4A46 fill and white stroke
            const iconSvg = encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4D4A46" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                    <path d="M10 6h4"/>
                    <path d="M10 10h4"/>
                    <path d="M10 14h4"/>
                    <path d="M10 18h4"/>
                </svg>
            `.trim());

            const icon = {
                url: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32), // Bottom center? Actually icon is square-ish. Center might be better or bottom.
                // Building2 is a building, so bottom center makes sense for "standing" on the map.
            };

            const infoWindow = new window.google.maps.InfoWindow();

            locations
                .filter(loc => loc.latitude && loc.longitude)
                .forEach((loc) => {
                    const marker = new window.google.maps.Marker({
                        position: { lat: Number(loc.latitude), lng: Number(loc.longitude) },
                        map,
                        title: loc.name,
                        icon: icon,
                    })

                    marker.addListener("click", () => {
                        const slug = generateSlug(loc.name)

                        // Create content for InfoWindow
                        const contentString = `
                            <div style="padding: 8px; font-family: sans-serif;">
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #4D4A46;">${loc.name}</h3>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${loc.city}, ${loc.county}</p>
                                <a href="/locations/${slug}" style="display: inline-block; padding: 6px 12px; background-color: #4D4A46; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">View Details</a>
                            </div>
                        `;

                        infoWindow.setContent(contentString);
                        infoWindow.open(map, marker);
                    })
                })

            // Close info window when clicking on map
            map.addListener("click", () => {
                infoWindow.close();
            });
        }
    }, [map, locations, router])

    return <div ref={ref} className="w-full h-[600px] rounded-xl shadow-lg" />
}

export function V2LocationsMap({ locations }: { locations: Location[] }) {
    return (
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} render={render}>
            <MapComponent locations={locations} />
        </Wrapper>
    )
}
