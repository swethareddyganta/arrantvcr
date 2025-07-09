"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Search, X } from "lucide-react"
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

interface AddressAutocompleteProps {
  value?: Location
  onChange?: (location: Location) => void
  className?: string
  placeholder?: string
  label?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  className,
  placeholder = "Search for an address...",
  label = "Location"
}: AddressAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize search term from value
  useEffect(() => {
    if (value?.address) {
      setSelectedAddress(value.address)
    }
  }, [value])

  const searchAddresses = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error searching addresses:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchTerm(query)
    setSelectedAddress("")
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
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

  const handleClear = () => {
    setSearchTerm("")
    setSelectedAddress("")
    setResults([])
    setShowResults(false)
    onChange?.(undefined as any)
  }

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Label htmlFor="address-search">{label}</Label>
      <div className="relative mt-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="address-search"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {selectedAddress && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
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
        <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
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

      {/* Selected address display */}
      {selectedAddress && (
        <div className="mt-2 rounded-md bg-muted p-2 text-sm">
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