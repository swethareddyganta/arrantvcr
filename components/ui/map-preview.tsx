"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"

interface Location {
  lat: number
  lng: number
  address?: string
}

interface MapPreviewProps {
  value?: Location
  onChange?: (location: Location | undefined) => void
}

// Dynamically import map components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

const MapClickHandler = dynamic(
  () => {
    return import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod
      return function MapClickHandler({ onChange }: { onChange?: (location: Location) => void }) {
        const map = useMapEvents({
          click: async (e) => {
            const { lat, lng } = e.latlng
            
            try {
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
    })
  },
  { ssr: false }
)

export function MapPreview({ value, onChange }: MapPreviewProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Import CSS and fix Leaflet icons on client side
    import("leaflet/dist/leaflet.css").then(() => {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })
      })
    })
  }, [])

  if (!isClient) {
    return (
      <div className="rounded-md border border-input overflow-hidden">
        <div className="bg-muted px-3 py-2 text-sm font-medium">
          <MapPin className="inline h-4 w-4 mr-2" />
          Loading map...
        </div>
        <div className="h-64 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-input overflow-hidden">
      <div className="bg-muted px-3 py-2 text-sm font-medium">
        <MapPin className="inline h-4 w-4 mr-2" />
        Click on map to select location
      </div>
      <div className="h-64">
        <MapContainer
          center={value ? [value.lat, value.lng] : [40.7128, -74.0060]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
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
      </div>
    </div>
  )
} 