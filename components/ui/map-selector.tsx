"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { cn } from "@/lib/utils"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface Location {
  lat: number
  lng: number
  address?: string
}

interface MapSelectorProps {
  value?: Location
  onChange?: (location: Location) => void
  className?: string
  height?: string
  placeholder?: string
}

function MapClickHandler({ onChange }: { onChange?: (location: Location) => void }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      
      try {
        // Reverse geocoding using Nominatim (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        onChange?.({
          lat,
          lng,
          address
        })
      } catch (error) {
        console.error("Error getting address:", error)
        onChange?.({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        })
      }
    },
  })

  return null
}

export function MapSelector({
  value,
  onChange,
  className,
  height = "400px",
  placeholder = "Click on the map to select location"
}: MapSelectorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center border border-input bg-muted text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        <p className="text-sm">{placeholder}</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <MapContainer
        center={value ? [value.lat, value.lng] : [40.7128, -74.0060]} // Default to NYC
        zoom={13}
        style={{ height, width: "100%" }}
        className="rounded-md border border-input"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {value && (
          <Marker position={[value.lat, value.lng]} />
        )}
        <MapClickHandler onChange={onChange} />
      </MapContainer>
      
      {value?.address && (
        <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-md p-2 text-xs">
          <p className="font-medium">Selected Location:</p>
          <p className="text-muted-foreground">{value.address}</p>
        </div>
      )}
    </div>
  )
} 