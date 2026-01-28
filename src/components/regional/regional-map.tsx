'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for Leaflet icons in Next.js
const customIcon = new Icon({
    iconUrl: '/markers/marker-icon.png', // Ensure this exists or use CDN
    iconRetinaUrl: '/markers/marker-icon-2x.png',
    shadowUrl: '/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
// Fallback if local assets don't exist, use CDN in a useEffect or similar, 
// but for now let's use standard CDN links if local fails, or assume they are there.
// Actually, standard leaflet imports often fail in SSR. We need a dynamic import in the parent or handle it here.

export default function RegionalMap({ locations }: { locations: any[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fix default icon issues
        import('leaflet').then((L) => {
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        });
    }, []);

    if (!isMounted) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />;

    // Calculate center based on first location or default to UK center
    const center = locations.length > 0
        ? [locations[0].latitude, locations[0].longitude]
        : [54.5, -4]; // UK Center

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm z-0">
            <MapContainer
                center={center as [number, number]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => (
                    (loc.latitude && loc.longitude) && (
                        <Marker key={loc.id} position={[Number(loc.latitude), Number(loc.longitude)]}>
                            <Popup>
                                <div className="font-sans">
                                    <h3 className="font-bold text-sm">{loc.name}</h3>
                                    <p className="text-xs text-gray-500">{loc.city}</p>
                                    <p className="text-xs mt-1">Footfall: {loc.footfall?.toLocaleString() || 'N/A'}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}
