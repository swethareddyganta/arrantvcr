"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Search, X, Map } from "lucide-react"
import { MapPreview } from "@/components/ui/map-preview"
import { cn } from "@/lib/utils"

interface AddressResult {
  display_name: string
  lat: string
  lon: string
  type: string
}

interface Location {
  lat: number
  lng: number
  address?: string
}

interface LocationSelectorProps {
  value?: Location
  onChange?: (location: Location | undefined) => void
  className?: string
  placeholder?: string
  label?: string
}



export function LocationSelector({
  value,
  onChange,
  className,
  placeholder = "Search for an address...",
  label = "Location"
}: LocationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState("")
  const [showMap, setShowMap] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize search term from value
  useEffect(() => {
    if (value?.address) {
      setSelectedAddress(value.address)
      setSearchTerm(value.address)
    } else {
      setSelectedAddress("")
      setSearchTerm("")
    }
  }, [value])

  const searchAddresses = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setResults(data)
      // Show results if we have any
      if (data.length > 0) {
        setShowResults(true)
      } else {
        setShowResults(false)
      }
    } catch (error) {
      console.error("Error searching addresses:", error)
      setResults([])
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchTerm(query)
    
    // Clear selection when user starts typing
    if (selectedAddress && query !== selectedAddress) {
      setSelectedAddress("")
      onChange?.(undefined)
    }
    
    // Clear results immediately when user starts typing
    if (query.trim() === "") {
      setResults([])
      setShowResults(false)
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(query)
    }, 300)
  }

  const handleResultClick = (result: AddressResult) => {
    const location: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    }
    
    setSelectedAddress(result.display_name)
    setSearchTerm(result.display_name)
    setResults([])
    setShowResults(false)
    onChange?.(location)
  }

  const handleMapLocationSelect = (location: Location) => {
    setSelectedAddress(location.address || `${location.lat}, ${location.lng}`)
    setSearchTerm(location.address || `${location.lat}, ${location.lng}`)
    onChange?.(location)
  }

  const handleClear = () => {
    setSearchTerm("")
    setSelectedAddress("")
    setResults([])
    setShowResults(false)
    onChange?.(undefined)
  }

  const handleFocus = () => {
    // Show results if we have them, or trigger search if user has typed something
    if (results.length > 0) {
      setShowResults(true)
    } else if (searchTerm.trim()) {
      // If user has typed something but no results yet, trigger search
      searchAddresses(searchTerm)
    }
  }

  const handleBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      setShowResults(false)
    }, 200)
  }

  const toggleMap = () => {
    setShowMap(!showMap)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Label htmlFor="address-search">{label}</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
              id="address-search"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="pl-10 pr-20"
            />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleMap}
              className="h-6 w-6 p-0"
              title="Toggle map view"
            >
              <Map className="h-4 w-4" />
            </Button>
            {selectedAddress && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {selectedAddress && (
            <div className="absolute left-10 top-1/2 -translate-y-1/2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-muted-foreground">
            Searching...
          </div>
        )}

        {/* Results dropdown */}
        {showResults && results.length > 0 && !isLoading && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-lg max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleResultClick(result)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
              >
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{result.display_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {result.type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {showResults && results.length === 0 && !isLoading && searchTerm.trim() && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background p-3 text-sm text-muted-foreground">
            No locations found for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Map preview */}
      {showMap && isClient && (
        <MapPreview value={value} onChange={handleMapLocationSelect} />
      )}

      {/* Selected address display */}
      {selectedAddress && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Selected Location:</span>
          </div>
          <p className="mt-1 text-muted-foreground">{selectedAddress}</p>
          {value && (
            <p className="mt-1 text-xs text-muted-foreground">
              Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </p>
          )}
        </div>
      )}
    </div>
  )
} 