"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { Location } from '@/types/location'

interface LocationWithDistance extends Location {
  distance?: number
}

interface GoogleMapsProps {
  selectedCentre: Location | null
  distance: number // in miles
  nearbyCentres: LocationWithDistance[]
  className?: string
}

interface MapComponentProps {
  selectedCentre: Location
  distance: number
  nearbyCentres: LocationWithDistance[]
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedCentre, distance, nearbyCentres }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center: {
        lat: selectedCentre.latitude,
        lng: selectedCentre.longitude
      },
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    mapInstanceRef.current = map

    // Create radius circle
    const circle = new google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      map: map,
      center: {
        lat: selectedCentre.latitude,
        lng: selectedCentre.longitude
      },
      radius: distance * 1609.34 // Convert miles to meters
    })

    circleRef.current = circle

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add target location marker
    const targetMarker = new google.maps.Marker({
      position: {
        lat: selectedCentre.latitude,
        lng: selectedCentre.longitude
      },
      map: map,
      title: selectedCentre.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      zIndex: 1000
    })

    // Add info window for target location
    const targetInfoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-sm">${selectedCentre.name}</h3>
          <p class="text-xs text-gray-600">${selectedCentre.city}, ${selectedCentre.county}</p>
          <p class="text-xs text-gray-500">Target Location</p>
        </div>
      `
    })

    targetMarker.addListener('click', () => {
      targetInfoWindow.open(map, targetMarker)
    })

    markersRef.current.push(targetMarker)

    // Add nearby centres markers
    nearbyCentres.forEach((centre, index) => {
      const getLocationColor = (type: string) => {
        switch (type) {
          case 'SHOPPING_CENTRE': return '#64748b' // slate-500
          case 'RETAIL_PARK': return '#f97316' // orange-500
          case 'OUTLET_CENTRE': return '#a855f7' // purple-500
          case 'HIGH_STREET': return '#22c55e' // green-500
          default: return '#6b7280' // gray-500
        }
      }

      const marker = new google.maps.Marker({
        position: {
          lat: centre.latitude,
          lng: centre.longitude
        },
        map: map,
        title: centre.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: getLocationColor(centre.type),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        zIndex: 500
      })

      // Add info window for nearby centres
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">${centre.name}</h3>
            <p class="text-xs text-gray-600">${centre.city}, ${centre.county}</p>
            <p class="text-xs text-gray-500">${centre.type.replace('_', ' ')}</p>
            <p class="text-xs text-gray-500">${centre.distance?.toFixed(1)} miles away</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers and circle
    const bounds = new google.maps.LatLngBounds()
    
    // Add target location
    bounds.extend({
      lat: selectedCentre.latitude,
      lng: selectedCentre.longitude
    })

    // Add nearby centres
    nearbyCentres.forEach(centre => {
      bounds.extend({
        lat: centre.latitude,
        lng: centre.longitude
      })
    })

    // Add circle bounds
    const circleBounds = circle.getBounds()
    if (circleBounds) {
      bounds.union(circleBounds)
    }

    map.fitBounds(bounds)

    // Add some padding to the bounds
    const listener = google.maps.event.addListener(map, 'idle', () => {
      const currentZoom = map.getZoom()
      if (currentZoom && currentZoom > 15) {
        map.setZoom(15)
      }
      google.maps.event.removeListener(listener)
    })

  }, [selectedCentre, distance, nearbyCentres])

  // Update circle radius when distance changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(distance * 1609.34) // Convert miles to meters
    }
  }, [distance])

  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )
    case Status.FAILURE:
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm text-destructive">Failed to load map</p>
            <p className="text-xs text-muted-foreground">Please check your API key</p>
          </div>
        </div>
      )
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
  }
}

export const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  selectedCentre, 
  distance, 
  nearbyCentres, 
  className = "h-64" 
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className={`w-full ${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-sm text-destructive">Google Maps API key not configured</p>
          <p className="text-xs text-muted-foreground">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment</p>
        </div>
      </div>
    )
  }

  if (!selectedCentre) {
    return (
      <div className={`w-full ${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Select a target location to view the map</p>
        </div>
      </div>
    )
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <div className={`w-full ${className}`}>
        <MapComponent 
          selectedCentre={selectedCentre} 
          distance={distance} 
          nearbyCentres={nearbyCentres} 
        />
      </div>
    </Wrapper>
  )
}
