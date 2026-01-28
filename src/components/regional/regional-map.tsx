'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix Leaflet default icon issue in Next.js
// Must be done before any markers render
const icon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Location {
    id: string;
    name: string;
    city: string;
    latitude: number | { toNumber(): number } | null;
    longitude: number | { toNumber(): number } | null;
    footfall: number | null;
}

export default function RegionalMap({ locations }: { locations: Location[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />;
    }

    // Filter locations with valid coordinates
    const validLocations = locations.filter(
        loc => loc.latitude && loc.longitude &&
            !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude))
    );

    // Calculate center based on valid locations or default to UK
    const center: [number, number] = validLocations.length > 0
        ? [Number(validLocations[0].latitude), Number(validLocations[0].longitude)]
        : [51.5, -0.1]; // London fallback

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <MapContainer
                center={center}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validLocations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[Number(loc.latitude), Number(loc.longitude)]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="font-sans min-w-[150px]">
                                <h3 className="font-bold text-sm">{loc.name}</h3>
                                <p className="text-xs text-gray-500">{loc.city}</p>
                                <p className="text-xs mt-1">
                                    Footfall: {loc.footfall ? `${(loc.footfall / 1000000).toFixed(1)}m` : 'N/A'}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
